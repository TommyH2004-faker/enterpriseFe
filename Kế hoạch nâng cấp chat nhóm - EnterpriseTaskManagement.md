# Kế hoạch nâng cấp chat nhóm - EnterpriseTaskManagement

Phạm vi: Frontend `D:\FeManagement` và Backend `D:\EnterpriseTaskManagement`. Căn cứ: các file trong `chat-context.txt` và 4 file đã gửi trước đó.

## 1. Hợp đồng chung BE–FE (hai bên phải khớp)

Mọi chỗ dưới đây là điểm mà Backend và Frontend phải hiểu giống nhau; lệch một dòng là lỗi chạy thật. Hai phần sau (Backend, Frontend) chỉ liệt kê việc để đạt đúng hợp đồng này.

### 1.1 Giá trị cố định

| Mục | Giá trị | Ghi chú |
| --- | --- | --- |
| Vai trò thành viên | `Owner = 1`, `Administrator = 2`, `Member = 3` | Backend trả `role` trong `members[]`. FE chuẩn hóa cả số lẫn chuỗi, không nhận ra thì coi là Member |
| Loại hội thoại | `Direct = 1`, `Group = 2`, `Project = 3`, `Department = 4` |  |
| Số thành viên | Backend không trả `memberCount` trong detail | FE tự đếm thành viên `isActive` |
| Rời nhóm | `DELETE /{id}/members/{userId}` với userId là chính mình | Không cần endpoint riêng |
| Xóa nhóm (D1) | `POST /{id}/archive`, chỉ Owner | Nhóm lưu trữ biến khỏi danh sách mọi người |
| `PUT /{id}` | Body `{ name, description, avatarUrl }` | **Hiện ghi đè cả mô tả và avatar**: gửi thiếu trường nào là trường đó về null (Backend sửa ở B1). Đến khi sửa xong, FE luôn gửi kèm giá trị hiện tại của trường còn lại |

### 1.2 Ma trận quyền (theo `Conversation.cs`)

| Thao tác | Owner | Administrator | Member | Ghi chú |
| --- | --- | --- | --- | --- |
| Thêm thành viên | Có | Có | Không | Không áp dụng chat 1-1, nhóm đã lưu trữ; tối đa 200 người |
| Xóa Member | Có | Có | Không |  |
| Xóa Administrator | Có | Không | Không | Lỗi `InsufficientRole` |
| Xóa Owner | Không | Không | Không | Lỗi `CannotModifyOwner` |
| Rời nhóm | Có | Có | Có | Owner rời thì tự chuyển Owner cho Admin vào sớm nhất, không có Admin thì cho người vào sớm nhất |
| Đổi tên, mô tả, avatar | Có | Có | Không |  |
| Đổi vai trò Admin/Member | Có | Không | Không | Không đặt được Owner qua API này |
| Chuyển quyền Owner | Có | Không | Không | Owner cũ thành Administrator |
| Lưu trữ nhóm | Có | Không | Không |  |
| Ẩn hội thoại (`DELETE /{id}`) | Mọi người |  |  | Chỉ ẩn với riêng mình, không phải xóa nhóm |

FE ẩn nút theo bảng này để người dùng khỏi bấm nhầm; Backend vẫn là bên chặn quyền cuối cùng.

### 1.3 Event SignalR (hợp đồng mới)

| Event | Gửi tới | Payload | FE làm gì |
| --- | --- | --- | --- |
| `ConversationUpdated` (giữ tên cũ) | Mọi thành viên active của nhóm | `{ conversationId, reason }` | Nạp lại danh sách; nếu đang mở nhóm đó thì làm mới detail |
| `ConversationMemberRemoved` (mới) | Người bị xóa hoặc vừa rời | `{ conversationId, reason }` | Đóng nhóm đang mở, xóa khỏi danh sách, báo thông báo, gọi `LeaveConversation` |
| `ConversationDeleted` (đã có) | Mọi thành viên khi lưu trữ; chính user khi ẩn | `conversationId` | Giống dòng trên (không cần thông báo khi chính mình ẩn) |

`reason` là giá trị cố định: `member_added`, `member_removed`, `role_changed`, `owner_transferred`, `info_updated`. Giữ `ConversationUpdated` làm event chung để FE hiện tại không bị phá: handler cũ vốn đã tự nạp lại danh sách khi payload không đúng dạng list item.

### 1.4 Quyết định đã giả định (đổi được trước khi làm bước liên quan)

| # | Vấn đề | Giả định |
| --- | --- | --- |
| D1 | Xóa nhóm | Dùng archive (Owner), nút tên "Giải tán nhóm". Không thêm endpoint xóa cứng |
| D2 | Chặn người bị xóa nhận tin | Cách chuẩn: Backend theo dõi connection theo user và gỡ khỏi group. Chỉ đúng khi chạy một instance server |
| D3 | Chat Project, Department | Chỉ loại Group được thêm/xóa thành viên và đổi vai trò. Project/Department chỉ xem thông tin và rời nhóm |
| D4 | Tin nhắn hệ thống ("A đã thêm B") | Làm sau cùng, tùy chọn |

## 2. Phần Backend (`D:\EnterpriseTaskManagement`)

Backend cần sửa 9 chỗ. Không bước nào đổi cấu trúc dữ liệu hay route cũ; chỉ sửa lỗi, thêm event và thêm cơ chế gỡ kết nối.

### 2.1 Đã đúng, giữ nguyên

- Toàn bộ quy tắc quyền trong `Conversation.cs` (mục 1.2) và các route `members`, `role`, `transfer-ownership`, `archive`, `PUT /{id}`.
- `ConversationDetail` đã trả `Role`, `IsActive`, `JoinedAt` cho từng thành viên.
- `ConversationDeleted` đã có trong `SignalRChatRealtimeNotifier`.

### 2.2 Lỗi và thiếu sót ở Backend

| # | Vấn đề | Mức độ |
| --- | --- | --- |
| P1 | Người bị xóa khỏi nhóm vẫn nằm trong SignalR group `conversation:{id}` của kết nối đang mở, nên vẫn nhận `MessageReceived` cho tới khi ngắt kết nối. `JoinConversation` có kiểm tra thành viên nhưng kết nối cũ không bị đá ra | Cao (bảo mật) |
| P2 | `UpdateInfo` gán cả `Description` và `AvatarUrl`: chỉ gửi mô tả thì avatar về null và ngược lại. Mô tả quá dài trả lỗi `InvalidName` (sai ngữ nghĩa) | Cao (mất dữ liệu) |
| P3 | `AddMembers`, `RemoveMember`, `UpdateConversation`, `ChangeMemberRole`, `TransferOwnership`, `Archive` đều không phát event. `IChatNotifier.MemberEventAsync` đã khai báo nhưng không handler nào gọi | Cao (không đồng bộ) |
| P4 | `UpdateConversationCommandHandler` không ghi audit (các handler quản lý nhóm khác đều có) | Thấp |
| P5 | Cần xác minh: `ConversationMember.Rejoin()` có bỏ cờ `IsHidden` không (người từng ẩn nhóm rồi được thêm lại có thấy nhóm không); `MemberCount` trong danh sách có chỉ đếm thành viên active không; enum `Role` serialize ra số hay chuỗi | Cần xác minh |

### 2.3 Việc phải làm (mỗi lần một file, build và chạy thử sau mỗi file)

| Bước | File | Việc | Xử lý | FE cần biết |
| --- | --- | --- | --- | --- |
| B1 | `Domain/Entities/Communication/Conversation.cs`, `Domain/common/Results/Errors/ChatErrors.cs` | `UpdateInfo`: chỉ cập nhật trường nào được gửi, null thì giữ nguyên. Thêm lỗi riêng cho mô tả quá dài | P2 | Sau bước này FE có thể bỏ việc gửi kèm trường còn lại |
| B2 | `Application/Repositories/IChatNotifier.cs`, `API/Hubs/ChatNotifier.cs` | Thêm phương thức phát event nhóm cho từng user (qua group `user:{id}`) và phương thức gỡ user khỏi group `conversation:{id}` | P1, P3 | Tên event và payload theo mục 1.3 |
| B3 | Mới: `ChatConnectionTracker` (hoặc tên tương đương), `API/Hubs/ChatHub.cs`, đăng ký DI | Lưu `userId → connectionIds` trong `OnConnectedAsync` / `OnDisconnectedAsync` để B2 gỡ đúng kết nối. Đăng ký singleton. Chỉ đúng khi chạy một instance server; nếu scale ngang cần phương án khác | P1 | Không |
| B4 | `Features/Chat/Commands/AddMembers/AddMembersCommandHandler.cs` | Sau `SaveChanges`: phát `ConversationUpdated` (`reason: member_added`) cho người mới và thành viên cũ | P3 | Người mới thấy nhóm xuất hiện ở danh sách |
| B5 | `Features/Chat/Commands/RemoveMember/RemoveMemberCommandHandler.cs` | Sau `SaveChanges`: phát `ConversationMemberRemoved` cho người bị xóa/rời, gỡ khỏi group; phát `ConversationUpdated` (`member_removed`) cho thành viên còn lại. Nếu người rời là Owner thì thêm `reason: owner_transferred` hoặc gửi thêm event vai trò mới | P1, P3 | Người bị xóa bị đóng nhóm tự động |
| B6 | `Features/Chat/Commands/UpdateConversation/UpdateConversationCommandHandler.cs` | Thêm audit và phát `ConversationUpdated` (`info_updated`) cho mọi thành viên active | P3, P4 | Header và thông tin nhóm tự đổi |
| B7 | `ChangeMemberRoleCommandHandler.cs`, `TransferOwnershipCommandHandler.cs` | Phát `ConversationUpdated` (`role_changed`, `owner_transferred`) cho mọi thành viên active | P3 | Menu quyền tự đổi theo vai trò mới |
| B8 | `Features/Chat/Commands/ArchiveConversation/ArchiveConversationCommandHandler.cs` | Phát `ConversationDeleted` cho mọi thành viên, gỡ khỏi group | P1, P3 | Nhóm biến khỏi danh sách mọi người |
| B9 | Tùy chọn (D4) | Sinh tin nhắn `MessageType.System` khi thêm, xóa, rời, đổi tên |  | Cần F11 |

### 2.4 Quy ước Backend phải giữ để FE không vỡ

- Không đổi tên hay kiểu của trường đang có trong `ConversationDetail`, `ConversationListItem`, `MessageListItem`.
- Không bỏ hay đổi tên event cũ (`MessageReceived`, `ConversationUpdated`, `UnreadChanged`, `ReactionChanged`, `ConversationDeleted`).
- Payload mới của `ConversationUpdated` (`{ conversationId, reason }`) không có `lastActivityAt` và `unreadCount`, nên handler FE cũ sẽ tự rơi vào nhánh nạp lại danh sách, không làm hỏng danh sách.
- Lỗi trả về giữ dạng hiện tại của `HandleResult`; FE sẽ trích mô tả tiếng Việt từ đó (cần file `ApiController.cs` để chốt định dạng).

## 3. Phần Frontend (`D:\FeManagement`)

Frontend làm được Giai đoạn 2, 3, 4 mà không cần Backend sửa: sau mỗi thao tác thành công, FE gọi lại `GET /api/v1/conversations/{id}` để làm mới thành viên. Chỉ F10 (đồng bộ realtime) phải chờ Backend.

### 3.1 Đã làm

| Bước | File | Kết quả |
| --- | --- | --- |
| F1 | `ChatHeader.tsx` | Header riêng cho chat cá nhân và nhóm, nút thông tin nhóm qua prop `onOpenInfo`. Chờ bạn xác nhận hiển thị |
| F2 | `chatService.ts` | Thêm enum `ConversationMemberRole`; `role`, `joinedAt` cho thành viên; `UpdateConversationRequest`; chuẩn hóa `role`; 7 method mới: `addMembers`, `removeMember`, `leaveConversation`, `updateConversation`, `changeMemberRole`, `transferOwnership`, `archiveConversation`. Chờ chạy `tsc` và xác nhận |

### 3.2 Vấn đề phía Frontend

| # | Vấn đề | Mức độ | Xử lý ở |
| --- | --- | --- | --- |
| Q1 | `ConversationUpdated` hiện chỉ làm mới danh sách bên trái, không làm mới `active` đang mở nên danh sách thành viên bị cũ | Trung bình | F5, F10 |
| Q2 | `Messages.tsx` lọc `members` theo `isActive` rồi dùng cho `nameOf`, nên tin nhắn cũ của người đã rời hiện "Thành viên" | Trung bình | F8 |
| Q3 | `errorText` dùng `e.message`; với lỗi Axios là "Request failed with status code 403", không phải mô tả tiếng Việt của Backend (`NotManager`, `OnlyOwner`...) | Trung bình | F5 (cần `axiosClient.ts`, `ApiController.cs`) |
| Q4 | Chưa nghe `ConversationDeleted` | Thấp | F5 |
| Q5 | `useChat.ts` cleanup gọi `connection.onreconnected(onReconnected)` (đăng ký thêm, không hủy) | Thấp | F5 |
| Q6 | `ChatHeader` đếm thành viên active vì detail không có `memberCount` | Thấp | Đã xử lý ở F1 |

### 3.3 Việc còn lại (mỗi lần một file, kiểm tra TypeScript sau mỗi file)

| Bước | File | Việc | Chờ Backend |
| --- | --- | --- | --- |
| F3 | `utils/groupPermissions.ts` (mới) | Hàm thuần tính quyền từ vai trò của mình và vai trò đối tượng: `canAddMembers`, `canRemove`, `canRename`, `canChangeRole`, `canTransferOwner`, `canArchive`, `canLeave`. Phản chiếu đúng mục 1.2; chat 1-1 và (theo D3) Project/Department bị giới hạn | Không |
| F4 | `ConfirmDeleteModal.tsx` | Thêm prop tùy chọn (tiêu đề, nội dung, nhãn nút xác nhận); giữ mặc định cũ để chức năng ẩn hội thoại không đổi | Không |
| F5 | `useChat.ts` (đợt 1) | `refreshActive` (gọi lại `getConversation`, cập nhật `active`); action quản lý nhóm trả về chuỗi lỗi hoặc `null` (cùng kiểu `createGroup`, `deleteConversation`) và gọi `refreshActive` + `loadConversations` sau khi thành công; xử lý khi chính mình rời hoặc bị xóa; trích thông báo tiếng Việt từ response Backend; đăng ký `ConversationDeleted`; bỏ dòng cleanup sai | Không |
| F6 | `GroupInfoModal.tsx` (mới) | Giai đoạn 2, 3, 4: tên, mô tả, số thành viên, avatar; danh sách thành viên kèm huy hiệu Owner/Admin/Member; menu thao tác theo quyền (xóa, đổi vai trò, chuyển Owner); sửa tên và mô tả; nút Rời nhóm; nút Giải tán nhóm (Owner). Mọi thao tác quan trọng qua `ConfirmDeleteModal`. Khi cập nhật mô tả hoặc avatar luôn gửi kèm giá trị hiện tại của trường còn lại (đến khi Backend xong B1) | Không |
| F7 | `AddMembersModal.tsx` (mới) | Chọn nhân viên (dùng lại `useEmployeeSearch`, theo mẫu `CreateGroupModal`); ẩn người đã là thành viên active; hiển thị giới hạn 200 người | Không |
| F8 | `Messages.tsx` | Tách `allMembers` (hiện tên, sửa Q2) và `activeMembers` (tag, đếm); tính `myRole`; truyền `onOpenInfo` cho `ChatHeader`; nối hai modal; xóa 3 dòng `console.log` debug | Không |
| F9 | `scss/chat.scss` | Style huy hiệu vai trò, danh sách thành viên, modal, nút trong header | Không |
| F10 | `useChat.ts` (đợt 2) | Giai đoạn 5: nghe `ConversationUpdated` (đọc `reason`, `conversationId`) và `ConversationMemberRemoved`; khi nhóm đang mở thì `refreshActive`; khi bị xóa thì đóng nhóm, gọi `LeaveConversation`, báo thông báo | **B2 – B8** |
| F11 | `MessageItem.tsx`, `MessageList.tsx` | Hiển thị tin nhắn System (chỉ nếu làm D4) | B9 |

### 3.4 Quy ước Frontend phải giữ để Backend không phải đổi

- Không đổi route, tên trường gửi lên của chức năng chat hiện tại (gửi tin, upload, reaction, ẩn hội thoại).
- Chuẩn hóa `role` phòng khi Backend trả chuỗi; không phụ thuộc cấu hình JSON phía Backend.
- Nút quản lý ẩn theo quyền, nhưng mọi thao tác vẫn gọi Backend và hiển thị đúng thông báo lỗi nếu bị từ chối.

## 4. Thứ tự phối hợp hai bên

Frontend đi trước vì không phụ thuộc Backend; hai lỗi Backend nghiêm trọng (B1, và B2–B3–B5 cho P1) chạy song song để khỏi chờ nhau. F10 là điểm hai bên gặp nhau.

| Giai đoạn | Frontend | Backend | Điều kiện sang giai đoạn sau |
| --- | --- | --- | --- |
| 0. Xác minh | Chạy `tsc` cho F2; xác nhận F1 | Trả lời P5 (Rejoin, MemberCount, kiểu serialize `role`) | Không có lỗi TypeScript; biết `role` là số hay chuỗi |
| 1. Nền tảng FE | F3 → F4 → F5 | B1 (lỗi ghi đè avatar/mô tả) | `tsc` sạch; B1 build được |
| 2. Giao diện quản lý nhóm | F6 → F7 → F8 → F9 | B2 → B3 (chuẩn bị gỡ kết nối) | Có thể thêm, xóa, rời, đổi tên, đổi vai trò, giải tán bằng hai tài khoản (chưa realtime) |
| 3. Đồng bộ realtime | F10 | B4 → B5 → B6 → B7 → B8 | Hai tài khoản thấy thay đổi của nhau không cần tải lại; người bị xóa không nhận tin |
| 4. Tùy chọn | F11 | B9 | Chỉ khi bạn chọn làm D4 |

Cách phối hợp từng bước giữa hai bên: Backend xong mỗi file thì báo tên event và payload thực tế; Frontend đối chiếu với mục 1.3 trước khi viết F10. Nếu Backend phải đổi hợp đồng, sửa mục 1 của tài liệu này trước rồi mới sửa code.

## 5. Kiểm thử chung

| Nhóm | Nội dung | Kiểm bên |
| --- | --- | --- |
| Chat 1-1 | Không thấy nút thông tin nhóm. Gửi tin, trả lời, đính kèm, reaction, mention, ẩn hội thoại vẫn bình thường | FE |
| Tạo nhóm | Người tạo là Owner, danh sách thành viên đúng | FE + BE |
| Quyền | Với từng vai trò Owner, Administrator, Member: nút nào hiện, thao tác nào bị Backend từ chối. Admin không xóa được Admin khác, không ai xóa được Owner | FE + BE |
| Rời nhóm | Member rời; Owner rời thì quyền chuyển đúng người theo luật Backend; nhóm không còn ai thì bị lưu trữ | FE + BE |
| Thêm lại người đã rời | Thấy lại nhóm; thử cả người từng ẩn nhóm (P5) | BE |
| Chỉnh thông tin | Sửa mô tả không làm mất avatar và ngược lại (P2); mô tả quá dài báo đúng lỗi | BE |
| Hai tài khoản đồng thời | Thêm, xóa, rời, đổi tên, đổi vai trò, chuyển Owner, giải tán ở máy A thì máy B tự cập nhật không cần tải lại | FE + BE |
| Bảo mật | Sau khi bị xóa, tài khoản đó không nhận thêm tin nhắn mới của nhóm (P1) | BE |
| Hiển thị tên | Tin nhắn cũ của người đã rời vẫn hiện đúng tên (Q2) | FE |
| Thông báo lỗi | Thao tác bị từ chối hiện mô tả tiếng Việt từ Backend (Q3) | FE |
| Hồi quy | Reconnect SignalR, đếm chưa đọc, danh sách hội thoại và tìm kiếm không đổi hành vi | FE + BE |

Tiêu chí hoàn thành: giao diện chat cá nhân và nhóm phân biệt rõ; thao tác đúng ma trận quyền; hai tài khoản đồng bộ chính xác; người bị xóa không nhận tin; các chức năng gửi tin, trả lời, đính kèm, reaction hiện tại không lỗi.

## 6. Việc cần từ bạn

1. Chạy `npx tsc --noEmit` cho F2 (`chatService.ts`) và báo lỗi nếu có.
2. Mở một nhóm, xem response của `GET /api/v1/conversations/{id}` trong tab Network: `role` là số (`1`) hay chuỗi (`"Owner"`).
3. Xác nhận `ChatHeader.tsx` (F1) hiển thị đúng.
4. Gửi thêm 3 file để chốt Q3 và P5: `ApiController.cs`, `axiosClient.ts`, và đoạn cấu hình JSON (kiểu serialize enum) trong `Program.cs`.
5. Đổi giả định D1–D4 ở mục 1.4 nếu không đồng ý.

Sau khi bạn xác nhận, bước tiếp theo là **F3: `utils/groupPermissions.ts`**.
