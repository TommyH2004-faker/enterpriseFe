// src/views/projects/components/ProjectCard.tsx

import React from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CProgress,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilPeople,
  cilTask,
} from '@coreui/icons'
import { ProjectStatus, ProjectSummary } from 'src/types/ProjectType/project'
import ProjectCardMenu from './ProjectCardMenu'

interface Props {
  project: ProjectSummary
  onOpen: (projectId: string) => void
  onEdit: (project: ProjectSummary) => void
  onStatus: (project: ProjectSummary) => void
  onSettings: (projectId: string) => void
  onDelete: (project: ProjectSummary) => void
  onOpenKanban?: (projectId: string) => void
}

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case 'Planning':
      return 'secondary'
    case 'Active':
      return 'success'
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

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

const ProjectCard: React.FC<Props> = ({
  project,
  onOpen,
  onEdit,
  onStatus,
  onSettings,
  onDelete,
  onOpenKanban,
}) => {
  const progress = project.progress ?? 0

  // Fallback an toàn cho việc lấy số lượng
  const memberCount = project.memberCount ?? (project as any).totalMembers ?? (project as any).members?.length ?? 0;
  const taskCount = (project as any).totalTaskCount ?? (project as any).totalTasks ?? (project as any).taskCount ?? 0;

  return (
    <CCard className="h-100 shadow-sm border-0">
      <CCardHeader className="bg-transparent border-0 pt-3 px-3">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div className="small text-body-secondary">Mã dự án: {project.code}</div>
            <div className="fw-bold fs-6 text-truncate" style={{ maxWidth: '200px' }} title={project.name}>
              Tên dự án: {project.name}
            </div>
          </div>

          <ProjectCardMenu
            project={project}
            onView={() => onOpen(project.id)}
            onEdit={() => onEdit(project)}
            onStatus={() => onStatus(project)}
            onSettings={() => onSettings(project.id)}
            onDelete={() => onDelete(project)}
          />
        </div>
      </CCardHeader>

      <CCardBody className="px-3 py-2">
        <div className="mb-3">
          <CBadge color={getStatusColor(project.status)} className="px-2 py-1">
            {project.status}
          </CBadge>

          {project.priority && (
            <CBadge color="light" textColor="dark" className="ms-2 px-2 py-1">
              {String(project.priority)}
            </CBadge>
          )}
        </div>

        <p className="text-body-secondary small mb-3 text-multi-line-truncate" style={{ minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          Mô tả: {project.description || 'Chưa có mô tả.'}
        </p>

        <div className="mb-1 d-flex justify-content-between align-items-center">
          <span className="small text-body-secondary">Tiến độ</span>
          <span className="small fw-semibold">{progress}%</span>
        </div>

        <CProgress value={progress} height={6} className="mb-3 rounded-pill bg-light">
           <CProgress color={progress === 100 ? 'success' : 'primary'} value={progress} />
        </CProgress>

        <div className="small text-body-secondary mb-1">
          <strong>Phòng ban:</strong> {project.departmentName || '-'}
        </div>

        <div className="small text-body-secondary mb-2">
          <strong>Quản lý:</strong> {project.managerName || '-'}
        </div>

        <div className="small text-body-secondary">
          <CIcon icon={cilCalendar} className="me-1" />
          {formatDate(project.startDate)} → {formatDate(project.endDate)}
        </div>
      </CCardBody>

      <CCardFooter className="bg-transparent border-0 pb-3 px-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3 small text-body-secondary">
            <span className="d-flex align-items-center gap-1" title="Số thành viên">
              <CIcon icon={cilPeople} size="sm" />
              <span>{memberCount}</span>
            </span>

            <span className="d-flex align-items-center gap-1" title="Số công việc">
              <CIcon icon={cilTask} size="sm" />
              <span>{taskCount}</span>
            </span>
          </div>

          <div className="d-flex gap-1">
            {onOpenKanban && (
              <CButton size="sm" color="light" onClick={() => onOpenKanban(project.id)}>
                Kanban
              </CButton>
            )}

            <CButton size="sm" color="primary" onClick={() => onOpen(project.id)}>
              Chi tiết
            </CButton>
          </div>
        </div>
      </CCardFooter>
    </CCard>
  )
}

export default ProjectCard