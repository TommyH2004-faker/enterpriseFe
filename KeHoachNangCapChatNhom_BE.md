# Kế hoạch chi tiết nâng cấp Backend (`D:\EnterpriseTaskManagement`)

Căn cứ theo tài liệu gốc `Kế hoạch nâng cấp chat nhóm - EnterpriseTaskManagement.md` và mã nguồn thực tế đã hoàn thiện ở Frontend `D:\FeManagement`.

---

## 1. Khớp Hợp đồng SignalR & Dữ liệu giữa BE và FE

| Event SignalR | Người nhận | Payload Backend gửi | Frontend đã xử lý tương ứng |
| :--- | :--- | :--- | :--- |
| **`ConversationUpdated`** | Mọi thành viên active của nhóm | `{ conversationId, reason }` *(reason: `member_added`, `member_removed`, `info_updated`, `role_changed`, `owner_transferred`)* | FE tự nạp lại danh sách (`loadConversations`); nếu nhóm đang mở trùng `conversationId` thì tự gọi `refreshActive()` cập nhật tên/avatar/thành viên. |
| **`ConversationMemberRemoved`** | Người bị xóa hoặc vừa rời nhóm | `{ conversationId, reason }` *(reason: `removed`, `self_left`)* | FE tự đóng khung chat, xóa nhóm khỏi danh sách, hủy kết nối group, và hiển thị thông báo toast: *"Bạn đã bị xóa khỏi nhóm chat này."* |
| **`ConversationDeleted`** | Mọi thành viên active khi nhóm bị giải tán (Archive) | `conversationId` | FE tự đóng khung chat, xóa khỏi danh sách, báo toast: *"Nhóm chat đã được giải tán hoặc lưu trữ."* |

---

## 2. Danh sách 8 bước triển khai Backend

### Bước B1: Sửa hàm `UpdateInfo` và thêm mã lỗi `DescriptionTooLong`
- **Mục tiêu**: Khắc phục lỗi P2 (ghi đè `null` khi chỉ cập nhật mô tả hoặc avatar) và trả mã lỗi đúng ngữ nghĩa khi mô tả vượt quá độ dài.
- **File cần sửa**:
  1. `EnterpriseTaskManagement.Domain/Common/Results/Errors/ChatErrors.cs`:
     - Thêm lỗi:
       ```csharp
       public static readonly Error DescriptionTooLong =
           new("Chat.DescriptionTooLong", "Mô tả cuộc trò chuyện vượt quá độ dài cho phép.", ErrorType.Validation);
       ```
  2. `EnterpriseTaskManagement.Domain/Entities/Communication/Conversation.cs`:
     - Sửa hàm `UpdateInfo`:
       ```csharp
       public Result UpdateInfo(
           Guid actorUserId,
           string? description,
           string? avatarUrl)
       {
           if (IsDirect)
               return Result.Failure(ChatErrors.NotApplicableToDirect);

           if (!IsManager(actorUserId))
               return Result.Failure(ChatErrors.NotManager);

           // Nếu description được truyền vào (khác null): kiểm tra độ dài và cập nhật; nếu null thì giữ nguyên giá trị cũ
           if (description is not null)
           {
               var desc = description.Trim();
               if (desc.Length > DescriptionMaxLength)
                   return Result.Failure(ChatErrors.DescriptionTooLong); // Sửa từ InvalidName thành DescriptionTooLong

               Description = string.IsNullOrEmpty(desc) ? null : desc;
           }

           // Nếu avatarUrl được truyền vào (khác null): cập nhật; nếu null thì giữ nguyên giá trị cũ
           if (avatarUrl is not null)
           {
               AvatarUrl = string.IsNullOrWhiteSpace(avatarUrl) ? null : avatarUrl.Trim();
           }

           return Result.Success();
       }
       ```

---

### Bước B2: Quản lý kết nối SignalR (`ChatConnectionTracker`) & Gỡ kết nối (P1)
- **Mục tiêu**: Khắc phục lỗi bảo mật P1 (người bị xóa vẫn nằm trong SignalR group `conversation:{id}` của kết nối đang mở, nên vẫn nhận tin nhắn realtime cho tới khi ngắt kết nối).
- **File tạo mới**:
  - `EnterpriseTaskManagement.API/Hubs/IChatConnectionTracker.cs` & `ChatConnectionTracker.cs`:
    - Quản lý `ConcurrentDictionary<Guid, HashSet<string>>` ánh xạ `userId -> connectionIds`.
    - Phương thức: `Add(userId, connectionId)`, `Remove(userId, connectionId)`, `GetConnections(userId)`.
- **File sửa**:
  1. `EnterpriseTaskManagement.API/Hubs/ChatHub.cs`:
     - Inject `IChatConnectionTracker`.
     - `OnConnectedAsync`: gọi `_tracker.Add(userId, Context.ConnectionId)`.
     - `OnDisconnectedAsync`: gọi `_tracker.Remove(userId, Context.ConnectionId)`.
  2. `EnterpriseTaskManagement.API/Program.cs`:
     - Đăng ký: `builder.Services.AddSingleton<IChatConnectionTracker, ChatConnectionTracker>();`

---

### Bước B3: Nâng cấp `IChatNotifier` & `ChatNotifier`
- **Mục tiêu**: Cung cấp các hàm phát event SignalR cho nhóm, cho cá nhân, và phương thức gỡ user khỏi SignalR group.
- **File cần sửa**:
  1. `EnterpriseTaskManagement.Application/Repositories/IChatNotifier.cs`:
     - Bổ sung các phương thức:
       ```csharp
       // Gửi ConversationUpdated tới danh sách user active
       Task ConversationUpdatedAsync(Guid conversationId, IEnumerable<Guid> recipientUserIds, string reason, CancellationToken cancellationToken = default);

       // Gửi ConversationMemberRemoved tới user bị xóa/rời và gỡ khỏi group
       Task ConversationMemberRemovedAsync(Guid userId, Guid conversationId, string reason, CancellationToken cancellationToken = default);

       // Gửi ConversationDeleted tới mọi thành viên và gỡ khỏi group
       Task ConversationDeletedAsync(Guid conversationId, IEnumerable<Guid> recipientUserIds, CancellationToken cancellationToken = default);
       ```
  2. `EnterpriseTaskManagement.API/Hubs/ChatNotifier.cs`:
     - Cài đặt phương thức sử dụng `IHubContext<ChatHub>` và `IChatConnectionTracker`:
       - `ConversationUpdatedAsync`: Gửi event `"ConversationUpdated"` kèm `{ conversationId, reason }` tới từng user qua `UserGroup(userId)`.
       - `ConversationMemberRemovedAsync`:
         - Gửi `"ConversationMemberRemoved"` kèm `{ conversationId, reason }` tới user đó.
         - Duyệt các `connectionId` của user từ `_tracker` và gọi `_hub.Groups.RemoveFromGroupAsync(connId, ChatHub.ConversationGroup(conversationId))`.
       - `ConversationDeletedAsync`:
         - Gửi `"ConversationDeleted"` kèm `conversationId` tới tất cả `recipientUserIds`.
         - Gỡ tất cả connection của các user khỏi group `conversation:{id}`.

---

### Bước B4: `AddMembersCommandHandler.cs` — Bắn event khi thêm thành viên
- **File**: `EnterpriseTaskManagement.Application/Features/Chat/Commands/AddMembers/AddMembersCommandHandler.cs`
- **Sửa đổi**:
  - Inject `IChatNotifier`.
  - Sau `await UnitOfWork.SaveChangesAsync(cancellationToken)`:
    - Lấy danh sách toàn bộ thành viên active (`var activeUserIds = conversation.Members.Where(m => m.IsActive).Select(m => m.UserId).ToList()`).
    - Gọi `await _notifier.ConversationUpdatedAsync(conversation.Id, activeUserIds, "member_added", cancellationToken);`.
    - Người mới sẽ lập tức thấy hội thoại xuất hiện trong sidebar; thành viên đang mở nhóm sẽ thấy danh sách thành viên tự tăng lên ngay.

---

### Bước B5: `RemoveMemberCommandHandler.cs` — Bắn event khi xóa/rời nhóm
- **File**: `EnterpriseTaskManagement.Application/Features/Chat/Commands/RemoveMember/RemoveMemberCommandHandler.cs`
- **Sửa đổi**:
  - Inject `IChatNotifier`.
  - Sau `await UnitOfWork.SaveChangesAsync(cancellationToken)`:
    - Phân biệt tự rời nhóm hay bị đuổi: `var isSelf = (UserId == request.UserId);` `var reason = isSelf ? "self_left" : "removed";`.
    - Gửi event đá khỏi nhóm và gỡ kết nối SignalR:
      ```csharp
      await _notifier.ConversationMemberRemovedAsync(request.UserId, conversation.Id, reason, cancellationToken);
      ```
    - Báo cho các thành viên còn lại để cập nhật danh sách:
      ```csharp
      var remainingUserIds = conversation.Members.Where(m => m.IsActive).Select(m => m.UserId).ToList();
      await _notifier.ConversationUpdatedAsync(conversation.Id, remainingUserIds, "member_removed", cancellationToken);
      ```

---

### Bước B6: `UpdateConversationCommandHandler.cs` — Bổ sung Audit & Event đổi tên/mô tả
- **File**: `EnterpriseTaskManagement.Application/Features/Chat/Commands/UpdateConversation/UpdateConversationCommandHandler.cs`
- **Sửa đổi**:
  - Inject `IAuditTrail` và `IChatNotifier`.
  - Ghi Audit log (hiện handler này đang thiếu audit, trong khi Add/Remove đều có).
  - Sau `await UnitOfWork.SaveChangesAsync(cancellationToken)`:
    - Bắn event cập nhật:
      ```csharp
      var activeUserIds = conversation.Members.Where(m => m.IsActive).Select(m => m.UserId).ToList();
      await _notifier.ConversationUpdatedAsync(conversation.Id, activeUserIds, "info_updated", cancellationToken);
      ```

---

### Bước B7: `ChangeMemberRoleCommandHandler.cs` & `TransferOwnershipCommandHandler.cs` — Event đổi vai trò / chủ nhóm
- **File**:
  1. `EnterpriseTaskManagement.Application/Features/Chat/Commands/ChangeMemberRole/ChangeMemberRoleCommandHandler.cs`
  2. `EnterpriseTaskManagement.Application/Features/Chat/Commands/TransferOwnership/TransferOwnershipCommandHandler.cs`
- **Sửa đổi**:
  - Inject `IChatNotifier`.
  - Sau khi `SaveChangesAsync`:
    - Ở `ChangeMemberRole`: gửi `ConversationUpdatedAsync(..., activeUserIds, "role_changed", ...)`.
    - Ở `TransferOwnership`: gửi `ConversationUpdatedAsync(..., activeUserIds, "owner_transferred", ...)`.
    - Giúp người được thăng cấp/hạ cấp thấy ngay huy hiệu và quyền hạn thay đổi mà không cần F5.

---

### Bước B8: `ArchiveConversationCommandHandler.cs` — Event giải tán nhóm
- **File**: `EnterpriseTaskManagement.Application/Features/Chat/Commands/ArchiveConversation/ArchiveConversationCommandHandler.cs`
- **Sửa đổi**:
  - Inject `IChatNotifier`.
  - Khi `request.Archive == true`, sau `SaveChangesAsync`:
    - Lấy danh sách thành viên trước khi đóng.
    - Gọi `await _notifier.ConversationDeletedAsync(conversation.Id, activeUserIds, cancellationToken);`.
    - Nhóm sẽ biến mất khỏi sidebar của toàn bộ thành viên và khung chat tự đóng lại.

---

### Bước B9: Tùy chọn (D4) — Tự động sinh tin nhắn hệ thống (`MessageType.System`)
- *(Có thể làm sau cùng)*: Khi thực hiện thêm/xóa/rời/đổi tên, tạo một `ChatMessage` với `MessageType = MessageType.System (6)`, nội dung dạng: *"A đã thêm B vào nhóm"*, *"A đã đổi tên nhóm thành X"*. Frontend đã có sẵn CSS và component render tin nhắn hệ thống ở giữa màn hình.

---

## 3. Thứ tự thực hiện khuyến nghị
1. **B1** (Sửa Domain & mã lỗi - không rủi ro, fix ngay lỗi ghi đè dữ liệu).
2. **B2 + B3** (Xây dựng `ChatConnectionTracker` và mở rộng `IChatNotifier`).
3. **B4 + B5** (Cập nhật `AddMembers` và `RemoveMember` - quan trọng nhất về nghiệp vụ).
4. **B6 + B7 + B8** (Cập nhật `UpdateConversation`, `ChangeRole`, `TransferOwnership`, `Archive`).
5. **Kiểm thử 2 tài khoản trên 2 trình duyệt** để thấy mọi thao tác đồng bộ realtime tức thì.

