// src/views/project-detail/components/ProjectDetailHeader.tsx

import React from 'react'
import { CBadge, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil, cilViewColumn } from '@coreui/icons'
import { ProjectDetail } from 'src/types/ProjectType/project'

interface Props {
  project: ProjectDetail
  onBack: () => void
  onOpenKanban: () => void
  onEdit: () => void
  onMenu?: () => void
}

const getStatusColor = (status: string) => {
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

const getPriorityLabel = (priority?: number | string | null) => {
  if (priority === undefined || priority === null) return null
  if (typeof priority === 'number') {
    switch (priority) {
      case 0:
        return { label: 'Low', color: 'info' }
      case 1:
        return { label: 'Medium', color: 'warning' }
      case 2:
        return { label: 'High', color: 'danger' }
      case 3:
        return { label: 'Critical', color: 'dark' }
      default:
        return { label: `Priority ${priority}`, color: 'light' }
    }
  }
  return { label: String(priority), color: 'light' }
}

const ProjectDetailHeader: React.FC<Props> = ({
  project,
  onBack,
  onOpenKanban,
  onEdit,
  onMenu,
}) => {
  const priorityInfo = getPriorityLabel(project.priority)

  return (
    <div className="mb-4 bg-white p-4 rounded shadow-sm border">
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
        <div>
          <CButton color="light" size="sm" className="mb-3 text-body-secondary fw-semibold" onClick={onBack}>
            <CIcon icon={cilArrowLeft} className="me-1" /> Danh sách dự án
          </CButton>

          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <span className="badge bg-light text-dark border fw-bold px-2 py-1">
              {project.code}
            </span>

            <CBadge color={getStatusColor(project.status)}>
              {project.status}
            </CBadge>

            {priorityInfo && (
              <CBadge color={priorityInfo.color}>
                {priorityInfo.label}
              </CBadge>
            )}
          </div>

          <h2 className="fw-bold mb-2 text-dark">{project.name}</h2>

          <div className="text-body-secondary" style={{ maxWidth: '750px' }}>
            {project.description || 'Chưa có mô tả cho dự án này.'}
          </div>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <CButton color="primary" className="d-flex align-items-center gap-1 shadow-sm" onClick={onOpenKanban}>
            <CIcon icon={cilViewColumn} /> Open Kanban
          </CButton>

          <CButton color="light" className="border d-flex align-items-center gap-1" onClick={onEdit}>
            <CIcon icon={cilPencil} /> Chỉnh sửa
          </CButton>

          {onMenu && (
            <CButton color="light" className="border" onClick={onMenu}>
              ⋮
            </CButton>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailHeader