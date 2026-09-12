# 📋 Danh Sách Đầy Đủ API Endpoints - EnterpriseTaskManagement

> Tài liệu này liệt kê **tất cả API** cần triển khai theo nghiệp vụ trong README.
> Các API được sắp xếp theo **thứ tự phụ thuộc** — module nền tảng đặt trước, module phụ thuộc đặt sau.

---

## 🔗 Sơ đồ Phụ thuộc giữa các Module

```
                    ┌─────────────────┐
                    │  1. Auth &      │
                    │     Account     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ 2. Role &       │
                    │    Permission   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
     │ 3. Department │ │4.Position│ │ 22. Audit   │
     └────────┬──────┘ └────┬─────┘ │     Log     │
              │              │       └─────────────┘
              └──────┬───────┘
                     │
            ┌────────▼────────┐
            │ 5. User         │
            │    Management   │
            └────────┬────────┘
                     │
       ┌─────────────┼─────────────────────┐
       │             │                     │
┌──────▼─────┐ ┌─────▼──────┐  ┌───────────▼──────────┐
│ 6. Project │ │19.Notif.   │  │ 23. Communication    │
└──────┬─────┘ └────────────┘  └──────────────────────┘
       │
  ┌────┼───────────────┐
  │    │               │
┌─▼──┐ ▼          ┌────▼────┐
│7.PM│ 8.Mile     │18.Label │
└────┘ stone      └─────────┘
       │
┌──────▼──────┐
│ 9. Kanban   │
│    Board    │
└──────┬──────┘
       │
┌──────▼──────┐
│ 10. Kanban  │
│    Column   │
└──────┬──────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│                      11. TASK                           │
│  (Module trung tâm - nhiều module phụ thuộc vào nó)     │
└───┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬────┘
    │      │      │      │      │      │      │      │
   12.    13.    14.    15.    16.    17.    20.    21.
  Assign Depend WorkLog Watch Comment Check  Attach Activity
  ment   ency                  list   list         Log
                               19.Tag
```

> **Quy tắc đọc**: Phải triển khai module **ở trên** trước khi làm module **ở dưới**.
> Ví dụ: Phải có Auth → Role → Department + Position → User → Project → Kanban → Task.

---

## 📌 Quy ước chung

| Ký hiệu | Ý nghĩa |
|---------|---------|
| 🔓 | API công khai, không cần đăng nhập |
| 🔐 | Yêu cầu Access Token (JWT Bearer) |
| 👑 | Yêu cầu quyền Admin |
| 📋 | Yêu cầu quyền Manager hoặc cao hơn |
| `{id}` | GUID parameter |
| `[Query]` | Query Parameters (phân trang, lọc, sắp xếp) |

**Base URL**: `/api/v1`

**Response chung**:
```json
{
  "isSuccess": true,
  "statusCode": 200,
  "message": "Success",
  "data": { },
  "errors": []
}
```

**Phân trang chung** (áp dụng cho tất cả GET list):
```
?page=1&pageSize=20&sortBy=createdAt&sortDirection=desc
```

---

## 🟢 TẦNG 1: Nền tảng (Không phụ thuộc module nào)

### 1. Authentication — `AuthController`

> **Phụ thuộc**: Không (Module nền tảng)
> **Entities**: `User`, `RefreshToken`, `LoginHistory`, `PasswordResetToken`, `UserSession`
> **Phải triển khai TRƯỚC TIÊN** vì mọi API khác đều cần JWT Token.

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 1 | `POST` | `/api/v1/auth/login` | Đăng nhập, trả về AccessToken + RefreshToken | 🔓 | NV1: Đăng nhập bằng email và mật khẩu |
| 2 | `POST` | `/api/v1/auth/refresh-token` | Làm mới Access Token | 🔓 | NV1: Làm mới Access Token khi hết hạn |
| 3 | `POST` | `/api/v1/auth/logout` | Đăng xuất, thu hồi RefreshToken | 🔐 | NV1: Đăng xuất khỏi hệ thống |
| 4 | `POST` | `/api/v1/auth/setup-password` | Thiết lập mật khẩu lần đầu | 🔓 | NV1: Lần đầu đăng nhập phải thiết lập mật khẩu |
| 5 | `POST` | `/api/v1/auth/change-password` | Thay đổi mật khẩu | 🔐 | NV1: Thay đổi mật khẩu sau khi đăng nhập |
| 6 | `POST` | `/api/v1/auth/forgot-password` | Gửi email đặt lại mật khẩu | 🔓 | NV1: Yêu cầu đặt lại mật khẩu khi quên |
| 7 | `POST` | `/api/v1/auth/reset-password` | Đặt lại mật khẩu bằng token | 🔓 | NV1: Đặt lại mật khẩu |
| 8 | `GET` | `/api/v1/auth/me` | Lấy thông tin user hiện tại | 🔐 | Hỗ trợ FE hiển thị profile |

**Request/Response chi tiết:**

```
POST /api/v1/auth/login
Request:  { "email": "string", "password": "string" }
Response: { "accessToken": "string", "refreshToken": "string", "expiresAt": "datetime" }
Logic:    - Validate email/password
          - Kiểm tra UserStatus != Locked
          - Nếu sai quá 5 lần → auto lock (LockoutEnd = now + 30min)
          - Ghi LoginHistory
          - Cập nhật LastLoginAt

POST /api/v1/auth/refresh-token
Request:  { "refreshToken": "string" }
Response: { "accessToken": "string", "refreshToken": "string", "expiresAt": "datetime" }
Logic:    - Validate RefreshToken (chưa hết hạn, chưa bị revoke)
          - Tạo AccessToken mới + RefreshToken mới (rotation)

POST /api/v1/auth/forgot-password
Request:  { "email": "string" }
Response: { "message": "Email sent" }
Logic:    - Tạo PasswordResetToken (hash, expiresAt)
          - Gửi email chứa link reset

POST /api/v1/auth/reset-password
Request:  { "token": "string", "newPassword": "string", "confirmPassword": "string" }
Logic:    - Validate token (chưa hết hạn, chưa used)
          - Cập nhật PasswordHash
          - Đánh dấu token đã dùng
```

---

### 2. Role & Permission — `RoleController`, `PermissionController`

> **Phụ thuộc**: Auth (cần đăng nhập)
> **Entities**: `Role`, `Permission`, `RolePermission`, `UserRole`
> **Lý do ưu tiên**: Phải có Role/Permission trước khi gán cho User, phân quyền cho mọi API khác.

| # | Method | Route | Mô tả | Auth |
|---|--------|-------|-------|------|
| 9 | `POST` | `/api/v1/roles` | Tạo vai trò mới | 👑 |
| 10 | `GET` | `/api/v1/roles` | Danh sách vai trò | 🔐 |
| 11 | `GET` | `/api/v1/roles/{id}` | Chi tiết vai trò (kèm permissions) | 🔐 |
| 12 | `PUT` | `/api/v1/roles/{id}` | Cập nhật vai trò | 👑 |
| 13 | `DELETE` | `/api/v1/roles/{id}` | Xóa vai trò | 👑 |
| 14 | `POST` | `/api/v1/roles/{id}/permissions` | Gán quyền cho vai trò | 👑 |
| 15 | `DELETE` | `/api/v1/roles/{roleId}/permissions/{permissionId}` | Gỡ quyền khỏi vai trò | 👑 |
| 16 | `GET` | `/api/v1/permissions` | Danh sách tất cả quyền | 👑 |
| 17 | `GET` | `/api/v1/permissions/modules` | Danh sách quyền theo module | 👑 |

---

## 🔵 TẦNG 2: Tổ chức (Phụ thuộc Auth + Role)

### 3. Department — `DepartmentController`

> **Phụ thuộc**: Auth, Role (cần đăng nhập + phân quyền Admin)
> **Entities**: `Department`
> **Lý do ưu tiên**: User/EmployeeProfile thuộc Department → phải tạo Department trước.

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 18 | `POST` | `/api/v1/departments` | Tạo phòng ban | 👑 | NV2: Tạo mới phòng ban |
| 19 | `GET` | `/api/v1/departments` | Danh sách phòng ban | 🔐 | NV2: Xem danh sách phòng ban |
| 20 | `GET` | `/api/v1/departments/{id}` | Chi tiết phòng ban | 🔐 | NV2: Xem chi tiết phòng ban |
| 21 | `PUT` | `/api/v1/departments/{id}` | Cập nhật phòng ban | 👑 | NV2: Cập nhật thông tin |
| 22 | `PUT` | `/api/v1/departments/{id}/head` | Chỉ định/thay đổi trưởng phòng | 👑 | NV2: Chỉ định trưởng phòng |
| 23 | `PUT` | `/api/v1/departments/{id}/deactivate` | Khóa/ngừng hoạt động | 👑 | NV2: Khóa phòng ban |
| 24 | `PUT` | `/api/v1/departments/{id}/activate` | Mở lại hoạt động | 👑 | NV2: Mở lại |
| 25 | `GET` | `/api/v1/departments/{id}/statistics` | Thống kê (số NV, số dự án) | 🔐 | NV2: Theo dõi số lượng NV, dự án |

```
POST /api/v1/departments
Request:  { "name": "string", "code": "string", "description": "string", "headId": "guid?" }
Logic:    - Validate name unique
          - NV2: Không cho xóa khi còn NV hoặc dự án → kiểm tra ở API deactivate

GET /api/v1/departments/{id}/statistics
Response: { "employeeCount": 15, "projectCount": 3, "activeProjectCount": 2 }
```

---

### 4. Position — `PositionController`

> **Phụ thuộc**: Auth
> **Entities**: `Position`
> **Lý do ưu tiên**: EmployeeProfile tham chiếu Position.

| # | Method | Route | Mô tả | Auth |
|---|--------|-------|-------|------|
| 26 | `POST` | `/api/v1/positions` | Tạo chức vụ | 👑 |
| 27 | `GET` | `/api/v1/positions` | Danh sách chức vụ | 🔐 |
| 28 | `PUT` | `/api/v1/positions/{id}` | Cập nhật chức vụ | 👑 |
| 29 | `DELETE` | `/api/v1/positions/{id}` | Xóa chức vụ | 👑 |

---

### 5. User Management — `UserController`

> **Phụ thuộc**: Auth, Role, Department, Position
> **Entities**: `User`, `EmployeeProfile`, `UserRole`, `EmailInvitation`, `NotificationSetting`
> **Lý do**: User phải thuộc Department, có Position, có Role → phải tạo 3 thứ đó trước.

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 30 | `POST` | `/api/v1/users/invite` | Mời nhân viên qua email | 👑 | NV3: Mời NV tham gia qua email |
| 31 | `POST` | `/api/v1/users/activate` | Kích hoạt tài khoản (sau setup password) | 🔓 | NV3: Kích hoạt sau khi thiết lập mật khẩu |
| 32 | `GET` | `/api/v1/users` | Danh sách nhân viên (phân trang, lọc) | 🔐 | NV3: Xem danh sách |
| 33 | `GET` | `/api/v1/users/{id}` | Chi tiết nhân viên | 🔐 | NV3: Xem chi tiết |
| 34 | `PUT` | `/api/v1/users/{id}/profile` | Cập nhật thông tin cá nhân | 🔐 | NV3: Cập nhật thông tin cá nhân |
| 35 | `PUT` | `/api/v1/users/{id}/avatar` | Thay đổi ảnh đại diện | 🔐 | NV3: Thay đổi ảnh đại diện |
| 36 | `PUT` | `/api/v1/users/{id}/department` | Chuyển phòng ban | 👑 | NV3: Chuyển NV sang phòng ban khác |
| 37 | `PUT` | `/api/v1/users/{id}/position` | Thay đổi chức vụ | 👑 | NV3: Thay đổi chức vụ |
| 38 | `PUT` | `/api/v1/users/{id}/roles` | Thay đổi vai trò | 👑 | NV3: Thay đổi vai trò |
| 39 | `PUT` | `/api/v1/users/{id}/lock` | Khóa tài khoản | 👑 | NV3: Khóa tài khoản |
| 40 | `PUT` | `/api/v1/users/{id}/unlock` | Mở khóa tài khoản | 👑 | NV3: Mở khóa tài khoản |
| 41 | `GET` | `/api/v1/users/{id}/status` | Trạng thái làm việc | 🔐 | NV3: Theo dõi trạng thái |
| 42 | `GET` | `/api/v1/users/{id}/login-history` | Lịch sử đăng nhập | 👑 | NV1: Ghi nhận lịch sử đăng nhập |

```
POST /api/v1/users/invite
Request:  { 
  "email": "string", 
  "firstName": "string", 
  "lastName": "string",
  "departmentId": "guid", 
  "positionId": "guid", 
  "roleIds": ["guid"] 
}
Logic:    - Tạo User (Status = PendingActivation)
          - Tạo EmailInvitation
          - Gửi email chứa link activate + setup password
          - NV3: Không xóa vật lý → dùng SoftDelete
```

---

## 🟡 TẦNG 3: Quản lý Dự án (Phụ thuộc User + Department)

### 6. Project — `ProjectController`

> **Phụ thuộc**: User, Department (Project thuộc Department, có Manager là User)
> **Entities**: `Project`, `ProjectAttachment`, `ProjectMilestone`

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 43 | `POST` | `/api/v1/projects` | Tạo dự án | 📋 | NV4: Tạo dự án mới |
| 44 | `GET` | `/api/v1/projects` | Danh sách dự án (filter, paging) | 🔐 | NV4: Xem danh sách dự án |
| 45 | `GET` | `/api/v1/projects/{id}` | Chi tiết dự án | 🔐 | NV4: Xem chi tiết dự án |
| 46 | `PUT` | `/api/v1/projects/{id}` | Cập nhật thông tin | 📋 | NV4: Cập nhật thông tin |
| 47 | `PUT` | `/api/v1/projects/{id}/schedule` | Thiết lập thời gian | 📋 | NV4: Thiết lập thời gian bắt đầu/kết thúc |
| 48 | `PUT` | `/api/v1/projects/{id}/start` | Bắt đầu dự án | 📋 | Chuyển trạng thái Planning → Active |
| 49 | `PUT` | `/api/v1/projects/{id}/complete` | Đóng/hoàn thành dự án | 📋 | NV4: Đóng dự án |
| 50 | `PUT` | `/api/v1/projects/{id}/cancel` | Hủy dự án | 📋 | Chuyển trạng thái → Cancelled |
| 51 | `PUT` | `/api/v1/projects/{id}/hold` | Tạm dừng | 📋 | Chuyển trạng thái → OnHold |
| 52 | `PUT` | `/api/v1/projects/{id}/resume` | Tiếp tục | 📋 | Khôi phục từ OnHold |
| 53 | `PUT` | `/api/v1/projects/{id}/archive` | Lưu trữ dự án | 📋 | NV4: Lưu trữ dự án |
| 54 | `PUT` | `/api/v1/projects/{id}/restore` | Khôi phục dự án đã lưu trữ | 📋 | NV4: Khôi phục dự án |
| 55 | `GET` | `/api/v1/projects/{id}/progress` | Tiến độ dự án | 🔐 | NV4: Theo dõi tiến độ |
| 56 | `GET` | `/api/v1/projects/{id}/statistics` | Thống kê (tasks, members) | 🔐 | NV4: Theo dõi số công việc, thành viên |

```
POST /api/v1/projects
Request: {
  "code": "PRJ-001",
  "name": "string",
  "description": "string",
  "departmentId": "guid",
  "managerId": "guid",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "priority": "High"  // enum: Low, Medium, High, Critical
}

GET /api/v1/projects?page=1&pageSize=20&status=Active&departmentId=xxx&sortBy=startDate
```

---

### 7. Project Member — `ProjectMemberController`

> **Phụ thuộc**: Project, User
> **Entities**: `ProjectMember`

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 57 | `POST` | `/api/v1/projects/{projectId}/members` | Thêm thành viên | 📋 | NV5: Thêm thành viên vào dự án |
| 58 | `DELETE` | `/api/v1/projects/{projectId}/members/{userId}` | Loại thành viên | 📋 | NV5: Loại thành viên khỏi dự án |
| 59 | `PUT` | `/api/v1/projects/{projectId}/members/{userId}/role` | Thay đổi vai trò | 📋 | NV5: Thay đổi vai trò thành viên |
| 60 | `GET` | `/api/v1/projects/{projectId}/members` | Danh sách thành viên | 🔐 | NV5: Xem danh sách thành viên |
| 61 | `GET` | `/api/v1/projects/{projectId}/members/{userId}/access` | Kiểm tra quyền truy cập | 🔐 | NV5: Kiểm tra quyền truy cập |

```
POST /api/v1/projects/{projectId}/members
Request: { "userId": "guid", "role": "Developer" }
         // role enum: Owner, Manager, Developer, Tester, Viewer

GET /api/v1/projects/{projectId}/members
Response: [{ "userId": "guid", "fullName": "string", "role": "Developer", "joinedAt": "datetime" }]
```

---

### 8. Project Milestone — `ProjectMilestoneController`

> **Phụ thuộc**: Project
> **Entities**: `ProjectMilestone`

| # | Method | Route | Mô tả | Auth |
|---|--------|-------|-------|------|
| 62 | `POST` | `/api/v1/projects/{projectId}/milestones` | Tạo milestone | 📋 |
| 63 | `GET` | `/api/v1/projects/{projectId}/milestones` | Danh sách milestones | 🔐 |
| 64 | `PUT` | `/api/v1/projects/{projectId}/milestones/{id}` | Cập nhật milestone | 📋 |
| 65 | `PUT` | `/api/v1/projects/{projectId}/milestones/{id}/complete` | Đánh dấu hoàn thành | 📋 |
| 66 | `DELETE` | `/api/v1/projects/{projectId}/milestones/{id}` | Xóa milestone | 📋 |

---

## 🟠 TẦNG 4: Kanban & Task (Phụ thuộc Project)

### 9. Kanban Board — `KanbanBoardController`

> **Phụ thuộc**: Project (Board thuộc về Project)
> **Entities**: `KanbanBoard`

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 67 | `POST` | `/api/v1/projects/{projectId}/boards` | Tạo bảng Kanban | 📋 | NV6: Tạo bảng Kanban cho dự án |
| 68 | `GET` | `/api/v1/projects/{projectId}/boards` | Danh sách boards | 🔐 | NV6: Xem boards |
| 69 | `GET` | `/api/v1/projects/{projectId}/boards/{id}` | Chi tiết board (kèm columns + tasks) | 🔐 | NV6: Full board view |
| 70 | `PUT` | `/api/v1/projects/{projectId}/boards/{id}` | Cập nhật thông tin board | 📋 | NV6: Cập nhật thông tin bảng |
| 71 | `DELETE` | `/api/v1/projects/{projectId}/boards/{id}` | Xóa board | 📋 | Xóa board |

### 10. Kanban Column — `KanbanColumnController`

> **Phụ thuộc**: KanbanBoard
> **Entities**: `KanbanColumn`

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 72 | `POST` | `/api/v1/boards/{boardId}/columns` | Tạo cột trạng thái | 📋 | NV6: Tạo cột trạng thái |
| 73 | `PUT` | `/api/v1/boards/{boardId}/columns/{id}` | Chỉnh sửa cột | 📋 | NV6: Chỉnh sửa cột |
| 74 | `PUT` | `/api/v1/boards/{boardId}/columns/reorder` | Thay đổi thứ tự cột | 📋 | NV6: Thay đổi thứ tự cột |
| 75 | `PUT` | `/api/v1/boards/{boardId}/columns/{id}/wip-limit` | Thiết lập WIP limit | 📋 | NV6: Thiết lập WIP Limit |
| 76 | `DELETE` | `/api/v1/boards/{boardId}/columns/{id}` | Xóa cột | 📋 | Xóa cột |
| 77 | `GET` | `/api/v1/boards/{boardId}/columns/{id}/statistics` | Thống kê task theo cột | 🔐 | NV6: Theo dõi số công việc theo cột |

```
PUT /api/v1/boards/{boardId}/columns/reorder
Request: { "columnOrders": [{ "columnId": "guid", "position": 1 }, ...] }

PUT /api/v1/boards/{boardId}/columns/{id}/wip-limit
Request: { "wipLimit": 5 }
```

---

### 11. Task — `TaskController`

> **Phụ thuộc**: Project, KanbanBoard, KanbanColumn, User
> **Entities**: `TaskItem`
> **Đây là module lớn nhất** với nhiều API nhất.

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 78 | `POST` | `/api/v1/tasks` | Tạo công việc | 🔐 | NV7: Tạo công việc |
| 79 | `GET` | `/api/v1/tasks` | Danh sách công việc (filter, paging) | 🔐 | NV7: Danh sách |
| 80 | `GET` | `/api/v1/tasks/{id}` | Chi tiết công việc (full data) | 🔐 | NV7: Chi tiết |
| 81 | `PUT` | `/api/v1/tasks/{id}` | Cập nhật thông tin | 🔐 | NV7: Cập nhật thông tin |
| 82 | `PUT` | `/api/v1/tasks/{id}/priority` | Thiết lập độ ưu tiên | 🔐 | NV7: Thiết lập độ ưu tiên |
| 83 | `PUT` | `/api/v1/tasks/{id}/schedule` | Thiết lập thời hạn | 🔐 | NV7: Thiết lập thời hạn hoàn thành |
| 84 | `PUT` | `/api/v1/tasks/{id}/estimate` | Thiết lập giờ dự kiến | 🔐 | NV7: Thiết lập thời gian dự kiến |
| 85 | `PUT` | `/api/v1/tasks/{id}/story-point` | Thiết lập story point | 🔐 | Agile estimation |
| 86 | `PUT` | `/api/v1/tasks/{id}/progress` | Cập nhật tiến độ (0-100%) | 🔐 | NV7: Cập nhật tiến độ |
| 87 | `PUT` | `/api/v1/tasks/{id}/status` | Chuyển trạng thái | 🔐 | NV7: Chuyển trạng thái |
| 88 | `PUT` | `/api/v1/tasks/{id}/move` | Di chuyển sang cột Kanban khác | 🔐 | NV7: Di chuyển giữa các cột Kanban |
| 89 | `POST` | `/api/v1/tasks/{id}/copy` | Sao chép công việc | 🔐 | NV7: Sao chép công việc |
| 90 | `PUT` | `/api/v1/tasks/{id}/archive` | Lưu trữ | 🔐 | NV7: Lưu trữ công việc |
| 91 | `PUT` | `/api/v1/tasks/{id}/restore` | Khôi phục | 🔐 | NV7: Khôi phục công việc |
| 92 | `PUT` | `/api/v1/tasks/{id}/complete` | Đánh dấu hoàn thành | 🔐 | NV7: Đánh dấu hoàn thành |
| 93 | `DELETE` | `/api/v1/tasks/{id}` | Xóa (soft delete) | 🔐 | Xóa công việc |
| 94 | `PUT` | `/api/v1/tasks/{id}/parent` | Gán task cha | 🔐 | Sub-task support |
| 95 | `PUT` | `/api/v1/tasks/{id}/milestone` | Gán milestone | 🔐 | Milestone tracking |
| 96 | `GET` | `/api/v1/tasks/{id}/history` | Lịch sử thay đổi | 🔐 | NV7: Theo dõi lịch sử thay đổi |
| 97 | `GET` | `/api/v1/projects/{projectId}/tasks` | Tasks theo dự án | 🔐 | Lọc theo dự án |
| 98 | `GET` | `/api/v1/boards/{boardId}/tasks` | Tasks theo board (Kanban view) | 🔐 | Kanban view |

```
POST /api/v1/tasks
Request: {
  "projectId": "guid",
  "boardId": "guid",
  "columnId": "guid",
  "title": "string",
  "description": "string",
  "type": "Task",           // Task, Bug, Story, Epic, SubTask
  "priority": "Medium",     // Low, Medium, High, Critical
  "assigneeIds": ["guid"],  // Người thực hiện
  "startDate": "datetime?",
  "dueDate": "datetime?",
  "estimateHour": 8,
  "parentTaskId": "guid?"
}

PUT /api/v1/tasks/{id}/move
Request: { "columnId": "guid", "position": 2 }
```

---

### 12. Task Assignment — `TaskAssignmentController`

> **Phụ thuộc**: Task, User
> **Entities**: `TaskAssignment`

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 99 | `POST` | `/api/v1/tasks/{taskId}/assignments` | Giao công việc cho nhân viên | 🔐 | NV7: Giao công việc |
| 100 | `DELETE` | `/api/v1/tasks/{taskId}/assignments/{userId}` | Gỡ người thực hiện | 🔐 | NV7: Thay đổi người thực hiện |
| 101 | `GET` | `/api/v1/tasks/{taskId}/assignments` | Danh sách người thực hiện | 🔐 | Xem assignees |
| 102 | `GET` | `/api/v1/users/{userId}/tasks` | Công việc của user | 🔐 | My Tasks |

---

### 13. Task Dependency — `TaskDependencyController`

> **Phụ thuộc**: Task
> **Entities**: `TaskDependency`

| # | Method | Route | Mô tả | Auth |
|---|--------|-------|-------|------|
| 103 | `POST` | `/api/v1/tasks/{taskId}/dependencies` | Tạo dependency | 🔐 |
| 104 | `DELETE` | `/api/v1/tasks/{taskId}/dependencies/{id}` | Xóa dependency | 🔐 |
| 105 | `GET` | `/api/v1/tasks/{taskId}/dependencies` | Danh sách dependencies | 🔐 |

```
POST /api/v1/tasks/{taskId}/dependencies
Request: { "dependsOnTaskId": "guid", "type": "BlockedBy" }
         // type: BlockedBy, Blocks, RelatedTo, DuplicateOf
```

---

### 14. WorkLog — `WorkLogController`

> **Phụ thuộc**: Task, User
> **Entities**: `WorkLog`

| # | Method | Route | Mô tả | Auth |
|---|--------|-------|-------|------|
| 106 | `POST` | `/api/v1/tasks/{taskId}/worklogs` | Ghi nhận thời gian làm việc | 🔐 |
| 107 | `GET` | `/api/v1/tasks/{taskId}/worklogs` | Danh sách worklogs | 🔐 |
| 108 | `PUT` | `/api/v1/tasks/{taskId}/worklogs/{id}` | Cập nhật worklog | 🔐 |
| 109 | `DELETE` | `/api/v1/tasks/{taskId}/worklogs/{id}` | Xóa worklog | 🔐 |

---

### 15. Task Watcher — `TaskWatcherController`

> **Phụ thuộc**: Task, User
> **Entities**: `TaskWatcher`

| # | Method | Route | Mô tả | Auth |
|---|--------|-------|-------|------|
| 110 | `POST` | `/api/v1/tasks/{taskId}/watchers` | Theo dõi task | 🔐 |
| 111 | `DELETE` | `/api/v1/tasks/{taskId}/watchers` | Hủy theo dõi | 🔐 |
| 112 | `GET` | `/api/v1/tasks/{taskId}/watchers` | Danh sách người theo dõi | 🔐 |

---

## 🟣 TẦNG 5: Tính năng bổ trợ Task (Phụ thuộc Task)

### 16. Comment — `CommentController`

> **Phụ thuộc**: Task, User
> **Entities**: `TaskComment`, `CommentMention`

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 113 | `POST` | `/api/v1/tasks/{taskId}/comments` | Thêm bình luận | 🔐 | NV8: Thêm bình luận |
| 114 | `PUT` | `/api/v1/tasks/{taskId}/comments/{id}` | Chỉnh sửa bình luận | 🔐 | NV8: Chỉnh sửa |
| 115 | `DELETE` | `/api/v1/tasks/{taskId}/comments/{id}` | Xóa bình luận | 🔐 | NV8: Xóa bình luận |
| 116 | `POST` | `/api/v1/tasks/{taskId}/comments/{id}/reply` | Trả lời bình luận | 🔐 | NV8: Trả lời bình luận |
| 117 | `GET` | `/api/v1/tasks/{taskId}/comments` | Lịch sử bình luận (paging) | 🔐 | NV8: Hiển thị lịch sử bình luận |

```
POST /api/v1/tasks/{taskId}/comments
Request: { 
  "content": "string", 
  "mentionUserIds": ["guid"],  // NV8: Nhắc tên (Mention)
  "parentCommentId": "guid?"   // Trả lời comment
}
Logic:   - Tạo TaskComment
         - Tạo CommentMention cho mỗi user được mention
         - Raise CommentAddedEvent → Notification cho assignees + watchers
         - Raise MemberMentionedEvent → Notification cho mentioned users
```

---

### 17. Checklist — `ChecklistController`

> **Phụ thuộc**: Task
> **Entities**: `Checklist`, `ChecklistItem`

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 118 | `POST` | `/api/v1/tasks/{taskId}/checklists` | Tạo checklist | 🔐 | NV10: Tạo checklist cho công việc |
| 119 | `PUT` | `/api/v1/tasks/{taskId}/checklists/{id}` | Cập nhật checklist | 🔐 | Cập nhật tên checklist |
| 120 | `DELETE` | `/api/v1/tasks/{taskId}/checklists/{id}` | Xóa checklist | 🔐 | Xóa checklist |
| 121 | `POST` | `/api/v1/checklists/{checklistId}/items` | Thêm mục kiểm tra | 🔐 | NV10: Thêm mục kiểm tra |
| 122 | `PUT` | `/api/v1/checklists/{checklistId}/items/{id}` | Chỉnh sửa mục | 🔐 | NV10: Chỉnh sửa mục |
| 123 | `PUT` | `/api/v1/checklists/{checklistId}/items/{id}/toggle` | Đánh dấu hoàn thành/bỏ | 🔐 | NV10: Đánh dấu hoàn thành từng mục |
| 124 | `DELETE` | `/api/v1/checklists/{checklistId}/items/{id}` | Xóa mục | 🔐 | Xóa mục |
| 125 | `GET` | `/api/v1/tasks/{taskId}/checklists` | Danh sách checklists + items + % | 🔐 | NV10: Theo dõi % hoàn thành |

```
GET /api/v1/tasks/{taskId}/checklists
Response: [{
  "id": "guid",
  "title": "Danh sách việc cần làm",
  "items": [
    { "id": "guid", "content": "Viết unit test", "isCompleted": true },
    { "id": "guid", "content": "Code review", "isCompleted": false }
  ],
  "completionPercentage": 50   // NV10: Theo dõi phần trăm hoàn thành
}]
```

---

### 18. Label — `LabelController`

> **Phụ thuộc**: Project (Label thuộc Project scope)
> **Entities**: `Label`, `TaskLabel`

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 126 | `POST` | `/api/v1/projects/{projectId}/labels` | Tạo nhãn | 🔐 | NV11: Tạo nhãn |
| 127 | `PUT` | `/api/v1/projects/{projectId}/labels/{id}` | Chỉnh sửa nhãn | 🔐 | NV11: Chỉnh sửa nhãn |
| 128 | `DELETE` | `/api/v1/projects/{projectId}/labels/{id}` | Xóa nhãn | 🔐 | NV11: Xóa nhãn |
| 129 | `GET` | `/api/v1/projects/{projectId}/labels` | Danh sách nhãn | 🔐 | Xem nhãn |
| 130 | `POST` | `/api/v1/tasks/{taskId}/labels/{labelId}` | Gán nhãn cho công việc | 🔐 | NV11: Gán nhãn cho công việc |
| 131 | `DELETE` | `/api/v1/tasks/{taskId}/labels/{labelId}` | Gỡ nhãn | 🔐 | NV11: Gỡ nhãn khỏi công việc |
| 132 | `GET` | `/api/v1/tasks?labelId={labelId}` | Lọc công việc theo nhãn | 🔐 | NV11: Lọc công việc theo nhãn |

---

### 19. Tag — `TagController`

> **Phụ thuộc**: Project (Tag có thể global hoặc project scope)
> **Entities**: `Tag`, `TaskTag`

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 133 | `POST` | `/api/v1/tags` | Tạo thẻ | 🔐 | NV12: Tạo thẻ |
| 134 | `PUT` | `/api/v1/tags/{id}` | Chỉnh sửa thẻ | 🔐 | NV12: Chỉnh sửa thẻ |
| 135 | `DELETE` | `/api/v1/tags/{id}` | Xóa thẻ | 🔐 | NV12: Xóa thẻ |
| 136 | `GET` | `/api/v1/tags` | Danh sách thẻ | 🔐 | Xem thẻ |
| 137 | `POST` | `/api/v1/tasks/{taskId}/tags/{tagId}` | Gán thẻ cho công việc | 🔐 | NV12: Gán thẻ cho công việc |
| 138 | `DELETE` | `/api/v1/tasks/{taskId}/tags/{tagId}` | Gỡ thẻ | 🔐 | NV12: Gỡ thẻ |
| 139 | `GET` | `/api/v1/tasks?tagId={tagId}` | Tìm kiếm theo thẻ | 🔐 | NV12: Tìm kiếm công việc theo thẻ |

---

### 20. Task Attachment — `TaskAttachmentController`

> **Phụ thuộc**: Task, FileManagement
> **Entities**: `TaskAttachment`

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 140 | `POST` | `/api/v1/tasks/{taskId}/attachments` | Tải tệp lên (multipart) | 🔐 | NV9: Tải tệp lên |
| 141 | `GET` | `/api/v1/tasks/{taskId}/attachments` | Danh sách tệp | 🔐 | NV9: Xem danh sách tệp |
| 142 | `GET` | `/api/v1/tasks/{taskId}/attachments/{id}/download` | Tải tệp về | 🔐 | NV9: Tải tệp về |
| 143 | `GET` | `/api/v1/tasks/{taskId}/attachments/{id}/preview` | Xem trước tệp | 🔐 | NV9: Xem trước tệp |
| 144 | `DELETE` | `/api/v1/tasks/{taskId}/attachments/{id}` | Xóa tệp | 🔐 | NV9: Xóa tệp |

```
POST /api/v1/tasks/{taskId}/attachments
Content-Type: multipart/form-data
Body: file (binary)
Logic: - NV9: Kiểm tra kích thước (max 50MB)
       - NV9: Kiểm tra định dạng (whitelist: .pdf, .doc, .xlsx, .png, .jpg...)
       - Lưu file vào storage (local/S3)
       - Tạo TaskAttachment record
```

---

## 🔵 TẦNG 6: File, Notification, Communication (Cross-cutting)

### 21. File Management — `FileController`

> **Phụ thuộc**: Auth
> **Entities**: `StoredFile`, `FileAttachment`
> **Dùng chung cho**: Task Attachments, Project Attachments, Message Attachments, Avatar

| # | Method | Route | Mô tả | Auth |
|---|--------|-------|-------|------|
| 145 | `POST` | `/api/v1/files/upload` | Upload file chung | 🔐 |
| 146 | `GET` | `/api/v1/files/{id}` | Lấy thông tin file | 🔐 |
| 147 | `GET` | `/api/v1/files/{id}/download` | Download file | 🔐 |
| 148 | `GET` | `/api/v1/files/{id}/preview` | Preview file (generate thumbnail/URL) | 🔐 |
| 149 | `DELETE` | `/api/v1/files/{id}` | Xóa file | 🔐 |

---

### 22. Notification — `NotificationController`

> **Phụ thuộc**: Auth (nhận notification cần đăng nhập)
> **Entities**: `Notification`, `NotificationRecipient`
> **Ghi chú**: Notification được **tạo tự động** bởi Domain Event Handlers, không có API tạo thủ công.

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 150 | `GET` | `/api/v1/notifications` | Danh sách thông báo (paging) | 🔐 | NV13: Theo dõi lịch sử thông báo |
| 151 | `GET` | `/api/v1/notifications/unread-count` | Số thông báo chưa đọc | 🔐 | Badge count cho FE |
| 152 | `PUT` | `/api/v1/notifications/{id}/read` | Đánh dấu đã đọc | 🔐 | NV13: Đánh dấu đã đọc |
| 153 | `PUT` | `/api/v1/notifications/read-all` | Đánh dấu tất cả đã đọc | 🔐 | NV13: Đánh dấu tất cả đã đọc |
| 154 | `DELETE` | `/api/v1/notifications/{id}` | Xóa thông báo | 🔐 | NV13: Xóa thông báo |
| 155 | `GET` | `/api/v1/notifications/settings` | Cài đặt notification | 🔐 | Xem cài đặt |
| 156 | `PUT` | `/api/v1/notifications/settings` | Cập nhật cài đặt | 🔐 | Tùy chỉnh |

```
Thông báo tự động (qua Domain Events + Outbox):
- TaskAssignedEvent        → "Bạn được giao task X"
- TaskStatusChangedEvent   → "Task X chuyển sang Done"
- CommentAddedEvent        → "User Y bình luận trên task X"
- MemberMentionedEvent     → "@bạn được nhắc đến trong task X"
- ProjectMemberAddedEvent  → "Bạn được thêm vào dự án Y"
- TaskOverdueEvent         → "Task X đã quá hạn"

SignalR Hub: /hubs/notifications → Push realtime (NV13: Gửi thông báo thời gian thực)
```

---

### 23. Communication — `ConversationController`, `MessageController`

> **Phụ thuộc**: Auth, User
> **Entities**: `Conversation`, `ConversationMember`, `Message`, `MessageAttachment`, `MessageDraft`, `MessageMention`, `MessageReaction`, `MessageRead`

| # | Method | Route | Mô tả | Auth |
|---|--------|-------|-------|------|
| 157 | `POST` | `/api/v1/conversations` | Tạo cuộc trò chuyện | 🔐 |
| 158 | `GET` | `/api/v1/conversations` | Danh sách cuộc trò chuyện | 🔐 |
| 159 | `GET` | `/api/v1/conversations/{id}` | Chi tiết cuộc trò chuyện | 🔐 |
| 160 | `POST` | `/api/v1/conversations/{id}/members` | Thêm thành viên | 🔐 |
| 161 | `DELETE` | `/api/v1/conversations/{id}/members/{userId}` | Xóa thành viên | 🔐 |
| 162 | `POST` | `/api/v1/conversations/{id}/messages` | Gửi tin nhắn | 🔐 |
| 163 | `GET` | `/api/v1/conversations/{id}/messages` | Lịch sử tin nhắn (paging) | 🔐 |
| 164 | `PUT` | `/api/v1/messages/{id}` | Chỉnh sửa tin nhắn | 🔐 |
| 165 | `DELETE` | `/api/v1/messages/{id}` | Xóa tin nhắn | 🔐 |
| 166 | `POST` | `/api/v1/messages/{id}/reactions` | Thả reaction | 🔐 |
| 167 | `DELETE` | `/api/v1/messages/{id}/reactions/{reactionId}` | Gỡ reaction | 🔐 |
| 168 | `PUT` | `/api/v1/conversations/{id}/read` | Đánh dấu đã đọc | 🔐 |
| 169 | `POST` | `/api/v1/conversations/{id}/drafts` | Lưu nháp | 🔐 |
| 170 | `GET` | `/api/v1/conversations/{id}/drafts` | Lấy nháp | 🔐 |

```
SignalR Hub: /hubs/chat → Push tin nhắn realtime
```

---

## 🟤 TẦNG 7: Audit, Dashboard, Report, Search (Phụ thuộc toàn bộ)

### 24. Activity Log — `ActivityLogController`

> **Phụ thuộc**: Task (ghi nhận mọi thay đổi của task)
> **Entities**: `TaskActivity`, `TaskHistory`
> **Ghi chú**: Activity log được **tạo tự động** bởi Domain Event Handlers.

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 171 | `GET` | `/api/v1/tasks/{taskId}/activities` | Lịch sử hoạt động task | 🔐 | NV14: Hiển thị lịch sử theo thời gian |
| 172 | `GET` | `/api/v1/projects/{projectId}/activities` | Hoạt động dự án | 🔐 | NV14: Ghi nhận mọi thay đổi |
| 173 | `GET` | `/api/v1/activity-logs` | Tất cả hoạt động (admin) | 👑 | NV14: Theo dõi người, thời gian |

```
Tự động ghi nhận (qua Domain Events):
- TaskCreated          → "User X tạo task Y"
- TaskStatusChanged    → "User X chuyển task Y từ Todo → InProgress"
- TaskAssigned         → "User X giao task Y cho User Z"
- CommentAdded         → "User X bình luận trên task Y"
- TaskPriorityChanged  → "User X đổi priority task Y từ Low → High"
```

---

### 25. Audit Log — `AuditLogController`

> **Phụ thuộc**: Auth (ghi nhận mọi thao tác CRUD)
> **Entities**: `AuditLog`
> **Ghi chú**: Audit Log được **tạo tự động** bởi SaveChanges interceptor.

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 174 | `GET` | `/api/v1/audit-logs` | Danh sách nhật ký kiểm toán | 👑 | NV15: Ghi nhận toàn bộ thao tác |
| 175 | `GET` | `/api/v1/audit-logs/{id}` | Chi tiết (before/after values) | 👑 | NV15: Lưu giá trị trước và sau |
| 176 | `GET` | `/api/v1/audit-logs/entity/{entityType}/{entityId}` | Audit log theo entity | 👑 | NV15: Hỗ trợ truy vết |

```
GET /api/v1/audit-logs?entityType=TaskItem&action=Update&userId=xxx&from=2026-01-01&to=2026-12-31
Response: [{
  "id": "guid",
  "entityType": "TaskItem",
  "entityId": "guid",
  "action": "Update",           // Create, Update, Delete
  "userId": "guid",
  "userName": "Nguyen Van A",
  "oldValues": "{\"status\":\"Todo\"}",        // NV15: Giá trị trước
  "newValues": "{\"status\":\"InProgress\"}",  // NV15: Giá trị sau
  "ipAddress": "192.168.1.1",                  // NV15: Địa chỉ IP
  "timestamp": "2026-07-30T10:00:00Z"         // NV15: Thời gian
}]
```

---

### 26. Dashboard — `DashboardController`

> **Phụ thuộc**: Department, User, Project, Task (thống kê tổng hợp)
> **Entities**: Không có entity riêng — query trực tiếp từ các bảng khác.

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 177 | `GET` | `/api/v1/dashboard/summary` | Thống kê tổng quan | 🔐 | NV16: Tất cả thống kê |
| 178 | `GET` | `/api/v1/dashboard/tasks-by-status` | Công việc theo trạng thái | 🔐 | NV16: Thống kê theo trạng thái |
| 179 | `GET` | `/api/v1/dashboard/tasks-by-priority` | Công việc theo mức ưu tiên | 🔐 | NV16: Thống kê theo mức ưu tiên |
| 180 | `GET` | `/api/v1/dashboard/overdue-tasks` | Công việc quá hạn | 🔐 | NV16: Thống kê công việc quá hạn |
| 181 | `GET` | `/api/v1/dashboard/recent-activities` | Hoạt động gần đây | 🔐 | NV16: Hiển thị hoạt động gần đây |
| 182 | `GET` | `/api/v1/dashboard/my-tasks` | Công việc của tôi | 🔐 | Personal dashboard |
| 183 | `GET` | `/api/v1/dashboard/project/{projectId}` | Dashboard theo dự án | 🔐 | Project-level dashboard |

```
GET /api/v1/dashboard/summary
Response: {
  "departmentCount": 5,        // NV16: Thống kê số lượng phòng ban
  "employeeCount": 50,         // NV16: Thống kê số lượng nhân viên
  "projectCount": 12,          // NV16: Thống kê số lượng dự án
  "activeProjectCount": 8,
  "totalTaskCount": 450,       // NV16: Thống kê số lượng công việc
  "completedTaskCount": 200,
  "overdueTaskCount": 15,      // NV16: Thống kê công việc quá hạn
  "unreadNotificationCount": 3 // NV16: Hiển thị thông báo mới
}
```

---

### 27. Report — `ReportController`

> **Phụ thuộc**: Project, Task, User, Department
> **Output**: File Excel (.xlsx) hoặc PDF

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 184 | `GET` | `/api/v1/reports/project-progress` | Báo cáo tiến độ dự án | 📋 | NV17: Xuất báo cáo tiến độ dự án |
| 185 | `GET` | `/api/v1/reports/employee-performance` | Báo cáo hiệu suất nhân viên | 📋 | NV17: Xuất báo cáo hiệu suất NV |
| 186 | `GET` | `/api/v1/reports/tasks-by-time` | Báo cáo công việc theo thời gian | 📋 | NV17: Xuất báo cáo CV theo thời gian |
| 187 | `GET` | `/api/v1/reports/department-summary` | Báo cáo theo phòng ban | 📋 | NV17: Xuất báo cáo theo phòng ban |

```
GET /api/v1/reports/project-progress?projectId=xxx&format=excel&from=2026-01-01&to=2026-12-31
Response: File download (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
         hoặc (application/pdf)
// NV17: Xuất dưới định dạng Excel hoặc PDF → query param ?format=excel|pdf
```

---

### 28. Search & Filter — `SearchController`

> **Phụ thuộc**: Task, Project, User, Department
> **Entities**: Không có entity riêng — full-text search / query.

| # | Method | Route | Mô tả | Auth | Nghiệp vụ README |
|---|--------|-------|-------|------|------------------|
| 188 | `GET` | `/api/v1/search` | Tìm kiếm toàn cục | 🔐 | NV18: Tìm kiếm theo tên CV, dự án, người, phòng ban |
| 189 | `GET` | `/api/v1/search/tasks` | Tìm kiếm công việc nâng cao | 🔐 | NV18: Lọc + sắp xếp + phân trang |

```
GET /api/v1/search?q=keyword&type=task,project,user
Response: {
  "tasks": [{ "id": "guid", "title": "string", ... }],
  "projects": [{ "id": "guid", "name": "string", ... }],
  "users": [{ "id": "guid", "fullName": "string", ... }]
}

GET /api/v1/search/tasks?
    q=keyword                     // NV18: Tìm kiếm theo tên công việc
    &projectId=guid               // NV18: Tìm kiếm theo dự án
    &assigneeId=guid              // NV18: Tìm kiếm theo người thực hiện
    &departmentId=guid            // NV18: Tìm kiếm theo phòng ban
    &status=InProgress            // NV18: Lọc theo trạng thái
    &priority=High                // NV18: Lọc theo mức ưu tiên
    &dueDateFrom=2026-01-01       // NV18: Lọc theo thời hạn
    &dueDateTo=2026-12-31
    &sortBy=dueDate               // NV18: Sắp xếp kết quả
    &sortDirection=asc
    &page=1                       // NV18: Phân trang kết quả
    &pageSize=20
```

---

## 📊 Tổng kết

### Tổng số API Endpoints: 189

| Tầng | Module | Số API | Ưu tiên |
|------|--------|--------|---------|
| 🟢 Tầng 1 | Auth | 8 | ⭐⭐⭐⭐⭐ |
| 🟢 Tầng 1 | Role & Permission | 9 | ⭐⭐⭐⭐⭐ |
| 🔵 Tầng 2 | Department | 8 | ⭐⭐⭐⭐⭐ |
| 🔵 Tầng 2 | Position | 4 | ⭐⭐⭐⭐ |
| 🔵 Tầng 2 | User Management | 13 | ⭐⭐⭐⭐⭐ |
| 🟡 Tầng 3 | Project | 14 | ⭐⭐⭐⭐⭐ |
| 🟡 Tầng 3 | Project Member | 5 | ⭐⭐⭐⭐ |
| 🟡 Tầng 3 | Project Milestone | 5 | ⭐⭐⭐ |
| 🟠 Tầng 4 | Kanban Board | 5 | ⭐⭐⭐⭐ |
| 🟠 Tầng 4 | Kanban Column | 6 | ⭐⭐⭐⭐ |
| 🟠 Tầng 4 | Task | 21 | ⭐⭐⭐⭐⭐ |
| 🟠 Tầng 4 | Task Assignment | 4 | ⭐⭐⭐⭐ |
| 🟠 Tầng 4 | Task Dependency | 3 | ⭐⭐⭐ |
| 🟠 Tầng 4 | WorkLog | 4 | ⭐⭐⭐ |
| 🟠 Tầng 4 | Task Watcher | 3 | ⭐⭐⭐ |
| 🟣 Tầng 5 | Comment | 5 | ⭐⭐⭐⭐ |
| 🟣 Tầng 5 | Checklist | 8 | ⭐⭐⭐⭐ |
| 🟣 Tầng 5 | Label | 7 | ⭐⭐⭐ |
| 🟣 Tầng 5 | Tag | 7 | ⭐⭐⭐ |
| 🟣 Tầng 5 | Task Attachment | 5 | ⭐⭐⭐⭐ |
| 🔵 Tầng 6 | File Management | 5 | ⭐⭐⭐⭐ |
| 🔵 Tầng 6 | Notification | 7 | ⭐⭐⭐⭐ |
| 🔵 Tầng 6 | Communication | 14 | ⭐⭐⭐ |
| 🟤 Tầng 7 | Activity Log | 3 | ⭐⭐⭐ |
| 🟤 Tầng 7 | Audit Log | 3 | ⭐⭐⭐ |
| 🟤 Tầng 7 | Dashboard | 7 | ⭐⭐⭐⭐ |
| 🟤 Tầng 7 | Report | 4 | ⭐⭐⭐ |
| 🟤 Tầng 7 | Search & Filter | 2 | ⭐⭐⭐⭐ |

---

### 🎯 Thứ tự triển khai đề xuất

```
Sprint 1 (Tuần 1-2):  Auth + Role/Permission + Department + Position + User
                       → 42 APIs | Nền tảng cho mọi thứ

Sprint 2 (Tuần 3-4):  Project + Project Member + Milestone
                       → 24 APIs | Core business

Sprint 3 (Tuần 5-6):  Kanban + Task + Task Assignment + Dependency
                       → 39 APIs | Trái tim hệ thống

Sprint 4 (Tuần 7-8):  Comment + Checklist + Label + Tag + Attachment
                       → 32 APIs | Tính năng bổ trợ task

Sprint 5 (Tuần 9-10): File + Notification + Communication
                       → 26 APIs | Cross-cutting concerns

Sprint 6 (Tuần 11-12): Activity Log + Audit + Dashboard + Report + Search
                        → 19 APIs + 7 API | Analytics & reporting
```

---

### Các thành phần Backend tự động (không phải API endpoint nhưng CẦN triển khai)

| Thành phần | Mô tả | Liên quan |
|-----------|-------|-----------|
| **Audit Interceptor** | Tự động ghi AuditLog khi SaveChanges | NV15 |
| **Activity Logger** | Domain Event Handler ghi TaskActivity | NV14 |
| **Notification Creator** | Domain Event Handler tạo Notification | NV13 |
| **Outbox Processor** | Background Service dispatch events | ✅ Đã có |
| **SignalR Hub - Notifications** | `/hubs/notifications` | NV13 |
| **SignalR Hub - Chat** | `/hubs/chat` | Communication |
| **Soft Delete Query Filter** | Global filter `IsDeleted == false` | NV3 |
| **JWT Middleware** | Authentication + Authorization | NV1 |
| **Global Exception Handler** | Middleware xử lý exception | Cross-cutting |
| **Seed Data** | Admin user, default roles, permissions | Khởi tạo |
