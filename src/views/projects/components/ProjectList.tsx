// src/views/projects/components/ProjectList.tsx

import React from 'react'
import {
  CBadge,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { ProjectStatus, ProjectSummary } from 'src/types/ProjectType/project'
import ProjectCardMenu from './ProjectCardMenu'

interface Props {
  projects: ProjectSummary[]
  onOpen: (id: string) => void
  onEdit: (project: ProjectSummary) => void
  onStatus: (project: ProjectSummary) => void
  onSettings: (id: string) => void
  onDelete: (project: ProjectSummary) => void
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

const ProjectList: React.FC<Props> = ({
  projects,
  onOpen,
  onEdit,
  onStatus,
  onSettings,
  onDelete,
}) => {
  return (
    <CTable responsive hover align="middle">
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Mã</CTableHeaderCell>
          <CTableHeaderCell>Dự án</CTableHeaderCell>
          <CTableHeaderCell>Phòng ban</CTableHeaderCell>
          <CTableHeaderCell>Quản lý</CTableHeaderCell>
          <CTableHeaderCell>Trạng thái</CTableHeaderCell>
          <CTableHeaderCell>Tiến độ</CTableHeaderCell>
          <CTableHeaderCell>Thao tác</CTableHeaderCell>
        </CTableRow>
      </CTableHead>

      <CTableBody>
        {projects.map((project) => (
          <CTableRow key={project.id}>
            <CTableDataCell>
              <strong>{project.code}</strong>
            </CTableDataCell>

            <CTableDataCell>
              <div className="fw-semibold">{project.name}</div>
              <div className="small text-body-secondary">{project.description || '-'}</div>
            </CTableDataCell>

            <CTableDataCell>{project.departmentName || '-'}</CTableDataCell>
            <CTableDataCell>{project.managerName || '-'}</CTableDataCell>

            <CTableDataCell>
              <CBadge color={getStatusColor(project.status)}>{project.status}</CBadge>
            </CTableDataCell>

            <CTableDataCell>{project.progress ?? 0}%</CTableDataCell>

            <CTableDataCell>
              <div className="d-flex align-items-center gap-1">
                <CButton size="sm" color="primary" onClick={() => onOpen(project.id)}>
                  Xem
                </CButton>
                <ProjectCardMenu
                  project={project}
                  onView={() => onOpen(project.id)}
                  onEdit={() => onEdit(project)}
                  onStatus={() => onStatus(project)}
                  onSettings={() => onSettings(project.id)}
                  onDelete={() => onDelete(project)}
                />
              </div>
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  )
}

export default ProjectList