import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormCheck,
  CFormInput,
  CFormSelect,
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
import { DepartmentResponse } from '../../types/Department'
import { EmployeeResponse, PositionResponse } from '../../types/Employee'

interface Props {
  employees: EmployeeResponse[]
  departments: DepartmentResponse[]
  positions: PositionResponse[]
  loading: boolean
  search: string
  departmentId: string
  positionId: string
  includeInactive: boolean
  onSearchChange: (value: string) => void
  onDepartmentChange: (value: string) => void
  onPositionChange: (value: string) => void
  onIncludeInactiveChange: (value: boolean) => void
  onEdit: (employee: EmployeeResponse) => void
  onDelete: (employee: EmployeeResponse) => void
}

const formatDate = (date: string) =>
  date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'

const EmployeeContent: React.FC<Props> = ({
  employees,
  departments,
  positions,
  loading,
  search,
  departmentId,
  positionId,
  includeInactive,
  onSearchChange,
  onDepartmentChange,
  onPositionChange,
  onIncludeInactiveChange,
  onEdit,
  onDelete,
}) => (
  <CCard className="border-0 shadow-sm">
    <CCardHeader className="bg-white border-bottom px-4 py-3">
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <CFormInput
          value={search}
          placeholder="Tìm mã, họ tên hoặc email"
          onChange={(event) => onSearchChange(event.target.value)}
          style={{ maxWidth: '280px' }}
        />
        <CFormSelect
          value={departmentId}
          onChange={(event) => onDepartmentChange(event.target.value)}
          style={{ maxWidth: '220px' }}
        >
          <option value="">Tất cả phòng ban</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </CFormSelect>
        <CFormSelect
          value={positionId}
          onChange={(event) => onPositionChange(event.target.value)}
          style={{ maxWidth: '220px' }}
        >
          <option value="">Tất cả chức vụ</option>
          {positions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.name}
            </option>
          ))}
        </CFormSelect>
        <CFormCheck
          type="checkbox"
          label="Hiện nhân viên đã khóa"
          checked={includeInactive}
          onChange={(event) => onIncludeInactiveChange(event.target.checked)}
        />
      </div>
    </CCardHeader>
    <CCardBody className="p-0">
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <CSpinner color="primary" />
        </div>
      ) : employees.length ? (
        <div className="table-responsive">
          <CTable
            hover
            className="mb-0 align-middle"
            style={{ minWidth: '1120px', tableLayout: 'fixed' }}
          >
            <colgroup>
              <col style={{ width: '130px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '230px' }} />
              <col style={{ width: '170px' }} />
              <col style={{ width: '170px' }} />
              <col style={{ width: '125px' }} />
              <col style={{ width: '135px' }} />
              <col style={{ width: '120px' }} />
            </colgroup>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell className="text-nowrap">Mã nhân viên</CTableHeaderCell>
                <CTableHeaderCell className="text-nowrap">Họ và tên</CTableHeaderCell>
                <CTableHeaderCell className="text-nowrap">Email</CTableHeaderCell>
                <CTableHeaderCell className="text-nowrap">Phòng ban</CTableHeaderCell>
                <CTableHeaderCell className="text-nowrap">Chức vụ</CTableHeaderCell>
                <CTableHeaderCell className="text-nowrap">Trạng thái</CTableHeaderCell>
                <CTableHeaderCell className="text-nowrap">Ngày tham gia</CTableHeaderCell>
                <CTableHeaderCell className="pe-4 text-end text-nowrap">
                  Hành động
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {employees.map((employee) => (
                <CTableRow key={employee.id} style={{ height: '60px' }}>
                  <CTableDataCell className="fw-semibold">
                    <span className="d-block text-truncate" title={employee.employeeCode}>
                      {employee.employeeCode}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span className="d-block text-truncate" title={employee.fullName}>
                      {employee.fullName}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span className="d-block text-truncate" title={employee.email}>
                      {employee.email}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span className="d-block text-truncate" title={employee.departmentName}>
                      {employee.departmentName}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span className="d-block text-truncate" title={employee.positionName}>
                      {employee.positionName}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span
                      className={`badge ${employee.isActive ? 'bg-success' : 'bg-secondary'}`}
                    >
                      {employee.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell className="text-nowrap">
                    {formatDate(employee.joinedDate)}
                  </CTableDataCell>
                  <CTableDataCell className="pe-4 text-end text-nowrap">
                    <CButton
                      color="light"
                      size="sm"
                      className="border-0 text-primary me-1"
                      title="Chỉnh sửa"
                      onClick={() => onEdit(employee)}
                      disabled={loading}
                    >
                      <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton
                      color="light"
                      size="sm"
                      className="border-0 text-danger"
                      title="Xóa"
                      onClick={() => onDelete(employee)}
                      disabled={loading}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
      ) : (
        <div className="text-center text-muted py-5">Không có nhân viên</div>
      )}
    </CCardBody>
  </CCard>
)

export default EmployeeContent
