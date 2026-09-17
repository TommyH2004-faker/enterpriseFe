// src/views/project-detail/components/settings/ProjectDangerZone.tsx

import React from 'react'

import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'

interface Props {
  onDelete: () => void
}

const ProjectDangerZone: React.FC<Props> = ({
  onDelete,
}) => {
  return (
    <CCard className="border-danger">
      <CCardHeader className="text-danger">
        Danger Zone
      </CCardHeader>

      <CCardBody>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold">
              Xóa dự án
            </div>

            <div className="small text-body-secondary">
              Đây là thao tác destructive.
            </div>
          </div>

          <CButton
            color="danger"
            variant="outline"
            onClick={onDelete}
          >
            Xóa dự án
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default ProjectDangerZone