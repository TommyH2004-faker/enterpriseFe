// src/views/projects/components/ProjectGrid.tsx

import React from 'react'

import { CCol, CRow } from '@coreui/react'
import { ProjectSummary } from 'src/types/ProjectType/project'
import ProjectCard from './ProjectCard'



interface Props {
  projects: ProjectSummary[]

  onOpen: (
    id: string,
  ) => void

  onMenu: (
    project: ProjectSummary,
  ) => void

  onOpenKanban: (
    id: string,
  ) => void
}

const ProjectGrid: React.FC<Props> = ({
  projects,
  onOpen,
  onMenu,
  onOpenKanban,
}) => {
  return (
    <CRow className="g-3">
      {projects.map((project) => (
        <CCol
          key={project.id}
          xs={12}
          md={6}
          xl={4}
        >
          <ProjectCard
            project={project}
            onOpen={onOpen}
            onMenu={onMenu}
            onOpenKanban={
              onOpenKanban
            }
          />
        </CCol>
      ))}
    </CRow>
  )
}

export default ProjectGrid