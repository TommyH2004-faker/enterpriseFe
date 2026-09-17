// src/views/project-detail/components/settings/ProjectLifecycleSettings.tsx

import React from 'react'

import {
  CBadge,
  CButton,
} from '@coreui/react'
import { ProjectDetail } from 'src/types/ProjectType/project'


interface Props {
  project: ProjectDetail
  onLifecycle: () => void
}

const ProjectLifecycleSettings: React.FC<Props> = ({
  project,
  onLifecycle,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <div className="mb-2">
          <CBadge color="secondary">
            {project.status}
          </CBadge>
        </div>

        <div className="small text-body-secondary">
          Activation
        </div>

        <div className="fw-semibold">
          {project.isActive
            ? 'Đang hoạt động'
            : 'Đang vô hiệu hóa'}
        </div>
      </div>

      <CButton
        color="light"
        onClick={onLifecycle}
      >
        Quản lý trạng thái
      </CButton>
    </div>
  )
}

export default ProjectLifecycleSettings