// src/views/project-detail/components/settings/ProjectSettings.tsx

import React from 'react'

import {
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import { ProjectDetail } from 'src/types/ProjectType/project'
import ProjectOrganizationSettings from './ProjectOrganizationSettings'
import ProjectLifecycleSettings from './ProjectLifecycleSettings'
import ProjectGeneralSettings from './ProjectGeneralSettings'
import ProjectDangerZone from './ProjectDangerZone'



interface Props {
  project: ProjectDetail

  onEdit: () => void

  onChangeDepartment: () => void
  onChangeManager: () => void

  onLifecycle: () => void

  onDelete: () => void
}

const ProjectSettings: React.FC<Props> = ({
  project,
  onEdit,
  onChangeDepartment,
  onChangeManager,
  onLifecycle,
  onDelete,
}) => {
  return (
    <div>
      <CCard className="mb-3">
        <CCardHeader>
          General
        </CCardHeader>

        <CCardBody>
          <ProjectGeneralSettings
            project={project}
            onEdit={onEdit}
          />
        </CCardBody>
      </CCard>

      <CCard className="mb-3">
        <CCardHeader>
          Organization
        </CCardHeader>

        <CCardBody>
          <ProjectOrganizationSettings
            project={project}
            onChangeDepartment={
              onChangeDepartment
            }
            onChangeManager={
              onChangeManager
            }
          />
        </CCardBody>
      </CCard>

      <CCard className="mb-3">
        <CCardHeader>
          Status & Activation
        </CCardHeader>

        <CCardBody>
          <ProjectLifecycleSettings
            project={project}
            onLifecycle={
              onLifecycle
            }
          />
        </CCardBody>
      </CCard>

      <ProjectDangerZone
        onDelete={onDelete}
      />
    </div>
  )
}

export default ProjectSettings