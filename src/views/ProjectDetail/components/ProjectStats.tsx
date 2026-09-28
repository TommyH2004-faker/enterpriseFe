import React from 'react'
import { CCol, CRow } from '@coreui/react'
import { ProjectProgress } from 'src/types/ProjectType/project-progress'
import { ProjectStatistics } from 'src/types/ProjectType/project-statistics'

interface Props {
  progress?: ProjectProgress | null
  statistics?: ProjectStatistics | null
}

const ProjectStats: React.FC<Props> = ({ progress, statistics }) => {
  const items = [
    { label: 'Tổng task', value: progress?.totalTasks ?? progress?.totalTaskCount ?? statistics?.totalTasks ?? 0, color: 'text-dark' },
    { label: 'Cần làm (Todo)', value: progress?.todoTasks ?? 0, color: 'text-secondary' },
    { label: 'Đang xử lý', value: progress?.inProgressTasks ?? 0, color: 'text-primary' },
    { label: 'Hoàn thành', value: progress?.completedTasks ?? progress?.completedTaskCount ?? 0, color: 'text-success' },
    { label: 'Quá hạn', value: progress?.overdueTaskCount ?? 0, color: 'text-danger' },
    { label: 'Thành viên', value: statistics?.totalMembers ?? statistics?.memberCount ?? 0, color: 'text-info' },
  ]

  return (
    <CRow className="g-3 mb-4">
      {items.map((item) => (
        <CCol key={item.label} xs={6} sm={4} xl={2}>
          <div className="bg-white border-0 shadow-sm rounded-3 p-3 h-100 d-flex flex-column justify-content-center align-items-center text-center hover-bg-light transition-all cursor-default">
            <div className="small text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: '11px' }}>
              {item.label}
            </div>
            <div className={`fs-3 fw-bold ${item.color}`}>
              {item.value}
            </div>
          </div>
        </CCol>
      ))}
    </CRow>
  )
}

export default ProjectStats