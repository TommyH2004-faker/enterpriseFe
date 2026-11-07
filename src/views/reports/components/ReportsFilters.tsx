import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFilterX } from '@coreui/icons'
import { ReportFilterOptionsDto, ReportFilterParams } from 'src/types/reports'

interface ReportsFiltersProps {
  filters: ReportFilterParams
  options: ReportFilterOptionsDto
  onChange: (next: ReportFilterParams) => void
  onReset: () => void
}

const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  filters,
  options,
  onChange,
  onReset,
}) => {
  const hasActiveFilter = Boolean(
    filters.fromDate ||
      filters.toDate ||
      filters.departmentId ||
      filters.projectId ||
      filters.employeeId,
  )

  const filteredProjects = filters.departmentId
    ? options.projects.filter((p) => p.departmentId === filters.departmentId)
    : options.projects

  const filteredEmployees = filters.departmentId
    ? options.employees.filter((e) => e.departmentId === filters.departmentId)
    : options.employees

  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CRow className="g-3 align-items-end">
          <CCol md={2} sm={6}>
            <CFormInput
              type="date"
              label="Từ ngày"
              value={filters.fromDate || ''}
              onChange={(e) =>
                onChange({ ...filters, fromDate: e.target.value || undefined })
              }
            />
          </CCol>

          <CCol md={2} sm={6}>
            <CFormInput
              type="date"
              label="Đến ngày"
              value={filters.toDate || ''}
              onChange={(e) =>
                onChange({ ...filters, toDate: e.target.value || undefined })
              }
            />
          </CCol>

          <CCol md={3} sm={6}>
            <label className="form-label">Phòng ban</label>
            <CFormSelect
              value={filters.departmentId || ''}
              onChange={(e) => {
                const nextDeptId = e.target.value || undefined
                onChange({
                  ...filters,
                  departmentId: nextDeptId,
                  projectId: undefined,
                  employeeId: undefined,
                })
              }}
            >
              <option value="">Tất cả</option>
              {options.departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={2} sm={6}>
            <label className="form-label">Dự án</label>
            <CFormSelect
              value={filters.projectId || ''}
              onChange={(e) =>
                onChange({ ...filters, projectId: e.target.value || undefined })
              }
            >
              <option value="">Tất cả</option>
              {filteredProjects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={hasActiveFilter ? 2 : 3} sm={6}>
            <label className="form-label">Nhân viên</label>
            <CFormSelect
              value={filters.employeeId || ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  employeeId: e.target.value || undefined,
                })
              }
            >
              <option value="">Tất cả</option>
              {filteredEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          {hasActiveFilter && (
            <CCol md={1} sm={6}>
              <CButton
                color="secondary"
                variant="outline"
                className="w-100"
                title="Xóa bộ lọc"
                onClick={onReset}
              >
                <CIcon icon={cilFilterX} />
              </CButton>
            </CCol>
          )}
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default ReportsFilters
