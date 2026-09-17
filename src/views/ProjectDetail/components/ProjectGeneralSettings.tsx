// src/views/project-detail/components/settings/ProjectGeneralSettings.tsx

import React from 'react'

import {
  CButton,
} from '@coreui/react'
import { ProjectDetail } from 'src/types/ProjectType/project'


interface Props {
  project: ProjectDetail
  onEdit: () => void
}

const ProjectGeneralSettings: React.FC<Props> = ({
  project,
  onEdit,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <div className="fw-semibold">
          {project.name}
        </div>

        <div className="small text-body-secondary">
          {project.description ||
            'Chưa có mô tả.'}
        </div>
      </div>

      <CButton
        color="light"
        onClick={onEdit}
      >
        Chỉnh sửa
      </CButton>
    </div>
  )
}

export default ProjectGeneralSettings