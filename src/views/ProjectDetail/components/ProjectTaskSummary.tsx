// src/views/project-detail/components/overview/ProjectTaskSummary.tsx

import React from 'react'

import {
  CCard,
  CCardBody,
} from '@coreui/react'
import { ProjectProgress } from 'src/types/ProjectType/project-progress'


interface Props {
  progress: ProjectProgress | null
}

const ProjectTaskSummary: React.FC<Props> = ({
  progress,
}) => {
  return (
    <CCard>
      <CCardBody>
        <h6 className="mb-3">
          Task summary
        </h6>

        <div className="d-flex justify-content-between mb-2">
          <span>Todo</span>
          <strong>
            {progress?.todoTasks ?? 0}
          </strong>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>In Progress</span>
          <strong>
            {progress?.inProgressTasks ??
              0}
          </strong>
        </div>

        <div className="d-flex justify-content-between">
          <span>Completed</span>
          <strong>
            {progress?.completedTasks ??
              progress?.completedTaskCount ??
              0}
          </strong>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default ProjectTaskSummary