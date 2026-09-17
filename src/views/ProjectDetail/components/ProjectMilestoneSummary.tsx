// src/views/project-detail/components/overview/ProjectMilestoneSummary.tsx

import React from 'react'

import {
  CCard,
  CCardBody,
} from '@coreui/react'
import { ProjectProgress } from 'src/types/ProjectType/project-progress'


interface Props {
  progress: ProjectProgress | null
}

const ProjectMilestoneSummary: React.FC<Props> = ({
  progress,
}) => {
  return (
    <CCard>
      <CCardBody>
        <h6>
          Milestones
        </h6>

        <div className="d-flex justify-content-between mt-3">
          <span>
            Tổng milestones
          </span>

          <strong>
            {progress?.totalMilestones ??
              0}
          </strong>
        </div>

        <div className="d-flex justify-content-between mt-2">
          <span>
            Hoàn thành
          </span>

          <strong>
            {progress?.completedMilestones ??
              0}
          </strong>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default ProjectMilestoneSummary