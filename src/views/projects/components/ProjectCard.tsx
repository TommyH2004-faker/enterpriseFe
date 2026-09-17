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


interface Props {
  project: ProjectSummary

  onOpen: (
    projectId: string,
  ) => void

  onMenu: (
    project: ProjectSummary,
  ) => void

  onOpenKanban?: (
    projectId: string,
  ) => void
}

const getStatusColor = (
  status: ProjectStatus,
) => {
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

const formatDate = (
  value?: string | null,
) => {
  if (!value) return '-'

  return new Date(value).toLocaleDateString(
    'vi-VN',
  )
}

const ProjectCard: React.FC<Props> = ({
  project,
  onOpen,
  onMenu,
  onOpenKanban,
}) => {
  const progress =
    project.progress ?? 0

  return (
    <CCard className="h-100">
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div className="small text-body-secondary">
              {project.code}
            </div>

            <div className="fw-semibold">
              {project.name}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-ghost-secondary"
            onClick={() =>
              onMenu(project)
            }
          >
            ⋮
          </button>
        </div>
      </CCardHeader>

      <CCardBody>
        <div className="mb-3">
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
              className="ms-2"
            >
              {String(
                project.priority,
              )}
            </CBadge>
          )}
        </div>

        <p
          className="text-body-secondary"
          style={{
            minHeight: 48,
          }}
        >
          {project.description ||
            'Chưa có mô tả.'}
        </p>

        <div className="mb-2 d-flex justify-content-between">
          <span className="small">
            Tiến độ
          </span>

          <span className="small fw-semibold">
            {progress}%
          </span>
        </div>

        <CProgress
          value={progress}
          className="mb-3"
        />

        <div className="small text-body-secondary mb-2">
          <strong>
            Phòng ban:
          </strong>{' '}
          {project.departmentName ||
            '-'}
        </div>

        <div className="small text-body-secondary mb-2">
          <strong>
            Quản lý:
          </strong>{' '}
          {project.managerName ||
            '-'}
        </div>

        <div className="small text-body-secondary">
          <CIcon
            icon={cilCalendar}
            className="me-1"
          />
          {formatDate(
            project.startDate,
          )}{' '}
          →{' '}
          {formatDate(
            project.endDate,
          )}
        </div>
      </CCardBody>

      <CCardFooter>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3 small text-body-secondary">
            <span>
              <CIcon
                icon={cilPeople}
                className="me-1"
              />
              {project.memberCount ?? 0}
            </span>

            <span>
              <CIcon
                icon={cilTask}
                className="me-1"
              />
              {project.taskCount ?? 0}
            </span>
          </div>

          <div className="d-flex gap-1">
            {onOpenKanban && (
              <CButton
                size="sm"
                color="light"
                onClick={() =>
                  onOpenKanban(
                    project.id,
                  )
                }
              >
                Kanban
              </CButton>
            )}

            <CButton
              size="sm"
              color="primary"
              onClick={() =>
                onOpen(project.id)
              }
            >
              Chi tiết
            </CButton>
          </div>
        </div>
      </CCardFooter>
    </CCard>
  )
}

export default ProjectCard