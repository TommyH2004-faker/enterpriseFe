// src/views/project-detail/components/settings/ProjectDangerZone.tsx

import React from 'react'
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react'

interface Props {
  onDelete?: () => void
}

const ProjectDangerZone: React.FC<Props> = ({ onDelete }) => {
  return (
    <CCard className="border-danger">
      <CCardHeader className="bg-danger bg-opacity-10 text-danger fw-semibold">
        Khu vực nguy hiểm (Danger Zone)
      </CCardHeader>

      <CCardBody>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold text-danger">Xóa dự án này</div>
            <div className="small text-body-secondary">
              Sau khi xóa, tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </div>
          </div>

          {onDelete && (
            <CButton color="danger" variant="outline" size="sm" onClick={onDelete}>
              Xóa dự án
            </CButton>
          )}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default ProjectDangerZone
