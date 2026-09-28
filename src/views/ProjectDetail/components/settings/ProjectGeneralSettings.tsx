// src/views/project-detail/components/settings/ProjectGeneralSettings.tsx

import React from 'react'
import { CButton } from '@coreui/react'
import { ProjectDetail } from 'src/types/ProjectType/project'

interface Props {
  project: ProjectDetail
  onEdit?: () => void
}

const ProjectGeneralSettings: React.FC<Props> = ({ project, onEdit }) => {
  return (
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <div className="fw-semibold fs-5">{project.name}</div>
        <div className="text-body-secondary small mt-1">
          {project.description || 'Chưa có mô tả cho dự án này.'}
        </div>
      </div>

      {onEdit && (
        <CButton color="primary" variant="outline" size="sm" onClick={onEdit}>
          Chỉnh sửa
        </CButton>
      )}
    </div>
  )
}

export default ProjectGeneralSettings
