// src/views/project-detail/components/settings/ProjectLifecycleSettings.tsx

import React from 'react'
import { CBadge, CButton } from '@coreui/react'
import { ProjectDetail } from 'src/types/ProjectType/project'

interface Props {
  project: ProjectDetail
  onLifecycle?: () => void
}

const ProjectLifecycleSettings: React.FC<Props> = ({ project, onLifecycle }) => {
  return (
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <div className="d-flex align-items-center gap-2">
          <span className="small text-body-secondary">Trạng thái:</span>
          <CBadge color={project.status === 'Active' ? 'success' : 'secondary'}>
            {project.status}
          </CBadge>
        </div>
      </div>

      {onLifecycle && (
        <CButton color="light" size="sm" onClick={onLifecycle}>
          Quản lý trạng thái
        </CButton>
      )}
    </div>
  )
}

export default ProjectLifecycleSettings
