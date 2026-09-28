// src/views/project-detail/components/settings/ProjectSettings.tsx

import React from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import { useOutletContext } from 'react-router-dom'
import { ProjectDetail } from 'src/types/ProjectType/project'
import ProjectGeneralSettings from './ProjectGeneralSettings'
import ProjectOrganizationSettings from './ProjectOrganizationSettings'
import ProjectLifecycleSettings from './ProjectLifecycleSettings'
import ProjectDangerZone from './ProjectDangerZone'

interface ProjectDetailContext {
  project: ProjectDetail | null
  refetch?: () => void
  onEdit?: () => void
  onChangeDepartment?: () => void
  onChangeManager?: () => void
  onLifecycle?: () => void
  onDelete?: () => void
}

interface Props {
  project?: ProjectDetail
  onEdit?: () => void
  onChangeDepartment?: () => void
  onChangeManager?: () => void
  onLifecycle?: () => void
  onDelete?: () => void
}

const ProjectSettings: React.FC<Props> = (props) => {
  const context = useOutletContext<ProjectDetailContext | null>()

  const project = props.project || context?.project
  const onEdit = props.onEdit || context?.onEdit
  const onChangeDepartment = props.onChangeDepartment || context?.onChangeDepartment
  const onChangeManager = props.onChangeManager || context?.onChangeManager
  const onLifecycle = props.onLifecycle || context?.onLifecycle
  const onDelete = props.onDelete || context?.onDelete

  if (!project) {
    return <div className="text-body-secondary py-3">Không có thông tin cài đặt dự án.</div>
  }

  return (
    <div className="d-flex flex-column gap-3">
      <CCard className="shadow-sm">
        <CCardHeader className="fw-semibold">Thông tin chung</CCardHeader>
        <CCardBody>
          <ProjectGeneralSettings project={project} onEdit={onEdit} />
        </CCardBody>
      </CCard>

      <CCard className="shadow-sm">
        <CCardHeader className="fw-semibold">Tổ chức & Cấu trúc</CCardHeader>
        <CCardBody>
          <ProjectOrganizationSettings
            project={project}
            onChangeDepartment={onChangeDepartment}
            onChangeManager={onChangeManager}
          />
        </CCardBody>
      </CCard>

      <CCard className="shadow-sm">
        <CCardHeader className="fw-semibold">Vòng đời & Trạng thái</CCardHeader>
        <CCardBody>
          <ProjectLifecycleSettings project={project} onLifecycle={onLifecycle} />
        </CCardBody>
      </CCard>

      <ProjectDangerZone onDelete={onDelete} />
    </div>
  )
}

export default ProjectSettings
