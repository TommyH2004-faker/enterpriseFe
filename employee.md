# Employee API Contract

Tài liệu này mô tả API Employee hiện có để frontend tích hợp.

## 1. Base URL

Development:

```text
https://localhost:<port>/api/v1
```

Các endpoint đọc và tạo hiện có:

```http
POST /employees
GET  /employees
GET  /positions
GET  /departments/get-all
```

`GET /employees`, `GET /positions` và `GET /departments/get-all` dùng để dựng bảng Employee và các dropdown phòng ban/chức vụ.

## 2. Authentication

Controller yêu cầu đăng nhập bằng JWT:

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

Request không có token hợp lệ sẽ bị từ chối bởi `[Authorize]`.

## 3. Tạo nhân viên

### Request

```http
POST /api/v1/employees
```

Body:

```json
{
  "employeeCode": "EMP001",
  "fullName": "Nguyen Van A",
  "email": "vana@company.com",
  "departmentId": "00000000-0000-0000-0000-000000000001",
  "positionId": "00000000-0000-0000-0000-000000000002",
  "joinedDate": "2026-09-07T00:00:00Z"
}
```

### Các field

| Field | Type | Required | Rule |
|---|---|---:|---|
| `employeeCode` | string | Có | Từ 4 đến 50 ký tự; nên dùng mã duy nhất, ví dụ `EMP001` |
| `fullName` | string | Có | Không rỗng, tối đa 200 ký tự |
| `email` | string | Có | Email hợp lệ, tối đa 255 ký tự |
| `departmentId` | UUID | Có | ID phòng ban tồn tại và đang hoạt động |
| `positionId` | UUID | Có | ID chức vụ tồn tại và đang hoạt động |
| `joinedDate` | ISO datetime | Không | Không được lớn hơn thời điểm hiện tại; bỏ qua hoặc gửi `null` để backend tự dùng thời điểm hiện tại |

Frontend không gửi các field sau:

```text
userId
username
password
role
status
```

Backend tự xử lý các giá trị này.

## 4. Thành công

HTTP status: `200 OK`

Response:

```json
{
  "isSuccess": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "employeeId": "00000000-0000-0000-0000-000000000003",
    "userId": "00000000-0000-0000-0000-000000000004",
    "employeeCode": "EMP001",
    "username": "emp001"
  },
  "errors": []
}
```

Ý nghĩa:

| Field | Ý nghĩa |
|---|---|
| `employeeId` | ID của `EmployeeProfile` |
| `userId` | ID tài khoản đăng nhập được tạo tương ứng |
| `employeeCode` | Mã nhân viên đã chuẩn hóa thành chữ hoa |
| `username` | Username backend tự sinh từ mã nhân viên |

## 5. Lấy danh sách nhân viên

### Request

```http
GET /api/v1/employees
```

Query params tùy chọn:

| Param | Type | Ý nghĩa |
|---|---|---|
| `search` | string | Tìm theo mã nhân viên, họ tên hoặc email |
| `departmentId` | UUID | Lọc theo phòng ban |
| `positionId` | UUID | Lọc theo chức vụ |
| `includeInactive` | boolean | Mặc định `false`; đặt `true` để lấy cả nhân viên khóa |

Ví dụ:

```http
GET /api/v1/employees?search=nguyen&departmentId=<department-id>&includeInactive=false
```

### Response

HTTP status: `200 OK`

```json
{
  "isSuccess": true,
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "employee-profile-guid",
      "userId": "user-guid",
      "employeeCode": "EMP001",
      "fullName": "Nguyen Van A",
      "email": "vana@company.com",
      "departmentId": "department-guid",
      "departmentName": "Phat trien phan mem",
      "positionId": "position-guid",
      "positionName": "Frontend Developer",
      "positionLevelName": "Staff",
      "joinedDate": "2026-09-07T00:00:00Z",
      "isActive": true,
      "createdDate": "2026-09-07T00:00:00Z"
    }
  ],
  "errors": []
}
```

Table FE mapping:

```text
name       <- fullName
email      <- email
department <- departmentName
role       <- positionName
status     <- isActive
joinDate   <- joinedDate
```

`role` trong bảng mock cũ nên đổi tên thành `positionName`. Quyền truy cập `EMPLOYEE` là role backend, không có trong response list hiện tại.

## 6. Lấy danh sách chức vụ

### Request

```http
GET /api/v1/positions?includeInactive=false
```

`includeInactive` mặc định là `false`.

### Response

```json
{
  "isSuccess": true,
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "position-guid",
      "code": "DEV",
      "name": "Frontend Developer",
      "description": "...",
      "level": 1,
      "levelName": "Staff",
      "isActive": true,
      "employeeCount": 3,
      "createdDate": "2026-09-07T00:00:00Z"
    }
  ],
  "errors": []
}
```

FE dùng `id` làm value và `name` làm label cho select chức vụ.

## 7. Lấy danh sách phòng ban

### Request

```http
GET /api/v1/departments/get-all?pageNumber=1&pageSize=100&isActive=true&sortBy=name
```

Route cũ vẫn hoạt động:

```http
GET /department/get-all?pageNumber=1&pageSize=100&isActive=true&sortBy=name
```

Query params chính:

| Param | Type | Default | Ý nghĩa |
|---|---|---:|---|
| `pageNumber` | number | `1` | Trang bắt đầu từ 1 |
| `pageSize` | number | `10` | Từ 1 đến 100 |
| `isActive` | boolean | không lọc | Dùng `true` cho dropdown phòng ban đang hoạt động |
| `code` | string | không lọc | Tìm theo mã |
| `name` | string | không lọc | Tìm theo tên |
| `sortBy` | string | `name` | `name`, `code`, `createdAt`, `updatedAt`, `status` |
| `sortDescending` | boolean | `false` | Sắp xếp giảm dần |

### Response

```json
{
  "message": "Lấy danh sách phòng ban thành công",
  "data": {
    "items": [
      {
        "id": "department-guid",
        "code": "IT",
        "name": "Phat trien phan mem",
        "isActive": true,
        "description": "...",
        "managerUserId": null,
        "createdAt": "2026-09-07T00:00:00Z",
        "updatedAt": null
      }
    ],
    "pageNumber": 1,
    "pageSize": 100,
    "totalCount": 1,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

FE đọc danh sách bằng `response.data.items`. Dùng `item.id` làm value và `item.name` làm label.

> Khác với Employee và Position, Department controller hiện dùng response wrapper cũ gồm `message` và `data`, không có `isSuccess`.

## 8. Backend tự thực hiện

Khi tạo thành công, backend sẽ:

1. Kiểm tra mã nhân viên chưa tồn tại.
2. Kiểm tra email chưa tồn tại.
3. Kiểm tra phòng ban tồn tại và đang active.
4. Kiểm tra chức vụ tồn tại và đang active.
5. Tự sinh username từ `employeeCode`.
6. Tự sinh mật khẩu tạm thời.
7. Hash mật khẩu và đặt `MustChangePassword = true`.
8. Tạo tài khoản `User`.
9. Gán role mặc định `EMPLOYEE`.
10. Tạo `EmployeeProfile` liên kết với `User`.
11. Tạo email verification.
12. Ghi `EmployeeCreatedIntegrationEvent` vào Outbox.
13. Commit dữ liệu một lần.
14. Background worker gửi email thông tin tài khoản.

Frontend không cần và không được tự tạo username, password hoặc role.

## 9. Lỗi nghiệp vụ

Response lỗi có dạng:

```json
{
  "isSuccess": false,
  "statusCode": 409,
  "code": "Employee.Code.AlreadyExists",
  "message": "Employee code already exists.",
  "errors": [
    {
      "code": "Employee.Code.AlreadyExists",
      "description": "Employee code already exists."
    }
  ]
}
```

### Các mã lỗi chính

| HTTP | Code | Khi nào xảy ra |
|---:|---|---|
| 400 | `Employee.Code.Required` | Thiếu mã nhân viên |
| 400 | `Employee.FullName.Required` | Thiếu họ tên |
| 400 | `Employee.Department.Required` | Thiếu phòng ban |
| 400 | `Employee.Position.Required` | Thiếu chức vụ |
| 400 | `Employee.Department.Inactive` | Phòng ban đã ngừng hoạt động |
| 400 | `Employee.Position.Inactive` | Chức vụ đã ngừng hoạt động |
| 404 | `Employee.Department.NotFound` | Không tìm thấy phòng ban |
| 404 | `Employee.Position.NotFound` | Không tìm thấy chức vụ |
| 409 | `Employee.Code.AlreadyExists` | Mã nhân viên đã tồn tại |
| 409 | `Employee.Email.AlreadyExists` | Email nhân viên đã tồn tại |

Frontend nên ưu tiên xử lý theo `code`, không nên kiểm tra chuỗi `message` để quyết định logic.

## 10. Lỗi validation từ FluentValidation

Nếu body sai định dạng hoặc thiếu field, global exception filter trả về:

```json
{
  "status": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ.",
  "errors": {
    "EmployeeCode": [
      "The length of 'Employee Code' must be 50 characters or fewer."
    ],
    "Email": [
      "The Email field is not a valid e-mail address."
    ]
  },
  "traceId": "..."
}
```

Vì vậy FE nên hiển thị lỗi theo tên field:

```text
errors.EmployeeCode
errors.FullName
errors.Email
errors.DepartmentId
errors.PositionId
errors.JoinedDate
```

## 11. Mapping form hiện tại sang API

Form hiện tại nên đổi như sau:

| Form hiện tại | API field |
|---|---|
| Họ và Tên | `fullName` |
| Email | `email` |
| Phòng ban | `departmentId` |
| Chức vụ | `positionId` |
| Ngày tham gia | `joinedDate` |
| Mã nhân viên | `employeeCode` |
| Vai trò truy cập | Không gửi; backend tự gán `EMPLOYEE` |
| Trạng thái | Không gửi; tài khoản mặc định active |

`role` trong mock data hiện không phải là `Position`. Ví dụ:

```text
Position: Frontend Developer
Role: EMPLOYEE
```

Tại API tạo nhân viên hiện tại, frontend chỉ chọn `positionId`; role được backend gán mặc định.

## 12. Ví dụ gọi API bằng fetch

```javascript
const response = await fetch(`${API_BASE_URL}/api/v1/employees`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    employeeCode: form.employeeCode,
    fullName: form.fullName,
    email: form.email,
    departmentId: form.departmentId,
    positionId: form.positionId,
    joinedDate: form.joinedDate || null,
  }),
})

const payload = await response.json()

if (!response.ok || !payload.isSuccess) {
  throw payload
}

console.log(payload.data.employeeId)
```

## 13. Lưu ý cho modal tạo nhân viên

Modal cần có các input:

```text
Mã nhân viên
Họ và tên
Email
Phòng ban
Chức vụ
Ngày tham gia
```

Các select phòng ban và chức vụ cần giữ UUID thật làm `value`:

```html
<option value="department-guid">Phát triển phần mềm</option>
<option value="position-guid">Frontend Developer</option>
```

Không gửi tên hiển thị thay cho UUID.

Sau khi API trả thành công:

1. Đóng modal.
2. Reset form.
3. Hiển thị thông báo tạo thành công.
4. Reload danh sách Employee bằng `GET /api/v1/employees`.
5. Không hiển thị mật khẩu tạm thời vì backend không trả mật khẩu trong response.

## 14. API chưa có trong backend

Các API sau chưa được triển khai, frontend không nên gọi chúng cho đến khi backend bổ sung:

```http
GET /api/v1/employees/{id}
GET /api/v1/employees/me
GET /api/v1/departments/options
GET /api/v1/positions/options
PUT /api/v1/employees/{id}
PATCH /api/v1/employees/{id}/activate
PATCH /api/v1/employees/{id}/deactivate
```

Frontend dùng các API danh sách ở trên thay cho endpoint `/options`. Endpoint `/options` chưa có và không nên gọi.
