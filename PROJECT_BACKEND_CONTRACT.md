# TỔNG HỢP TOÀN BỘ API, TRƯỜNG DỮ LIỆU & LUỒNG XỬ LÝ TASK NỀN TẢNG (BACKEND CONTRACT)

Tài liệu này tổng hợp toàn bộ danh sách API, các Data Transfer Object (DTO), quy chuẩn Envelope, các trường dữ liệu thực tế đang được Frontend (`FeManagement`) sử dụng và hướng dẫn chi tiết cách khởi tạo, quản lý **Task (Công việc)** và **Kanban Board** để Backend Team hoàn thiện tương thích 100%.

---

## 1. QUY CHUẨN ĐẦU RA API (API ENVELOPE)

Tất cả các API RESTful (trừ Auth response có thể trả direct `LoginResponse`) được Frontend bọc qua cấu trúc Chuẩn:

```json
{
  "isSuccess": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": { ... },
  "errors": []
}
```

---

## 2. CHUYỂN ĐỔI KIỂU DỮ LIỆU ĐỘ ƯU TIÊN (PRIORITY ENUM)

Backend sử dụng số nguyên (Number), Frontend mapping với chuỗi ký tự hiển thị (String UI):

| Giá trị Backend (Number) | Chuỗi đại diện UI (String) |
| :--- | :--- |
| `1` | `Low` |
| `2` | `Medium` |
| `3` | `High` |
| `4` | `Critical` |

---

## 3. DANH SÁCH CHI TIẾT API & TRƯỜNG DỮ LIỆU (DTOs)

### A. Quản Lý Dự Án (`/api/v1/projects`)

#### 1. Lấy danh sách dự án (Phân trang + Lọc)
- **HTTP Method**: `GET /api/v1/projects`
- **Query Parameters**:
  - `pageNumber` (number, default: 1)
  - `pageSize` (number, default: 12)
  - `search` (string, optional)
  - `status` (string, optional: `Planning`, `Active`, `OnHold`, `Completed`, `Cancelled`)
  - `departmentId` (string, optional)
  - `managerId` (string, optional)
  - `sortBy` (string, default: `CreatedAt`)
  - `sortDirection` (string: `asc` | `desc`, default: `desc`)

- **Response DTO (`ProjectListData`)**:
```json
{
  "items": [
    {
      "id": "uuid-v4",
      "code": "PRJ-001",
      "name": "Hệ thống quản lý FE",
      "description": "Mô tả dự án",
      "status": "Active",
      "priority": 2,
      "departmentId": "dept-uuid",
      "departmentName": "Phòng Phần mềm",
      "managerId": "user-uuid",
      "managerName": "Nguyễn Văn A",
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": "2026-12-31T00:00:00Z",
      "progress": 65,
      "memberCount": 8,
      "taskCount": 42,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-02-01T00:00:00Z",
      "isActive": true
    }
  ],
  "page": 1,
  "pageSize": 12,
  "totalCount": 1,
  "totalPages": 1,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

#### 2. Chi tiết dự án
- **HTTP Method**: `GET /api/v1/projects/{projectId}`
- **Response DTO (`ProjectDetail`)**:
```json
{
  "id": "uuid-v4",
  "code": "PRJ-001",
  "name": "Hệ thống quản lý FE",
  "description": "Mô tả dự án",
  "status": "Active",
  "priority": 2,
  "departmentId": "dept-uuid",
  "departmentName": "Phòng Phần mềm",
  "managerId": "user-uuid",
  "managerName": "Nguyễn Văn A",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-12-31T00:00:00Z",
  "progress": 65,
  "memberCount": 8,
  "taskCount": 42,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": null,
  "isActive": true,
  "department": {
    "id": "dept-uuid",
    "code": "DEP-DEV",
    "name": "Phòng Phần mềm"
  },
  "manager": {
    "id": "user-uuid",
    "fullName": "Nguyễn Văn A",
    "email": "a.nguyen@company.com"
  },
  "memebers": [
    {
      "userId": "user-uuid-2",
      "fullName": "Trần Thị B",
      "email": "b.tran@company.com",
      "role": "Developer",
      "joinedAt": "2026-01-05T00:00:00Z"
    }
  ],
  "milestones": [
    {
      "id": "ms-uuid-1",
      "name": "Release MVP",
      "description": "Giai đoạn 1",
      "startDate": "2026-01-01T00:00:00Z",
      "dueDate": "2026-04-01T00:00:00Z",
      "status": "In_Progress"
    }
  ]
}
```

#### 3. Tiến độ & Thống kê dự án
- **HTTP Method**: `GET /api/v1/projects/{projectId}/progress`
- **Response DTO (`ProjectProgress`)**:
```json
{
  "projectId": "uuid-v4",
  "projectName": "Hệ thống quản lý FE",
  "overallProgress": 65.5,
  "progress": 65.5,
  "totalTasks": 40,
  "totalTaskCount": 40,
  "completedTasks": 25,
  "completedTaskCount": 25,
  "inProgressTasks": 10,
  "todoTasks": 5,
  "totalMilestones": 4,
  "completedMilestones": 2,
  "overdueTaskCount": 3
}
```

- **HTTP Method**: `GET /api/v1/projects/{projectId}/statistics`
- **Response DTO (`ProjectStatistics`)**:
```json
{
  "projectId": "uuid-v4",
  "projectName": "Hệ thống quản lý FE",
  "status": "Active",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-12-31T00:00:00Z",
  "createdDate": "2026-01-01T00:00:00Z",
  "totalTasks": 40,
  "completedTasks": 25,
  "totalMembers": 10,
  "activeMembers": 8,
  "totalMilestones": 4,
  "completedMilestones": 2,
  "totalKanbanBoards": 2
}
```

#### 4. Tạo & Cập nhật dự án
- **HTTP Method**: `POST /api/v1/projects`
  - **Request Payload (`CreateProjectRequest`)**:
  ```json
  {
    "code": "PRJ-002",
    "name": "Dự án B",
    "description": "Mô tả",
    "departmentId": "dept-uuid",
    "managerId": "user-uuid",
    "startDate": "2026-03-01",
    "endDate": "2026-09-01",
    "priority": 2
  }
  ```
- **HTTP Method**: `PUT /api/v1/projects/{projectId}`
  - **Request Payload (`UpdateProjectRequest`)**:
  ```json
  {
    "name": "Dự án B - Đã đổi tên",
    "description": "Mô tả mới",
    "startDate": "2026-03-01",
    "endDate": "2026-10-01",
    "priority": 3
  }
  ```

#### 5. Thay đổi Trạng thái Dự án (Lifecycle Actions)
- `POST /api/v1/projects/{projectId}/start` -> Chuyển sang `Active`
- `POST /api/v1/projects/{projectId}/hold` -> Chuyển sang `OnHold`
- `POST /api/v1/projects/{projectId}/resume` -> Chuyển lại `Active`
- `POST /api/v1/projects/{projectId}/complete` -> Chuyển sang `Completed`
- `POST /api/v1/projects/{projectId}/cancel` -> Chuyển sang `Cancelled`
- `POST /api/v1/projects/{projectId}/activate` -> Đặt `isActive = true`
- `POST /api/v1/projects/{projectId}/deactivate` -> Đặt `isActive = false`
- `PATCH /api/v1/projects/{projectId}/department` -> Payload: `{ "departmentId": "uuid" }`
- `PATCH /api/v1/projects/{projectId}/manager` -> Payload: `{ "managerId": "uuid" }`
- `DELETE /api/v1/projects/{projectId}` -> Xóa dự án

---

### B. Quản Lý Kanban Board & Cột (`/api/v1/projects/{projectId}/boards`)

#### 1. Danh sách Kanban Board của dự án
- **HTTP Method**: `GET /api/v1/projects/{projectId}/boards`
- **Response DTO (`KanbanBoardSummary[]`)**:
```json
[
  {
    "id": "board-uuid-1",
    "projectId": "uuid-v4",
    "name": "Main Development Board",
    "description": "Bảng công việc chính",
    "isDefault": true,
    "columnCount": 4,
    "taskCount": 20
  }
]
```

#### 2. Chi tiết Kanban Board (Bao gồm danh sách cột)
- **HTTP Method**: `GET /api/v1/projects/{projectId}/boards/{boardId}`
- **Response DTO (`KanbanBoardDetail`)**:
```json
{
  "id": "board-uuid-1",
  "projectId": "uuid-v4",
  "name": "Main Development Board",
  "description": "Bảng công việc chính",
  "isDefault": true,
  "columnCount": 4,
  "taskCount": 20,
  "columns": [
    {
      "id": "col-uuid-1",
      "boardId": "board-uuid-1",
      "name": "To Do",
      "color": "#6c757d",
      "position": 0,
      "wipLimit": 10
    },
    {
      "id": "col-uuid-2",
      "boardId": "board-uuid-1",
      "name": "In Progress",
      "color": "#0d6efd",
      "position": 1,
      "wipLimit": 5
    },
    {
      "id": "col-uuid-3",
      "boardId": "board-uuid-1",
      "name": "Review",
      "color": "#ffc107",
      "position": 2,
      "wipLimit": 3
    },
    {
      "id": "col-uuid-4",
      "boardId": "board-uuid-1",
      "name": "Done",
      "color": "#198754",
      "position": 3,
      "wipLimit": null
    }
  ]
}
```

#### 3. Tạo Board mới
- **HTTP Method**: `POST /api/v1/projects/{projectId}/boards`
- **Payload (`CreateBoardRequest`)**:
```json
{
  "name": "Sprint 1 Board",
  "description": "Bảng cho Sprint 1"
}
```

---

### C. Quản Lý Công Việc (Task) & Thao Tác Kéo Thả (Kanban Move)

#### 1. Lấy danh sách Task theo Kanban Board
- **HTTP Method**: `GET /api/v1/boards/{boardId}/tasks`
- **Response DTO (`KanbanTask[]`)**:
```json
[
  {
    "id": "task-uuid-1",
    "boardId": "board-uuid-1",
    "columnId": "col-uuid-1",
    "title": "Thiết kế giao diện Login",
    "description": "Chi tiết các trường dữ liệu và Validate",
    "priority": 3,
    "position": 0,
    "assigneeId": "user-uuid-1",
    "assigneeName": "Nguyễn Văn A",
    "assigneeAvatar": "https://...",
    "dueDate": "2026-03-30",
    "labels": [
      { "id": "lbl-1", "name": "Frontend", "color": "#0d6efd" }
    ],
    "commentCount": 3,
    "attachmentCount": 1
  }
]
```

#### 2. Cập nhật vị trí Task khi Kéo-Thả (Move Task)
- **HTTP Method**: `PUT /api/v1/tasks/{taskId}/move`
- **Payload (`MoveTaskRequest`)**:
```json
{
  "columnId": "col-uuid-2",
  "position": 1
}
```

---

## 4. HƯỚNG DẪN LUỒNG TẠO & SỬ DỤNG TASK TRONG HỆ THỐNG

### Luồng Tự Động Khởi Tạo Kanban Board khi Tạo Dự Án Mới
1. Khi Người dùng bấm **Tạo dự án** (`POST /api/v1/projects`), Backend nên tự động:
   - Tạo 1 **KanbanBoard** mặc định (`isDefault = true`) tên là `"Main Board"`.
   - Tạo các **KanbanColumn** mặc định gắn với Board đó:
     - Cột `0`: **To Do** (`position: 0`)
     - Cột `1`: **In Progress** (`position: 1`)
     - Cột `2`: **Review** (`position: 2`)
     - Cột `3`: **Done** (`position: 3`)

### Cách Tạo và Sử Dụng Task Trên Frontend:
1. **Truy cập Tab Kanban**:
   - Đường dẫn UI: `/projects/{projectId}/kanban`
   - UI gọi `GET /api/v1/projects/{projectId}/boards` để lấy danh sách bảng công việc.
   - UI chọn Board mặc định (hoặc Board đầu tiên) và gọi `GET /api/v1/projects/{projectId}/boards/{boardId}` để lấy cấu trúc các Cột (Columns).
   - UI tiếp tục gọi `GET /api/v1/boards/{boardId}/tasks` để nạp danh sách toàn bộ thẻ Task lên từng Cột tương ứng dựa theo `columnId`.

2. **Thêm Task mới (Quick Add Task)**:
   - Người dùng click nút **"+ Thêm công việc"** ở cột bất kỳ (ví dụ cột `To Do`).
   - Giao diện gửi yêu cầu tạo task mới gắn trực tiếp vào `columnId` của cột đó, vị trí `position` = cuối cột.

3. **Kéo - Thả Công Việc (Drag & Drop)**:
   - Khi Người dùng kéo thẻ Task từ cột này sang cột khác hoặc thay đổi thứ tự trong cùng một cột:
   - Giao diện ngay lập tức cập nhật vị trí thẻ trên UI (Optimistic UI Update).
   - Đồng thời gọi ngầm API `PUT /api/v1/tasks/{taskId}/move` với body chứa `columnId` đích và `position` mới.
   - Nếu API lỗi (404/500), UI sẽ hiện thông báo lỗi và tự động khôi phục lại vị trí cũ của Task.

---

## 5. MỐI QUAN HỆ GIỮA TAB TASK & KANBAN BOARD & POPUP DẠNG JIRA/TRELLO

### A. Mối quan hệ dữ liệu:
1. **Dữ liệu tập trung (Single Source of Truth)**:
   - Các công việc hiển thị ở **Tab Task** và **Tab Kanban** thực chất là **cùng một nguồn dữ liệu (Tasks)** của dự án.
   - **Tab Kanban**: Hiển thị dạng thẻ kéo - thả trực quan chia theo các Cột (To Do, In Progress, Done...).
   - **Tab Task**: Hiển thị dạng bảng (Table view) tổng hợp toàn bộ Task của dự án để dễ dàng xem, tìm kiếm, lọc theo Người thực hiện (Assignee), Độ ưu tiên (Priority), Trạng thái hay Hạn chót (DueDate).

2. **Chuyển đổi linh hoạt**:
   - Khi người dùng bấm vào 1 công việc ở **Tab Task** hoặc ở **Tab Kanban**, giao diện sẽ mở cùng 1 **Task Detail Popup (`TaskDetailModal`)** kiểu Trello/Jira.

---

> **TRẠNG THÁI TRIỂN KHAI FRONTEND**: Frontend đã xây dựng xong hoàn chỉnh **Giao diện Tab Task & Popup Chi Tiết Task (Jira / Trello Modal Style)**. Khi người dùng click vào bất kỳ công việc nào ở Tab **Task** hoặc Tab **Kanban**, popup `TaskDetailModal` sẽ hiển thị đầy đủ giao diện sửa thông tin, thêm checklist, tải file đính kèm, gửi bình luận (comment) và xem nhật ký hoạt động.

Khi click vào 1 Todo/Task, Popup này hiện lên cho phép quản lý toàn bộ vòng đời của công việc:

#### 1. Các thành phần dữ liệu của Task Popup:
- **Thông tin chung**:
  - `title`: Tiêu đề công việc.
  - `description`: Mô tả chi tiết (Rich text hoặc Markdown).
  - `columnId` / `status`: Cột hiện tại (VD: To Do, In Progress, Done). Cho phép chuyển cột ngay trong popup.
  - `priority`: Độ ưu tiên (Low, Medium, High, Critical).
  - `assigneeId` / `assignee`: Người chịu trách nhiệm chính.
  - `dueDate` / `startDate`: Ngày bắt đầu và hạn chót.
  - `labels`: Danh sách nhãn phân loại (VD: Frontend, Bug, Feature).

- **Checklist (Danh sách công việc con)**:
  - Cho phép thêm các `checklists` nhỏ bên trong Task (VD: `[x] Viết API, [ ] Ghép UI`).
  - Tự động tính % hoàn thành checklist (`progress`).

- **Đính kèm Tệp tin (Attachments)**:
  - Cho phép tải lên / đính kèm file (tài liệu, hình ảnh screenshot bug).
  - API đính kèm: `POST /api/v1/tasks/{taskId}/attachments` (Upload multipart/form-data) hoặc lưu danh sách `TaskAttachment[]`.

- **Thảo luận & Bình luận (Comments)**:
  - Cho phép các thành viên trong dự án comment, trao đổi trực tiếp trong thẻ Task.
  - API comment: `GET/POST /api/v1/tasks/{taskId}/comments`

- **Nhật ký hoạt động (Activity Logs)**:
  - Ghi lại vết lịch sử (VD: *"Nguyễn Văn A đã chuyển công việc từ To Do sang In Progress lúc 10:30"*).

---

### C. Cấu trúc Cụ Thể DTO của Task Detail đầy đủ (Jira-style):

```json
{
  "id": "task-uuid-1",
  "projectId": "prj-uuid-1",
  "boardId": "board-uuid-1",
  "columnId": "col-uuid-2",
  "title": "Thiết kế giao diện Login & Auth Flow",
  "description": "Cần hỗ trợ validate form và xử lý refresh token tự động",
  "priority": 3,
  "position": 0,
  "assigneeId": "user-uuid-1",
  "assignee": {
    "id": "user-uuid-1",
    "fullName": "Nguyễn Văn A",
    "avatar": "https://..."
  },
  "startDate": "2026-03-01T00:00:00Z",
  "dueDate": "2026-03-10T00:00:00Z",
  "labels": [
    { "id": "lbl-1", "name": "Frontend", "color": "#0d6efd" },
    { "id": "lbl-2", "name": "UI/UX", "color": "#6f42c1" }
  ],
  "checklists": [
    { "id": "chk-1", "title": "Tạo form CoreUI", "isCompleted": true },
    { "id": "chk-2", "title": "Bắt lỗi Validate", "isCompleted": false }
  ],
  "attachments": [
    {
      "id": "att-1",
      "fileName": "mockup_login.png",
      "fileUrl": "https://storage.../mockup_login.png",
      "fileSize": 204850,
      "uploadedAt": "2026-03-02T10:00:00Z",
      "uploadedBy": "Nguyễn Văn A"
    }
  ],
  "comments": [
    {
      "id": "cmt-1",
      "userId": "user-uuid-2",
      "userName": "Trần Thị B",
      "userAvatar": "https://...",
      "content": "Đã hoàn thành thiết kế Figma cho màn này nhé!",
      "createdAt": "2026-03-02T14:30:00Z"
    }
  ],
  "activities": [
    {
      "id": "act-1",
      "userId": "user-uuid-1",
      "userName": "Nguyễn Văn A",
      "action": "đã chuyển công việc từ To Do sang In Progress",
      "createdAt": "2026-03-02T09:00:00Z"
    }
  ]
}
```

