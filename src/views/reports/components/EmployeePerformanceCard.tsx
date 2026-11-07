import React from 'react'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { EmployeePerformanceReportItemDto } from 'src/types/reports'

interface EmployeePerformanceCardProps {
  items: EmployeePerformanceReportItemDto[]
  expanded?: boolean
}

const EmployeePerformanceCard: React.FC<EmployeePerformanceCardProps> = ({
  items,
  expanded = false,
}) => {
  return (
    <CCard className="h-100 shadow-sm border-0">
      <CCardHeader className="bg-white d-flex justify-content-between align-items-center">
        <strong>Hiệu suất Nhân viên</strong>
        <CBadge color="light" className="text-dark border">
          {items.length} nhân sự
        </CBadge>
      </CCardHeader>
      <CCardBody className="p-0">
        {items.length === 0 ? (
          <div className="p-4 text-center text-muted">
            Không có dữ liệu nhân viên phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <CTable hover responsive className="mb-0 align-middle">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Nhân viên</CTableHeaderCell>
                {expanded && <CTableHeaderCell>Phòng ban</CTableHeaderCell>}
                {expanded && (
                  <CTableHeaderCell className="text-center">
                    Hoàn thành / Được giao
                  </CTableHeaderCell>
                )}
                <CTableHeaderCell className="text-center">
                  Tỷ lệ hoàn thành
                </CTableHeaderCell>
                <CTableHeaderCell className="text-center">
                  Quá hạn
                </CTableHeaderCell>
                <CTableHeaderCell className="text-center">
                  Đánh giá
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {items.map((item) => (
                <CTableRow key={item.employeeId}>
                  <CTableDataCell>
                    <div className="fw-bold text-dark">{item.fullName}</div>
                    <div className="text-muted small">
                      {item.employeeCode}
                      {!expanded && ` · ${item.departmentName}`}
                    </div>
                  </CTableDataCell>

                  {expanded && (
                    <CTableDataCell>{item.departmentName}</CTableDataCell>
                  )}

                  {expanded && (
                    <CTableDataCell className="text-center">
                      <span className="fw-semibold">{item.completedTasks}</span>{' '}
                      / {item.totalAssignedTasks}
                    </CTableDataCell>
                  )}

                  <CTableDataCell className="text-center">
                    <CBadge
                      color={
                        item.completionRate >= 80
                          ? 'success'
                          : item.completionRate >= 50
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {item.completionRate}%
                    </CBadge>
                  </CTableDataCell>

                  <CTableDataCell className="text-center">
                    {item.overdueTasks > 0 ? (
                      <span className="text-danger fw-bold">
                        {item.overdueTasks}
                      </span>
                    ) : (
                      <span className="text-success">0</span>
                    )}
                  </CTableDataCell>

                  <CTableDataCell className="text-center">
                    <CBadge color="light" className="text-dark border">
                      {item.evaluation}
                    </CBadge>
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

export default EmployeePerformanceCard
