
import {
  CAlert,
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CRow,
} from '@coreui/react'
import type { EmployeeProfile } from 'src/types/profile'

interface EmployeeInfoCardProps {
  employee: EmployeeProfile | null
}

function formatDate(value: string | null): string {
  if (!value) return '—'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('vi-VN')
}

export default function EmployeeInfoCard({
  employee,
}: EmployeeInfoCardProps) {
  if (!employee) {
    return (
      <CAlert color="info" className="mt-4">
        Tài khoản của bạn chưa có hồ sơ nhân viên.
      </CAlert>
    )
  }

  return (
    <CCard className="profile-section-card mt-4">
      <CCardHeader className="profile-section-header">
        <div>
          <h6>Thông tin nhân viên</h6>
          <p className="text-body-secondary mb-0">
            Các thông tin do hệ thống quản lý, không chỉnh sửa tại đây.
          </p>
        </div>

        <CBadge color={employee.isActive ? 'success' : 'secondary'}>
          {employee.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </CBadge>
      </CCardHeader>

      <CCardBody>
        <CRow className="g-3">
          <CCol md={6}>
            <CFormInput
              label="Mã nhân viên"
              value={employee.employeeCode ?? ''}
              readOnly
            />
          </CCol>

          <CCol md={6}>
            <CFormInput
              label="Họ tên"
              value={employee.fullName ?? ''}
              readOnly
            />
          </CCol>

          <CCol md={6}>
            <CFormInput
              label="Phòng ban"
              value={employee.departmentName ?? 'Chưa phân công'}
              readOnly
            />
          </CCol>

          <CCol md={6}>
            <CFormInput
              label="Chức vụ"
              value={employee.positionName ?? 'Chưa phân công'}
              readOnly
            />
          </CCol>

          <CCol md={6}>
            <CFormInput
              label="Email nhân viên"
              value={employee.email ?? ''}
              readOnly
            />
          </CCol>

          <CCol md={6}>
            <CFormInput
              label="Ngày vào làm"
              value={formatDate(employee.joinedDate)}
              readOnly
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}
