// src/views/project-detail/components/settings/ProjectOrganizationSettings.tsx

import React from 'react'
import { CButton } from '@coreui/react'
import { ProjectDetail } from 'src/types/ProjectType/project'

interface Props {
  project: ProjectDetail
  onChangeDepartment?: () => void
  onChangeManager?: () => void
}

const ProjectOrganizationSettings: React.FC<Props> = ({
  project,
  onChangeDepartment,
  onChangeManager,
}) => {
  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
        <div>
          <div className="small text-body-secondary">Phòng ban</div>
          <div className="fw-semibold">
            {project.department?.name || project.departmentName || 'Chưa phân công'}
          </div>
        </div>

        {onChangeDepartment && (
          <CButton color="light" size="sm" onClick={onChangeDepartment}>
            Thay đổi
          </CButton>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="small text-body-secondary">Quản lý dự án</div>
          <div className="fw-semibold">
            {project.manager?.fullName || project.managerName || 'Chưa chọn'}
          </div>
        </div>

        {onChangeManager && (
          <CButton color="light" size="sm" onClick={onChangeManager}>
            Thay đổi
          </CButton>
        )}
      </div>
    </div>
  )
}

export default ProjectOrganizationSettings
