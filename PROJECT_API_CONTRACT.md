# Project and Kanban API contract

FE expects `VITE_API_BASE_URL` to include the backend base path `/api/v1`.
Every endpoint below returns the common envelope:

```json
{
  "isSuccess": true,
  "statusCode": 200,
  "message": "Success",
  "data": {},
  "errors": []
}
```

## Projects

### `GET /projects`

Query parameters:

```text
page=1&pageSize=12&search=&status=Active&departmentId=&managerId=&sortBy=createdAt&sortDirection=desc
```

`data`:

```json
{
  "items": [
    {
      "id": "guid",
      "code": "PRJ-001",
      "name": "Website e-Commerce",
      "description": "...",
      "status": "Active",
      "priority": 2,
      "departmentId": "guid",
      "departmentName": "Engineering",
      "managerId": "guid",
      "managerName": "Nguyen Van A",
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": "2026-12-31T00:00:00Z",
      "progress": 65,
      "memberCount": 8,
      "taskCount": 42,
      "createdAt": "2026-01-01T00:00:00Z"
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

### `POST /projects`

Request:

```json
{
  "code": "PRJ-001",
  "name": "Website e-Commerce",
  "description": "Project description",
  "departmentId": "guid",
  "managerId": "guid",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "priority": 2
}
```

`priority` là enum số của backend: `0 = Low`, `1 = Medium`, `2 = High`, `3 = Critical`.

The response `data` should be the created project detail, including its `id`.

### `GET /projects/{projectId}`

Return `ProjectDetail` with the summary fields above and optionally:

```json
{
  "department": { "id": "guid", "code": "ENG", "name": "Engineering" },
  "manager": { "id": "guid", "fullName": "Nguyen Van A", "email": "a@example.com" },
  "members": []
}
```

### `GET /projects/{projectId}/progress`

```json
{
  "progress": 65,
  "completedTaskCount": 27,
  "totalTaskCount": 42,
  "overdueTaskCount": 3
}
```

### `GET /projects/{projectId}/statistics`

```json
{
  "taskCount": 42,
  "completedTaskCount": 27,
  "memberCount": 8,
  "activeMemberCount": 7,
  "milestoneCount": 4
}
```

## Project boards

### `POST /projects/{projectId}/boards`

Request:

```json
{
  "name": "Sprint chính",
  "description": "Luồng công việc chính của dự án"
}
```

Response `data`:

```json
{
  "id": "guid",
  "projectId": "guid",
  "name": "Sprint chính",
  "description": "Luồng công việc chính của dự án",
  "isDefault": true,
  "columnCount": 4,
  "taskCount": 0
}
```

Khi tạo board đầu tiên, backend nên tạo các column mặc định (`Todo`, `In Progress`, `Review`, `Done`) trong cùng transaction để FE có thể mở board ngay sau khi tạo.

### `GET /projects/{projectId}/boards`

```json
[
  {
    "id": "guid",
    "projectId": "guid",
    "name": "Default Board",
    "description": "Main workflow",
    "isDefault": true,
    "columnCount": 4,
    "taskCount": 42
  }
]
```

### `GET /projects/{projectId}/boards/{boardId}`

The preferred response includes columns and tasks in one request:

```json
{
  "id": "guid",
  "projectId": "guid",
  "name": "Default Board",
  "columns": [
    {
      "id": "guid",
      "boardId": "guid",
      "name": "Todo",
      "color": "#6c757d",
      "position": 1,
      "wipLimit": null,
      "tasks": []
    }
  ]
}
```

If tasks are not embedded, FE calls `GET /boards/{boardId}/tasks` and groups tasks by `columnId`.

Task shape:

```json
{
  "id": "guid",
  "projectId": "guid",
  "boardId": "guid",
  "columnId": "guid",
  "title": "Implement login API",
  "description": "...",
  "type": "Task",
  "priority": "High",
  "status": "Todo",
  "dueDate": "2026-09-30T00:00:00Z",
  "assignees": [{ "id": "guid", "fullName": "Nguyen Van A", "avatarUrl": null }],
  "labels": [{ "id": "guid", "name": "Backend", "color": "#321fdb" }],
  "commentCount": 2,
  "attachmentCount": 1,
  "position": 1
}
```

### `PUT /tasks/{taskId}/move`

Request when dragging a task:

```json
{
  "columnId": "target-column-guid",
  "position": 2
}
```

## Existing option APIs used by project UI

- `GET /departments?pageNumber=1&pageSize=100&sortBy=Name` for department filters/forms.
- `GET /employees?includeInactive=false` for project manager selection.

## Error behavior

- `401`: existing Axios refresh/login flow.
- `403`: existing global interceptor redirects to `/403`.
- `404`: backend should return 404 for missing project/board/task; FE displays the error state.
- `422` or `400`: return field-level validation messages in `errors` so the create form can display them later.
