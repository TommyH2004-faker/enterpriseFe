// src/views/project-detail/components/overview/ProjectStats.tsx

import React from 'react'

import {
  CCol,
  CRow,
} from '@coreui/react'
import { ProjectProgress } from 'src/types/ProjectType/project-progress'
import { ProjectStatistics } from 'src/types/ProjectType/project-statistics'


interface Props {
  progress?: ProjectProgress | null
  statistics?: ProjectStatistics | null
}

const ProjectStats: React.FC<Props> = ({
  progress,
  statistics,
}) => {
  const items = [
    {
      label: 'Tổng task',
      value:
        progress?.totalTasks ??
        progress?.totalTaskCount ??
        statistics?.totalTasks ??
        0,
    },
    {
      label: 'Todo',
      value:
        progress?.todoTasks ?? 0,
    },
    {
      label: 'In Progress',
      value:
        progress?.inProgressTasks ?? 0,
    },
    {
      label: 'Done',
      value:
        progress?.completedTasks ??
        progress?.completedTaskCount ??
        0,
    },
    {
      label: 'Overdue',
      value:
        progress?.overdueTaskCount ??
        0,
    },
    {
      label: 'Members',
      value:
        statistics?.totalMembers ??
        statistics?.memberCount ??
        0,
    },
  ]

  return (
    <CRow className="g-3">
      {items.map((item) => (
        <CCol
          key={item.label}
          xs={12}
          sm={6}
          xl={2}
        >
          <div className="border rounded p-3 h-100">
            <div className="small text-body-secondary">
              {item.label}
            </div>

            <div className="fs-4 fw-semibold mt-1">
              {item.value}
            </div>
          </div>
        </CCol>
      ))}
    </CRow>
  )
}

export default ProjectStats