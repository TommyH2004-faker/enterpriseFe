// src/views/project-detail/components/ProjectDetailTabs.tsx

import React from 'react'
import { CNav, CNavItem } from '@coreui/react'
import { NavLink } from 'react-router-dom'

interface Props {
  projectId: string
}

const ProjectDetailTabs: React.FC<Props> = ({ projectId }) => {
  const base = `/projects/${projectId}`

  const tabs = [
    { label: 'Overview', path: base, end: true },
    { label: 'Kanban', path: `${base}/kanban` },
    { label: 'Tasks', path: `${base}/tasks` },
    { label: 'Members', path: `${base}/members` },
    { label: 'Files', path: `${base}/files` },
    { label: 'Settings', path: `${base}/settings` },
  ]

  return (
    <CNav variant="tabs" className="mb-4 border-bottom">
      {tabs.map((tab) => (
        <CNavItem key={tab.path}>
          <NavLink
            to={tab.path}
            end={tab.end}
            className={({ isActive }) =>
              `nav-link fw-semibold px-3 py-2 ${isActive ? 'active text-primary border-primary border-bottom-0' : 'text-body-secondary'}`
            }
          >
            {tab.label}
          </NavLink>
        </CNavItem>
      ))}
    </CNav>
  )
}

export default ProjectDetailTabs