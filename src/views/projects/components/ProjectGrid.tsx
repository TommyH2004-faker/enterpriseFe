// src/views/projects/components/ProjectGrid.tsx

import React from 'react'
import { CCol, CRow } from '@coreui/react'
import { ProjectSummary } from 'src/types/ProjectType/project'
import ProjectCard from './ProjectCard'

interface Props {
  projects: ProjectSummary[]
  onOpen: (id: string) => void
  onEdit: (project: ProjectSummary) => void
  onStatus: (project: ProjectSummary) => void
  onSettings: (id: string) => void
  onDelete: (project: ProjectSummary) => void
  onOpenKanban: (id: string) => void
}

const ProjectGrid: React.FC<Props> = ({
  projects,
  onOpen,
  onEdit,
  onStatus,
  onSettings,
  onDelete,
  onOpenKanban,
}) => {
  return (
    <CRow className="g-3">
      {projects.map((project) => (
        <CCol key={project.id} xs={12} md={6} xl={4}>
          <ProjectCard
            project={project}
            onOpen={onOpen}
            onEdit={onEdit}
            onStatus={onStatus}
            onSettings={onSettings}
            onDelete={onDelete}
            onOpenKanban={onOpenKanban}
          />
        </CCol>
      ))}
    </CRow>
  )
}

export default ProjectGrid