# Luồng tạo Project, Chi tiết Project và Kanban

Tài liệu này mô tả luồng FE hiện tại và contract backend cần đáp ứng.

## 1. Nguyên tắc chính

- Mỗi project có Kanban riêng.
- Kanban luôn được xác định bằng `projectId`.
- Không dùng một Kanban chung cho tất cả project.
- Route Kanban chuẩn:

```text
/projects/{projectId}/kanban
```

- Người dùng vào Kanban từ:
  - Card project tại `/projects`.
  - Nút `Mở Kanban` tại trang chi tiết project `/projects/{projectId}`.
- Sidebar chỉ có `Dự án` và `Công việc`; không có một route Kanban chung thiếu `projectId`.

## 2. Luồng tổng thể

```text
Danh sách project
    |
    |-- Tạo project
    |      POST /api/v1/projects
    |
    |-- Chi tiết project
    |      /projects/{projectId}
    |      GET project + progress + statistics
    |
    `-- Kanban project
           /projects/{projectId}/kanban
           GET boards
           GET board detail
           GET tasks nếu board detail không chứa tasks
           Drag & drop task
           PUT task move
```

## 3. Tạo project

### UI

Modal tạo project có các trường:

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---:|---|
| `code` | string | Có | Mã duy nhất, ví dụ `PRJ-001` |
| `name` | string | Có | Tên project |
| `description` | string | Không | Mô tả |
| `departmentId` | GUID | Có | Phòng ban sở hữu project |
| `managerId` | GUID | Có | `userId` của người quản lý project |
| `startDate` | ISO date | Không | Ngày bắt đầu |
| `endDate` | ISO date | Không | Ngày kết thúc |
| `priority` | number | Có | Enum số của backend |

`managerId` không phải `positionId`. FE lấy danh sách nhân viên active, sau đó lọc theo phòng ban đã chọn. Chức vụ chỉ hiển thị để người dùng nhận biết.

### Enum priority

```text
0 = Low
1 = Medium
2 = High
3 = Critical
```

### Request

```http
POST /api/v1/projects
```

```json
{
  "code": "PRJ-001",
  "name": "Website e-Commerce",
  "description": "Phát triển hệ thống bán hàng",
  "departmentId": "department-guid",
  "managerId": "user-guid",
  "startDate": "2026-09-09T14:03:38.847Z",
  "endDate": "2026-12-31T14:03:38.847Z",
  "priority": 1
}
```

### Backend cần kiểm tra

- `code` không trùng.
- `departmentId` tồn tại và đang hoạt động.
- `managerId` tồn tại, active và thuộc `departmentId`.
- Người gọi có quyền tạo project.
- `startDate <= endDate` nếu cả hai được gửi.
- `priority` thuộc `0..3`.
- Response trả về project vừa tạo, bắt buộc có `id`.

## 4. Danh sách project

### Request

```http
GET /api/v1/projects
```

Query FE có thể gửi:

```text
page=1
pageSize=12
search=website
status=Active
departmentId=department-guid
sortBy=createdAt
sortDirection=desc
```

### Response đề xuất

```json
{
  "isSuccess": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": "project-guid",
        "code": "PRJ-001",
        "name": "Website e-Commerce",
        "description": "...",
        "status": "Active",
        "priority": 1,
        "departmentId": "department-guid",
        "departmentName": "Engineering",
        "managerId": "user-guid",
        "managerName": "Nguyen Van A",
        "startDate": "2026-09-09T00:00:00Z",
        "endDate": "2026-12-31T00:00:00Z",
        "progress": 65,
        "memberCount": 8,
        "taskCount": 42,
        "createdAt": "2026-09-09T00:00:00Z"
      }
    ],
    "page": 1,
    "pageSize": 12,
    "totalCount": 1,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  },
  "errors": []
}
```

## 5. Chi tiết project

### Route

```text
/projects/{projectId}
```

### API được gọi

```http
GET /api/v1/projects/{projectId}
GET /api/v1/projects/{projectId}/progress
GET /api/v1/projects/{projectId}/statistics
```

FE hiển thị:

- Mã và tên project.
- Trạng thái.
- Mô tả.
- Phòng ban.
- Tiến độ.
- Tổng task.
- Task hoàn thành.
- Task quá hạn.
- Số thành viên.
- Khoảng thời gian project.
- Nút mở Kanban.

Nếu project không tồn tại, backend trả `404`. Nếu user không có quyền xem, backend trả `403`.

## 6. Tạo Kanban board cho project

Project có thể chưa có board. Khi đó FE hiển thị nút `Tạo board đầu tiên` ngay tại:

```text
/projects/{projectId}/kanban
```

### Request

```http
POST /api/v1/projects/{projectId}/boards
```

```json
{
  "name": "Sprint chính",
  "description": "Luồng công việc chính của project"
}
```

### Response

```json
{
  "isSuccess": true,
  "statusCode": 201,
  "data": {
    "id": "board-guid",
    "projectId": "project-guid",
    "name": "Sprint chính",
    "description": "Luồng công việc chính của project",
    "isDefault": true,
    "columnCount": 4,
    "taskCount": 0
  },
  "errors": []
}
```

### Backend cần làm khi tạo board đầu tiên

Nên tạo trong cùng transaction:

```text
Todo
In Progress
Review
Done
```

Nếu project đã có board, backend quyết định cho phép tạo nhiều board hay chỉ cho một board mặc định. FE hiện hỗ trợ nhiều board và hiển thị dropdown chọn board.

## 7. Tải Kanban của project

### Route duy nhất

```text
/projects/{projectId}/kanban
```

### API

```http
GET /api/v1/projects/{projectId}
GET /api/v1/projects/{projectId}/boards
GET /api/v1/projects/{projectId}/boards/{boardId}
```

Nếu response board detail không chứa task:

```http
GET /api/v1/boards/{boardId}/tasks
```

FE chọn board mặc định theo thứ tự:

1. Board có `isDefault = true`.
2. Nếu không có, chọn board đầu tiên.
3. Nếu không có board nào, hiển thị nút tạo board.

### Board detail đề xuất

```json
{
  "id": "board-guid",
  "projectId": "project-guid",
  "name": "Sprint chính",
  "description": "...",
  "isDefault": true,
  "columns": [
    {
      "id": "column-guid",
      "boardId": "board-guid",
      "name": "Todo",
      "color": "#6c757d",
      "position": 0,
      "wipLimit": null,
      "tasks": []
    }
  ]
}
```

## 8. Task trên Kanban

Task cần có tối thiểu:

```json
{
  "id": "task-guid",
  "projectId": "project-guid",
  "boardId": "board-guid",
  "columnId": "column-guid",
  "title": "Implement login API",
  "description": "...",
  "type": "Task",
  "priority": "High",
  "status": "Todo",
  "dueDate": "2026-09-30T00:00:00Z",
  "position": 0,
  "assignees": [
    {
      "id": "user-guid",
      "fullName": "Nguyen Van A",
      "avatarUrl": null
    }
  ],
  "labels": [],
  "commentCount": 2,
  "attachmentCount": 1
}
```

## 9. Kéo thả task

FE dùng `@hello-pangea/dnd`, giống hành vi board dữ liệu tĩnh ban đầu.

### Hành vi UI

- Kéo task trong cùng column.
- Kéo task sang column khác.
- Cập nhật UI ngay lập tức theo optimistic update.
- Giữ nguyên task đang được kéo.
- Nếu API lỗi, FE báo lỗi và tải lại board để khôi phục dữ liệu chính xác.
- Khi đang tìm kiếm/lọc priority, FE tính lại vị trí trên danh sách task thật, không dùng trực tiếp index của danh sách đã lọc.

### API khi drop

```http
PUT /api/v1/tasks/{taskId}/move
```

```json
{
  "columnId": "target-column-guid",
  "position": 2
}
```

### Backend phải xử lý

- Task tồn tại.
- Task thuộc đúng project/board.
- Column đích thuộc đúng board.
- User có quyền di chuyển task.
- Cập nhật `columnId`.
- Cập nhật lại `position` của các task bị ảnh hưởng.
- Trả `200` hoặc `204` khi thành công.
- Trả `403` nếu không có quyền.
- Trả `404` nếu task/column/board không tồn tại.

## 10. Error handling

| Status | Ý nghĩa | FE xử lý |
|---:|---|---|
| `400` | Payload/query không hợp lệ | Hiển thị message/errors từ backend |
| `401` | Token hết hạn/không hợp lệ | Axios refresh token hoặc về login |
| `403` | Không có quyền | Interceptor chuyển `/403` |
| `404` | Project/board/task không tồn tại | Hiển thị trạng thái không tìm thấy |
| `500` | Lỗi server | Hiển thị lỗi thao tác/tải dữ liệu |

## 11. Checklist duyệt contract

- [ ] `POST /projects` nhận `priority` dạng number.
- [ ] `managerId` là user GUID và thuộc department.
- [ ] `GET /projects` trả pagination đúng field.
- [ ] Project có thể tạo board đầu tiên.
- [ ] Board đầu tiên có column mặc định.
- [ ] Board detail trả columns và tasks hoặc FE có thể gọi API tasks riêng.
- [ ] Task có `columnId` và `position`.
- [ ] `PUT /tasks/{taskId}/move` lưu được column và position.
- [ ] Backend kiểm tra quyền ở mọi API.
- [ ] FE chỉ dùng route canonical `/projects/{projectId}/kanban`.
