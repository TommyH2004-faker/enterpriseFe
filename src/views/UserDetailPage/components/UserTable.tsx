import React from 'react'
import {
  CBadge,
  CButton,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import { User } from 'src/types/user'


interface UserTableProps {
  users: User[]
  loading?: boolean
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

const getStatusInfo = (status: number) => {
  switch (status) {
    case 1:
      return { label: 'Chờ kích hoạt', color: 'warning' as const }
    case 2:
      return { label: 'Hoạt động', color: 'success' as const }
    case 3:
      return { label: 'Không hoạt động', color: 'secondary' as const }
    case 4:
      return { label: 'Đã khóa', color: 'danger' as const }
    case 5:
      return { label: 'Đã xóa', color: 'dark' as const }
    default:
      return { label: 'Không xác định', color: 'secondary' as const }
  }
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading = false,
  onEdit,

  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner />
        <div className="mt-2 text-body-secondary">
          Đang tải danh sách người dùng...
        </div>
      </div>
    )
  }

  if (!users.length) {
    return (
      <div className="text-center py-5 text-body-secondary">
        Không có người dùng nào.
      </div>
    )
  }

  return (
    <CTable hover responsive align="middle" className="mb-0">
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>#</CTableHeaderCell>
          <CTableHeaderCell>Người dùng</CTableHeaderCell>
          <CTableHeaderCell>Email</CTableHeaderCell>
          <CTableHeaderCell>Vai trò</CTableHeaderCell>
          <CTableHeaderCell>Trạng thái</CTableHeaderCell>
          <CTableHeaderCell className="text-end">
            Thao tác
          </CTableHeaderCell>
        </CTableRow>
      </CTableHead>

      <CTableBody>
        {users.map((user, index) => {
          const status = getStatusInfo(user.status)
          return (
            <CTableRow key={user.id}>
              <CTableDataCell>{index + 1}</CTableDataCell>

              <CTableDataCell>
                <div className="fw-semibold">{user.fullName}</div>
                <div className="small text-body-secondary">
                  @{user.username}
                </div>
              </CTableDataCell>

              <CTableDataCell>
                {user.email}
              </CTableDataCell>

              <CTableDataCell>
                {user.roles?.length ? (
                  <div className="d-flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <CBadge
                        key={role.id}
                        color="info"
                        className="text-dark"
                      >
                        {role.displayName || role.code}
                      </CBadge>
                    ))}
                  </div>
                ) : (
                  <span className="text-body-secondary">
                    Chưa có vai trò
                  </span>
                )}
              </CTableDataCell>

              <CTableDataCell>
                <CBadge color={status.color}>
                  {status.label}
                </CBadge>
              </CTableDataCell>

              <CTableDataCell className="text-end">
                <CButton
                  color="primary"
                  variant="ghost"
                  size="sm"
                  className="me-1"
                  title="Chỉnh sửa"
                  onClick={() => onEdit(user)}
                >
                  <CIcon icon={cilPencil} />
                </CButton>

                <CButton
                  color="danger"
                  variant="ghost"
                  size="sm"
                  title="Xóa"
                  onClick={() => onDelete(user)}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          )
        })}
      </CTableBody>
    </CTable>
  )
}

export default UserTable