// src/views/project-detail/components/ProjectDetailTabs.tsx

import React from 'react'

import {
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'

import { NavLink } from 'react-router-dom'

interface Props {
  projectId: string
}

const ProjectDetailTabs: React.FC<Props> = ({
  projectId,
}) => {
  const base =
    `/projects/${projectId}`

  const tabs = [
    {
      label: 'Overview',
      path: base,
      end: true,
    },
    {
      label: 'Kanban',
      path: `${base}/kanban`,
    },
    {
      label: 'Members',
      path: `${base}/members`,
    },
    {
      label: 'Milestones',
      path: `${base}/milestones`,
    },
    {
      label: 'Files',
      path: `${base}/files`,
    },
    {
      label: 'Labels',
      path: `${base}/labels`,
    },
    {
      label: 'Tags',
      path: `${base}/tags`,
    },
    {
      label: 'Settings',
      path: `${base}/settings`,
    },
  ]

  return (
    <CNav variant="tabs" className="mb-4">
    {tabs.map((tab) => (
        <CNavItem key={tab.path}>
        <NavLink
            to={tab.path}
            end={tab.end}
            className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
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