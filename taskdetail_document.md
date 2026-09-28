# Task Detail API Contract

> Base URL:

```text
/api/v1
```

> Mục đích: tài liệu API contract cho Frontend `FeManagement` khi xây dựng trang Task Detail.

---

# 🌳 TASK DETAIL API TREE

```text
TASK DETAIL
│
├── 1. TASK INFORMATION
│   ├── GET    /api/v1/tasks/{taskId}
│   └── PUT    /api/v1/tasks/{taskId}
│
├── 2. TASK ASSIGNEES
│   └── PUT    /api/v1/tasks/{taskId}/assignees
│
├── 3. TASK MOVE
│   └── PUT    /api/v1/tasks/{taskId}/move
│
├── 4. CHECKLIST
│   ├── CHECKLIST
│   │   ├── GET    /api/v1/tasks/{taskId}/checklists
│   │   ├── GET    /api/v1/checklists/{id}
│   │   ├── POST   /api/v1/tasks/{taskId}/checklists
│   │   ├── PUT    /api/v1/checklists/{id}
│   │   ├── DELETE /api/v1/checklists/{id}
│   │   ├── PUT    /api/v1/checklists/{id}/complete
│   │   └── PUT    /api/v1/checklists/{id}/reopen
│   │
│   └── CHECKLIST ITEM
│       ├── GET    /api/v1/checklists/{checklistId}/items
│       ├── GET    /api/v1/checklist-items/{id}
│       ├── POST   /api/v1/checklists/{checklistId}/items
│       ├── PUT    /api/v1/checklist-items/{id}
│       ├── DELETE /api/v1/checklist-items/{id}
│       ├── PUT    /api/v1/checklist-items/{id}/complete
│       ├── PUT    /api/v1/checklist-items/{id}/reopen
│       └── PUT    /api/v1/checklist-items/{id}/order
│
├── 5. COMMENT
│   ├── GET    /api/v1/tasks/{taskId}/comments
│   ├── POST   /api/v1/tasks/{taskId}/comments
│   ├── PUT    /api/v1/comments/{id}
│   └── DELETE /api/v1/comments/{id}
│
├── 6. ATTACHMENT
│   ├── GET    /api/v1/tasks/{taskId}/attachments
│   ├── POST   /api/v1/tasks/{taskId}/attachments
│   └── DELETE /api/v1/attachments/{id}
│
├── 7. LABEL
│   ├── PROJECT LABEL
│   │   ├── GET    /api/v1/projects/{projectId}/labels
│   │   ├── POST   /api/v1/projects/{projectId}/labels
│   │   ├── PUT    /api/v1/labels/{id}
│   │   └── DELETE /api/v1/labels/{id}
│   │
│   └── TASK LABEL
│       ├── GET    /api/v1/tasks/{taskId}/labels
│       ├── POST   /api/v1/tasks/{taskId}/labels
│       └── DELETE /api/v1/tasks/{taskId}/labels/{labelId}
│
└── 8. ACTIVITY LOG
    └── GET    /api/v1/tasks/{taskId}/activities
```

> Lưu ý: Số thứ tự trong cây này là theo nhóm chức năng FE. Trong phần code backend trước đó, Comment/Attachment/Label/Activity được đánh số 6–9; khi viết FE document có thể đánh lại liên tục hoặc giữ số backend. Quan trọng là endpoint không thay đổi.

---

# 1. TASK INFORMATION

## 1.1. GET Task Detail

### Endpoint

```http
GET /api/v1/tasks/{taskId}
```

### Path Parameter

| Field    | Type   | Required | Description |
| -------- | ------ | -------: | ----------- |
| `taskId` | `Guid` |      Yes | ID của Task |

### Response

```json
{
  "id": "Guid",
  "projectId": "Guid",
  "boardId": "Guid",
  "columnId": "Guid",
  "parentTaskId": null,
  "milestoneId": null,

  "title": "test giao việc",
  "description": "dgdgdgdg",

  "taskType": 1,
  "priority": 1,
  "status": 1,

  "reporterId": "Guid",

  "position": 0,
  "progress": 0,
  "storyPoint": 4,
  "estimateHour": 6,

  "startDate": "2026-09-21T00:00:00Z",
  "dueDate": "2026-09-23T00:00:00Z",
  "completedDate": null,

  "isArchived": false,
  "createdAt": "2026-09-21T03:25:57.364621Z"
}
```

### Fields

| Field           | Type      | Description            |
| --------------- | --------- | ---------------------- |
| `id`            | Guid      | Task ID                |
| `projectId`     | Guid      | Project chứa Task      |
| `boardId`       | Guid      | Board chứa Task        |
| `columnId`      | Guid      | Column hiện tại        |
| `parentTaskId`  | Guid?     | Task cha               |
| `milestoneId`   | Guid?     | Milestone              |
| `title`         | string    | Tên Task               |
| `description`   | string    | Mô tả                  |
| `taskType`      | number    | Loại Task              |
| `priority`      | number    | Priority               |
| `status`        | number    | Status                 |
| `reporterId`    | Guid      | Người tạo/báo cáo Task |
| `position`      | number    | Vị trí trong Kanban    |
| `progress`      | number    | Tiến độ 0–100          |
| `storyPoint`    | number    | Story Point            |
| `estimateHour`  | number    | Số giờ estimate        |
| `startDate`     | datetime? | Ngày bắt đầu           |
| `dueDate`       | datetime? | Deadline               |
| `completedDate` | datetime? | Ngày hoàn thành        |
| `isArchived`    | boolean   | Đã archive chưa        |
| `createdAt`     | datetime  | Ngày tạo               |

---

## 1.2. UPDATE Task

### Endpoint

```http
PUT /api/v1/tasks/{taskId}
```

### Request

```json
{
  "title": "Task mới",
  "description": "Mô tả mới",
  "priority": 2,
  "startDate": "2026-09-21T00:00:00Z",
  "dueDate": "2026-09-25T00:00:00Z"
}
```

### Fields

| Field         | Type      | Required | Description  |
| ------------- | --------- | -------: | ------------ |
| `title`       | string    |      Yes | Tên Task     |
| `description` | string    |       No | Mô tả        |
| `priority`    | number    |      Yes | Priority     |
| `startDate`   | datetime? |       No | Ngày bắt đầu |
| `dueDate`     | datetime? |       No | Deadline     |

### Response

```text
Result
```

---

# 2. TASK ASSIGNEES

## 2.1. Update Assignees

### Endpoint

```http
PUT /api/v1/tasks/{taskId}/assignees
```

### Request

```json
{
  "employeeIds": [
    "Guid",
    "Guid",
    "Guid"
  ]
}
```

### Fields

| Field         | Type   | Required | Description                     |
| ------------- | ------ | -------: | ------------------------------- |
| `employeeIds` | Guid[] |      Yes | Danh sách nhân viên được assign |

### Quy tắc

```text
employeeIds = [A, B, C]
```

Backend sẽ đồng bộ Task Assignment thành:

```text
A → Active
B → Active
C → Active
```

Những người trước đó có nhưng không còn trong danh sách:

```text
→ Inactive / Unassigned
```

Nếu:

```json
{
  "employeeIds": []
}
```

thì remove toàn bộ assignee hiện tại.

`AssignedBy` lấy từ user đăng nhập thông qua JWT/`ICurrentUser`, FE **không gửi `assignedBy`**.

---

# 3. TASK MOVE

## 3.1. Move Task

### Endpoint

```http
PUT /api/v1/tasks/{taskId}/move
```

### Request

```json
{
  "columnId": "Guid",
  "position": 0
}
```

### Fields

| Field      | Type   | Required | Description |
| ---------- | ------ | -------: | ----------- |
| `columnId` | Guid   |      Yes | Column đích |
| `position` | number |      Yes | Vị trí mới  |

### Backend Command

```text
MoveTaskCommand
├── TaskId
├── ColumnId
└── Position
```

`taskId` lấy từ URL, không gửi trong body.

---

# 4. CHECKLIST

# 4.1. GET Checklists By Task

```http
GET /api/v1/tasks/{taskId}/checklists
```

### Response

```json
[
  {
    "id": "Guid",
    "taskId": "Guid",
    "title": "Checklist 1",
    "isCompleted": false,
    "items": [
      {
        "id": "Guid",
        "checklistId": "Guid",
        "content": "Kiểm tra API",
        "orderIndex": 0,
        "isCompleted": false,
        "completedAt": null
      }
    ]
  }
]
```

### Checklist Fields

| Field         | Type            |
| ------------- | --------------- |
| `id`          | Guid            |
| `taskId`      | Guid            |
| `title`       | string          |
| `isCompleted` | boolean         |
| `items`       | ChecklistItem[] |

---

# 4.2. GET Checklist Detail

```http
GET /api/v1/checklists/{id}
```

### Response

```json
{
  "id": "Guid",
  "taskId": "Guid",
  "title": "Checklist 1",
  "isCompleted": false,
  "items": []
}
```

---

# 4.3. CREATE Checklist

```http
POST /api/v1/tasks/{taskId}/checklists
```

### Request

```json
{
  "title": "Checklist mới"
}
```

### Fields

| Field   | Type   | Required |
| ------- | ------ | -------: |
| `title` | string |      Yes |

`taskId` lấy từ URL.

---

# 4.4. UPDATE Checklist

```http
PUT /api/v1/checklists/{id}
```

### Request

```json
{
  "title": "Checklist đã sửa"
}
```

---

# 4.5. DELETE Checklist

```http
DELETE /api/v1/checklists/{id}
```

### Body

```text
Không có body.
```

---

# 4.6. Complete Checklist

```http
PUT /api/v1/checklists/{id}/complete
```

### Body

```text
Không có body.
```

---

# 4.7. Reopen Checklist

```http
PUT /api/v1/checklists/{id}/reopen
```

### Body

```text
Không có body.
```

---

# 4.8. GET Checklist Items

```http
GET /api/v1/checklists/{checklistId}/items
```

### Response

```json
[
  {
    "id": "Guid",
    "checklistId": "Guid",
    "content": "Kiểm tra API",
    "orderIndex": 0,
    "isCompleted": false,
    "completedAt": null
  }
]
```

---

# 4.9. GET Checklist Item

```http
GET /api/v1/checklist-items/{id}
```

### Response

```json
{
  "id": "Guid",
  "checklistId": "Guid",
  "content": "Kiểm tra API",
  "orderIndex": 0,
  "isCompleted": false,
  "completedAt": null
}
```

---

# 4.10. CREATE Checklist Item

```http
POST /api/v1/checklists/{checklistId}/items
```

### Request

```json
{
  "content": "Kiểm tra API",
  "orderIndex": 0
}
```

### Fields

| Field        | Type   | Required |
| ------------ | ------ | -------: |
| `content`    | string |      Yes |
| `orderIndex` | number |      Yes |

---

# 4.11. UPDATE Checklist Item

```http
PUT /api/v1/checklist-items/{id}
```

### Request

```json
{
  "content": "Kiểm tra API mới"
}
```

---

# 4.12. DELETE Checklist Item

```http
DELETE /api/v1/checklist-items/{id}
```

Body:

```text
Không có.
```

---

# 4.13. Complete Checklist Item

```http
PUT /api/v1/checklist-items/{id}/complete
```

Body:

```text
Không có.
```

Response item:

```json
{
  "id": "Guid",
  "checklistId": "Guid",
  "content": "Kiểm tra API",
  "orderIndex": 0,
  "isCompleted": true,
  "completedAt": "2026-09-22T10:00:00Z"
}
```

---

# 4.14. Reopen Checklist Item

```http
PUT /api/v1/checklist-items/{id}/reopen
```

Body:

```text
Không có.
```

Sau khi reopen:

```json
{
  "isCompleted": false,
  "completedAt": null
}
```

---

# 4.15. Change Checklist Item Order

```http
PUT /api/v1/checklist-items/{id}/order
```

### Request

```json
{
  "orderIndex": 2
}
```

### Fields

| Field        | Type   | Required |
| ------------ | ------ | -------: |
| `orderIndex` | number |      Yes |

---

# 5. COMMENT

## 5.1. GET Comments

```http
GET /api/v1/tasks/{taskId}/comments
```

### Response

```json
[
  {
    "id": "Guid",
    "taskId": "Guid",
    "employeeId": "Guid",
    "content": "Tôi đã xử lý phần này.",
    "createdAt": "2026-09-22T10:00:00Z",
    "updatedAt": null,
    "isEdited": false
  }
]
```

### Fields

| Field        | Type      |
| ------------ | --------- |
| `id`         | Guid      |
| `taskId`     | Guid      |
| `employeeId` | Guid      |
| `content`    | string    |
| `createdAt`  | datetime  |
| `updatedAt`  | datetime? |
| `isEdited`   | boolean   |

---

# 5.2. CREATE Comment

```http
POST /api/v1/tasks/{taskId}/comments
```

### Request

```json
{
  "content": "Tôi đã xử lý phần này."
}
```

> `EmployeeId` phải lấy từ user đăng nhập. FE không nên tự gửi EmployeeId.

### Response

```text
Guid
```

---

# 5.3. UPDATE Comment

```http
PUT /api/v1/comments/{id}
```

### Request

```json
{
  "content": "Nội dung comment đã sửa."
}
```

---

# 5.4. DELETE Comment

```http
DELETE /api/v1/comments/{id}
```

Body:

```text
Không có.
```

---

# 6. ATTACHMENT

Attachment sử dụng:

```text
React
   ↓ multipart/form-data
ASP.NET Core
   ↓
Cloudinary
   ↓
TaskAttachment metadata
   ↓
PostgreSQL
```

File URL là URL public của Cloudinary.

---

# 6.1. GET Attachments

```http
GET /api/v1/tasks/{taskId}/attachments
```

### Response

```json
[
  {
    "id": "Guid",
    "taskId": "Guid",
    "fileName": "task-attachments/abc123",
    "originalFileName": "report.pdf",
    "fileUrl": "https://res.cloudinary.com/...",
    "contentType": "application/pdf",
    "fileSize": 102400,
    "uploadedBy": "Guid",
    "uploadedAt": "2026-09-22T10:00:00Z"
  }
]
```

### Fields

| Field              | Type     | Description                |
| ------------------ | -------- | -------------------------- |
| `id`               | Guid     | Attachment ID              |
| `taskId`           | Guid     | Task ID                    |
| `fileName`         | string   | Tên lưu trên Cloudinary    |
| `originalFileName` | string   | Tên file người dùng upload |
| `fileUrl`          | string   | URL Cloudinary             |
| `contentType`      | string   | MIME type                  |
| `fileSize`         | long     | Kích thước byte            |
| `uploadedBy`       | Guid     | Người upload               |
| `uploadedAt`       | datetime | Thời gian upload           |

---

# 6.2. UPLOAD Attachment

```http
POST /api/v1/tasks/{taskId}/attachments
```

### Content-Type

```http
multipart/form-data
```

### Form Data

```text
file = <File>
```

### Field

| Field  | Type      | Required |
| ------ | --------- | -------: |
| `file` | IFormFile |      Yes |

Không gửi:

```text
taskId
uploadedBy
fileUrl
```

`taskId` lấy từ URL.

`uploadedBy` lấy từ JWT/`ICurrentUser`.

`fileUrl` do Cloudinary trả về.

### Max size

```text
50 MB
```

---

# 6.3. DELETE Attachment

```http
DELETE /api/v1/attachments/{id}
```

Body:

```text
Không có.
```

Hiện tại Delete là soft delete trong database.

---

# 7. LABEL

# 7.1. GET Project Labels

```http
GET /api/v1/projects/{projectId}/labels
```

### Response

```json
[
  {
    "id": "Guid",
    "projectId": "Guid",
    "name": "Bug",
    "color": "#FF0000",
    "description": "Lỗi cần xử lý",
    "isActive": true
  }
]
```

### Fields

| Field         | Type    |
| ------------- | ------- |
| `id`          | Guid    |
| `projectId`   | Guid    |
| `name`        | string  |
| `color`       | string  |
| `description` | string  |
| `isActive`    | boolean |

---

# 7.2. CREATE Project Label

```http
POST /api/v1/projects/{projectId}/labels
```

### Request

```json
{
  "name": "Bug",
  "color": "#FF0000",
  "description": "Lỗi cần xử lý"
}
```

### Fields

| Field         | Type   | Required |
| ------------- | ------ | -------: |
| `name`        | string |      Yes |
| `color`       | string |      Yes |
| `description` | string |       No |

`projectId` lấy từ URL.

---

# 7.3. UPDATE Label

```http
PUT /api/v1/labels/{id}
```

### Request

```json
{
  "name": "Critical Bug",
  "color": "#DC2626",
  "description": "Lỗi nghiêm trọng"
}
```

---

# 7.4. DELETE Label

```http
DELETE /api/v1/labels/{id}
```

Body:

```text
Không có.
```

Delete hiện tại là:

```text
Label.IsActive = false
```

---

# 7.5. GET Task Labels

```http
GET /api/v1/tasks/{taskId}/labels
```

### Response

```json
[
  {
    "id": "Guid",
    "taskId": "Guid",
    "labelId": "Guid",
    "name": "Bug",
    "color": "#FF0000",
    "description": "Lỗi cần xử lý",
    "assignedAt": "2026-09-22T10:00:00Z"
  }
]
```

### Fields

| Field         | Type     |
| ------------- | -------- |
| `id`          | Guid     |
| `taskId`      | Guid     |
| `labelId`     | Guid     |
| `name`        | string   |
| `color`       | string   |
| `description` | string   |
| `assignedAt`  | datetime |

---

# 7.6. Assign Label To Task

```http
POST /api/v1/tasks/{taskId}/labels
```

### Request

```json
{
  "labelId": "Guid"
}
```

### Fields

| Field     | Type | Required |
| --------- | ---- | -------: |
| `labelId` | Guid |      Yes |

Backend kiểm tra:

```text
Task tồn tại
        ↓
Label tồn tại
        ↓
Label.IsActive
        ↓
Label.ProjectId == Task.ProjectId
        ↓
Assign
```

Nếu TaskLabel đã tồn tại nhưng inactive:

```text
Restore
```

Không tạo duplicate.

---

# 7.7. Remove Label From Task

```http
DELETE /api/v1/tasks/{taskId}/labels/{labelId}
```

Body:

```text
Không có.
```

---

# 8. ACTIVITY LOG

Activity Log là lịch sử thao tác của Task.

FE chỉ đọc Activity.

FE **không POST Activity**.

---

# 8.1. GET Task Activities

```http
GET /api/v1/tasks/{taskId}/activities
```

### Response

```json
[
  {
    "id": "Guid",
    "employeeId": "Guid",
    "activityType": 2,
    "entityId": "Guid",
    "title": "Di chuyển task",
    "description": "Task đã được chuyển sang In Progress",
    "correlationId": "Guid",
    "createdAt": "2026-09-22T10:00:00Z"
  }
]
```

### Fields

| Field           | Type     | Description         |
| --------------- | -------- | ------------------- |
| `id`            | Guid     | Activity ID         |
| `employeeId`    | Guid     | Người thực hiện     |
| `activityType`  | number   | Loại activity       |
| `entityId`      | Guid     | ID entity liên quan |
| `title`         | string   | Tiêu đề             |
| `description`   | string   | Nội dung            |
| `correlationId` | Guid     | Correlation ID      |
| `createdAt`     | datetime | Thời gian           |

---

# 8.2. ActivityType hiện tại

```text
1 = Project
2 = Task
3 = Comment
4 = Attachment
5 = Checklist
6 = Milestone
7 = Member
8 = Message
```

Hiện tại **chưa có Label ActivityType**.

---

# 8.3. Quy tắc EntityId của Task Activity

Đối với Activity Feed của một Task:

```text
EntityId = TaskId
```

Ví dụ Comment được tạo trên Task:

```json
{
  "activityType": 3,
  "entityId": "TASK_ID",
  "title": "Thêm bình luận",
  "description": "Người dùng đã thêm một bình luận"
}
```

Không dùng:

```text
EntityId = CommentId
```

cho Task Activity Feed hiện tại.

---

# 9. FE SERVICE MAP

Frontend có thể chia service như sau:

```text
src/services/
│
├── taskService.ts
│   ├── getTaskDetail()
│   ├── updateTask()
│   ├── updateTaskAssignees()
│   └── moveTask()
│
├── checklistService.ts
│   ├── getTaskChecklists()
│   ├── getChecklist()
│   ├── createChecklist()
│   ├── updateChecklist()
│   ├── deleteChecklist()
│   ├── completeChecklist()
│   ├── reopenChecklist()
│   ├── getChecklistItems()
│   ├── getChecklistItem()
│   ├── createChecklistItem()
│   ├── updateChecklistItem()
│   ├── deleteChecklistItem()
│   ├── completeChecklistItem()
│   ├── reopenChecklistItem()
│   └── changeChecklistItemOrder()
│
├── commentService.ts
│   ├── getTaskComments()
│   ├── createComment()
│   ├── updateComment()
│   └── deleteComment()
│
├── attachmentService.ts
│   ├── getTaskAttachments()
│   ├── uploadAttachment()
│   └── deleteAttachment()
│
├── labelService.ts
│   ├── getProjectLabels()
│   ├── createLabel()
│   ├── updateLabel()
│   ├── deleteLabel()
│   ├── getTaskLabels()
│   ├── assignTaskLabel()
│   └── removeTaskLabel()
│
└── activityService.ts
    └── getTaskActivities()
```

---

# 10. TASK DETAIL FE DATA MODEL

Khi mở:

```text
/project/{projectId}/task/{taskId}
```

FE có thể load:

```text
GET /tasks/{taskId}
GET /tasks/{taskId}/checklists
GET /tasks/{taskId}/comments
GET /tasks/{taskId}/attachments
GET /tasks/{taskId}/labels
GET /tasks/{taskId}/activities
```

Và khi cần:

```text
GET /projects/{projectId}/labels
```

để lấy toàn bộ label của Project cho dropdown/label picker.

Assignee:

```text
PUT /tasks/{taskId}/assignees
```

Move:

```text
PUT /tasks/{taskId}/move
```

Update:

```text
PUT /tasks/{taskId}
```

---

# 11. QUICK REFERENCE

|  # | Method | Endpoint                           | Chức năng          |
| -: | ------ | ---------------------------------- | ------------------ |
|  1 | GET    | `/tasks/{taskId}`                  | Task Detail        |
|  2 | PUT    | `/tasks/{taskId}`                  | Update Task        |
|  3 | PUT    | `/tasks/{taskId}/assignees`        | Đồng bộ Assignees  |
|  4 | PUT    | `/tasks/{taskId}/move`             | Move Task          |
|  5 | GET    | `/tasks/{taskId}/checklists`       | Get Checklists     |
|  6 | POST   | `/tasks/{taskId}/checklists`       | Create Checklist   |
|  7 | PUT    | `/checklists/{id}`                 | Update Checklist   |
|  8 | DELETE | `/checklists/{id}`                 | Delete Checklist   |
|  9 | PUT    | `/checklists/{id}/complete`        | Complete Checklist |
| 10 | PUT    | `/checklists/{id}/reopen`          | Reopen Checklist   |
| 11 | GET    | `/checklists/{checklistId}/items`  | Get Items          |
| 12 | POST   | `/checklists/{checklistId}/items`  | Create Item        |
| 13 | GET    | `/checklist-items/{id}`            | Get Item           |
| 14 | PUT    | `/checklist-items/{id}`            | Update Item        |
| 15 | DELETE | `/checklist-items/{id}`            | Delete Item        |
| 16 | PUT    | `/checklist-items/{id}/complete`   | Complete Item      |
| 17 | PUT    | `/checklist-items/{id}/reopen`     | Reopen Item        |
| 18 | PUT    | `/checklist-items/{id}/order`      | Reorder Item       |
| 19 | GET    | `/tasks/{taskId}/comments`         | Get Comments       |
| 20 | POST   | `/tasks/{taskId}/comments`         | Create Comment     |
| 21 | PUT    | `/comments/{id}`                   | Update Comment     |
| 22 | DELETE | `/comments/{id}`                   | Delete Comment     |
| 23 | GET    | `/tasks/{taskId}/attachments`      | Get Attachments    |
| 24 | POST   | `/tasks/{taskId}/attachments`      | Upload Attachment  |
| 25 | DELETE | `/attachments/{id}`                | Delete Attachment  |
| 26 | GET    | `/projects/{projectId}/labels`     | Get Project Labels |
| 27 | POST   | `/projects/{projectId}/labels`     | Create Label       |
| 28 | PUT    | `/labels/{id}`                     | Update Label       |
| 29 | DELETE | `/labels/{id}`                     | Delete Label       |
| 30 | GET    | `/tasks/{taskId}/labels`           | Get Task Labels    |
| 31 | POST   | `/tasks/{taskId}/labels`           | Assign Label       |
| 32 | DELETE | `/tasks/{taskId}/labels/{labelId}` | Remove Label       |
| 33 | GET    | `/tasks/{taskId}/activities`       | Get Activity Log   |

---

# 12. FE IMPLEMENTATION ORDER

```text
1. Task Detail
   ↓
2. Assignees
   ↓
3. Task Edit
   ↓
4. Move Task
   ↓
5. Checklist
   ↓
6. Comment
   ↓
7. Attachment
   ↓
8. Label
   ↓
9. Activity
```

Khi FE mở Task Detail, phần dữ liệu chính sẽ được lấy từ các API tương ứng ở trên.
