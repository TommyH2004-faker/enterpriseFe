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
import { ProjectProgressReportItemDto } from 'src/types/reports'

interface ProjectProgressCardProps {
  items: ProjectProgressReportItemDto[]
  expanded?: boolean
}

const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({
  items,
  expanded = false,
}) => {
  return (
    <CCard className="h-100 shadow-sm border-0">
      <CCardHeader className="bg-white d-flex justify-content-between align-items-center">
        <strong>Tiến độ Dự án</strong>
        <CBadge color="light" className="text-dark border">
          {items.length} dự án
        </CBadge>
      </CCardHeader>
      <CCardBody className="p-0">
        {items.length === 0 ? (
          <div className="p-4 text-center text-muted">
            Không có dữ liệu dự án phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <CTable hover responsive className="mb-0 align-middle">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Dự án</CTableHeaderCell>
                {expanded && <CTableHeaderCell>Phòng ban / Quản lý</CTableHeaderCell>}
                <CTableHeaderCell className="text-center">
                  Hoàn thành / Tổng
                </CTableHeaderCell>
                {expanded && (
                  <CTableHeaderCell className="text-center">
                    Quá hạn
                  </CTableHeaderCell>
                )}
                <CTableHeaderCell style={{ minWidth: '170px' }}>
                  Tiến độ
                </CTableHeaderCell>
                {expanded && (
                  <CTableHeaderCell className="text-center">
                    Tình trạng
                  </CTableHeaderCell>
                )}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {items.map((item) => (
                <CTableRow key={item.projectId}>
                  <CTableDataCell>
                    <div className="fw-bold text-dark">{item.projectName}</div>
                    <div className="text-muted small">
                      {item.projectCode}
                      {!expanded && ` · ${item.departmentName}`}
                    </div>
                  </CTableDataCell>

                  {expanded && (
                    <CTableDataCell>
                      <div>{item.departmentName}</div>
                      <div className="text-muted small">
                        QL: {item.managerName}
                      </div>
                    </CTableDataCell>
                  )}

                  <CTableDataCell className="text-center">
                    <span className="fw-semibold">{item.completedTasks}</span> /{' '}
                    {item.totalTasks}
                  </CTableDataCell>

                  {expanded && (
                    <CTableDataCell className="text-center">
                      {item.overdueTasks > 0 ? (
                        <span className="text-danger fw-bold">
                          {item.overdueTasks}
                        </span>
                      ) : (
                        <span className="text-success">0</span>
                      )}
                    </CTableDataCell>
                  )}

                  <CTableDataCell>
                    <div className="d-flex align-items-center">
                      <span
                        className="me-2 fw-bold"
                        style={{ minWidth: '40px' }}
                      >
                        {item.progress}%
                      </span>
                      <CProgress
                        value={item.progress}
                        color={item.statusColor as any}
                        className="flex-grow-1"
                        height={6}
                      />
                    </div>
                  </CTableDataCell>

                  {expanded && (
                    <CTableDataCell className="text-center">
                      <CBadge color={item.statusColor as any}>
                        {item.healthStatus}
                      </CBadge>
                    </CTableDataCell>
                  )}
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ProjectProgressCard
