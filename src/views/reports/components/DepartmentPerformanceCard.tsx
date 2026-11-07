import React from 'react'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CProgress,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { DepartmentPerformanceReportItemDto } from 'src/types/reports'

interface DepartmentPerformanceCardProps {
  items: DepartmentPerformanceReportItemDto[]
  expanded?: boolean
}

const DepartmentPerformanceCard: React.FC<DepartmentPerformanceCardProps> = ({
  items,
  expanded = false,
}) => {
  if (!expanded) {
    return (
      <CCard className="shadow-sm border-0 h-100">
        <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
          <strong>Phòng ban</strong>
          <span className="text-muted small">{items.length} phòng ban</span>
        </CCardHeader>
        <CCardBody className="p-4">
          {items.length === 0 ? (
            <div className="text-muted small">Chưa có dữ liệu phòng ban.</div>
          ) : (
            <div className="d-grid gap-3">
              {items.map((dept) => (
                <div key={dept.departmentId}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div>
                      <div className="fw-semibold text-dark">
                        {dept.departmentName}
                      </div>
                      <div className="text-muted small">
                        {dept.totalProjects} dự án · {dept.completedTasks}/
                        {dept.totalTasks} công việc
                      </div>
                    </div>
                    <CBadge color={dept.badgeColor as any}>
                      {dept.completionRate}%
                    </CBadge>
                  </div>
                  <CProgress
                    value={dept.completionRate}
                    color={dept.badgeColor as any}
                    height={5}
                  />
                </div>
              ))}
            </div>
          )}
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader className="bg-white d-flex justify-content-between align-items-center">
        <strong>Báo cáo Hiệu suất theo Phòng ban</strong>
        <CBadge color="light" className="text-dark border">
          {items.length} phòng ban
        </CBadge>
      </CCardHeader>
      <CCardBody className="p-0">
        {items.length === 0 ? (
          <div className="p-4 text-center text-muted">
            Chưa có dữ liệu phòng ban.
          </div>
        ) : (
          <CTable hover responsive className="mb-0 align-middle">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Phòng ban</CTableHeaderCell>
                <CTableHeaderCell className="text-center">
                  Nhân sự
                </CTableHeaderCell>
                <CTableHeaderCell className="text-center">
                  Số dự án
                </CTableHeaderCell>
                <CTableHeaderCell className="text-center">
                  Hoàn thành / Tổng việc
                </CTableHeaderCell>
                <CTableHeaderCell className="text-center">
                  Quá hạn
                </CTableHeaderCell>
                <CTableHeaderCell style={{ minWidth: '180px' }}>
                  Tỷ lệ hoàn thành
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {items.map((dept) => (
                <CTableRow key={dept.departmentId}>
                  <CTableDataCell>
                    <div className="fw-bold text-dark">
                      {dept.departmentName}
                    </div>
                    <div className="text-muted small">{dept.departmentCode}</div>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    {dept.activeEmployeesCount}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    {dept.totalProjects}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <span className="fw-semibold">{dept.completedTasks}</span> /{' '}
                    {dept.totalTasks}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    {dept.overdueTasks > 0 ? (
                      <span className="text-danger fw-bold">
                        {dept.overdueTasks}
                      </span>
                    ) : (
                      <span className="text-success">0</span>
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="d-flex align-items-center">
                      <CBadge
                        color={dept.badgeColor as any}
                        className="me-2"
                        style={{ minWidth: '44px' }}
                      >
                        {dept.completionRate}%
                      </CBadge>
                      <CProgress
                        value={dept.completionRate}
                        color={dept.badgeColor as any}
                        className="flex-grow-1"
                        height={6}
                      />
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default DepartmentPerformanceCard
