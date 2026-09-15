import React from 'react'
import {
  CCardBody,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
} from '@coreui/react'

interface Props {
  search: string
  statusFilter: string
  roleFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onRoleFilterChange: (value: string) => void
}

const UserTableHeader = ({
  search,
  statusFilter,
  roleFilter,
  onSearchChange,
  onStatusFilterChange,
  onRoleFilterChange,
}: Props) => {
  return (
    <CCardBody className="border-bottom">
      <CRow className="g-3">

        <CCol md={6}>
          <CFormInput
            placeholder="Tìm theo username, email hoặc họ tên..."
            value={search}
            onChange={(e) =>
              onSearchChange(e.target.value)
            }
          />
        </CCol>

        <CCol md={3}>
          <CFormSelect
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(
                e.target.value,
              )
            }
          >
            <option value="all">
              Tất cả trạng thái
            </option>
            <option value="1">
              Chờ kích hoạt
            </option>
            <option value="2">
              Hoạt động
            </option>
            <option value="3">
              Không hoạt động
            </option>
            <option value="4">
              Đã khóa
            </option>
            <option value="5">
              Đã xóa
            </option>
          </CFormSelect>
        </CCol>

        <CCol md={3}>
          <CFormSelect
            value={roleFilter}
            onChange={(e) =>
              onRoleFilterChange(
                e.target.value,
              )
            }
          >
            <option value="all">
              Tất cả vai trò
            </option>
            <option value="SUPER_ADMIN">
              SUPER_ADMIN
            </option>
            <option value="ADMIN">
              ADMIN
            </option>
            <option value="DIRECTOR">
              DIRECTOR
            </option>
            <option value="DEPARTMENT_MANAGER">
              DEPARTMENT_MANAGER
            </option>
            <option value="EMPLOYEE">
              EMPLOYEE
            </option>
          </CFormSelect>
        </CCol>

      </CRow>
    </CCardBody>
  )
}

export default UserTableHeader