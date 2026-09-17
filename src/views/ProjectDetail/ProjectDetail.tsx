// src/views/project-detail/ProjectDetail.tsx

import React, {
  useState,
} from 'react'

import {
  CAlert,
  CCard,
  CCardBody,
  CSpinner,
} from '@coreui/react'

import {
  Outlet,
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  useProjectDetail,
} from './hooks/useProjectDetail'

import ProjectDetailHeader from './components/ProjectDetailHeader'
import ProjectDetailTabs from './components/ProjectDetailTabs'

const ProjectDetail: React.FC = () => {
  const {
    projectId,
  } = useParams<{
    projectId: string
  }>()

  const navigate = useNavigate()

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null,
  )

  if (!projectId) {
    return (
      <CAlert color="danger">
        Không tìm thấy projectId.
      </CAlert>
    )
  }

  const {
    project,
    loading,
    error,
  } = useProjectDetail(
    projectId,
  )

  if (loading) {
    return (
      <CCard>
        <CCardBody className="text-center py-5">
          <CSpinner />
        </CCardBody>
      </CCard>
    )
  }

  if (error || !project) {
    return (
      <CAlert color="danger">
        {error ||
          'Không tìm thấy dự án.'}
      </CAlert>
    )
  }

  const handleBack = () => {
    navigate('/projects')
  }

  const handleKanban = () => {
    navigate(
      `/projects/${projectId}/kanban`,
    )
  }

  const handleEdit = () => {
    /*
     * Có thể mở Edit Drawer tại đây.
     *
     * Nếu muốn dùng chung ProjectEditDrawer,
     * đưa state edit vào page này.
     */
    setMessage(
      'TODO: mở Edit Project Drawer.',
    )
  }

  const handleMenu = () => {
    setMessage(
      'TODO: mở Project Action Menu.',
    )
  }

  return (
    <div>
      <ProjectDetailHeader
        project={project}
        onBack={handleBack}
        onOpenKanban={
          handleKanban
        }
        onEdit={handleEdit}
        onMenu={handleMenu}
      />

      {message && (
        <CAlert
          color="info"
          dismissible
          onClose={() =>
            setMessage(null)
          }
        >
          {message}
        </CAlert>
      )}

      <ProjectDetailTabs
        projectId={projectId}
      />

      <Outlet />
    </div>
  )
}

export default ProjectDetail