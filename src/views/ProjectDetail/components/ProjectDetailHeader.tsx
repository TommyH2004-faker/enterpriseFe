// src/views/project-detail/components/ProjectDetailHeader.tsx

import React from 'react'

import {
  CBadge,
  CButton,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import {
  cilArrowLeft,
  cilPencil,
} from '@coreui/icons'
import { ProjectDetail } from 'src/types/ProjectType/project'

interface Props {
  project: ProjectDetail

  onBack: () => void
  onOpenKanban: () => void
  onEdit: () => void
  onMenu: () => void
}

const getStatusColor = (
  status: string,
) => {
  switch (status) {
    case 'Active':
      return 'success'

    case 'Planning':
      return 'secondary'

    case 'OnHold':
      return 'warning'

    case 'Completed':
      return 'info'

    case 'Cancelled':
      return 'danger'

    default:
      return 'secondary'
  }
}

const ProjectDetailHeader: React.FC<Props> = ({
  project,
  onBack,
  onOpenKanban,
  onEdit,
  onMenu,
}) => {
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <CButton
            color="light"
            size="sm"
            className="mb-3"
            onClick={onBack}
          >
            <CIcon
              icon={cilArrowLeft}
              className="me-1"
            />
            Projects
          </CButton>

          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="fw-semibold">
              {project.code}
            </span>

            <CBadge
              color={getStatusColor(
                project.status,
              )}
            >
              {project.status}
            </CBadge>

            {project.priority && (
              <CBadge
                color="light"
                textColor="dark"
              >
                {String(
                  project.priority,
                )}
              </CBadge>
            )}
          </div>

          <h3 className="mb-1">
            {project.name}
          </h3>

          <div className="text-body-secondary">
            {project.description ||
              'Chưa có mô tả.'}
          </div>
        </div>

        <div className="d-flex gap-2">
          <CButton
            color="primary"
            onClick={
              onOpenKanban
            }
          >
            Open Kanban
          </CButton>

          <CButton
            color="light"
            onClick={onEdit}
          >
            <CIcon
              icon={cilPencil}
              className="me-1"
            />
            Edit
          </CButton>

          <CButton
            color="light"
            onClick={onMenu}
          >
            ⋮
          </CButton>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailHeader