import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CSpinner,
} from '@coreui/react'
import {
  Outlet,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { useProjectDetail } from './hooks/useProjectDetail'
import ProjectDetailHeader from './components/ProjectDetailHeader'
import ProjectDetailTabs from './components/ProjectDetailTabs'

import ProjectDeleteModal from '../projects/components/ProjectDeleteModal'
import ProjectEditDrawer from '../projects/components/ProjectEditDrawer'

import { useProjectActions } from '../projects/hooks/useProjectActions'
import { projectService } from 'src/services/projectService'

import type {
  ProjectPriority,
  ProjectPriorityLabel,
} from 'src/types/ProjectType/project'
import toast from 'react-hot-toast'
import { useProjectPermissions } from '../projects/hooks/useProjectPermissions'
import ToastAlert from 'src/components/ToastAlert'

/**
 * Project priority:
 *
 * Backend enum:
 * Low      = 1
 * Medium   = 2
 * High     = 3
 * Critical = 4
 */

/**
 * Convert backend priority number -> display label
 */
const PRIORITY_LABEL_MAP: Record<
  ProjectPriority,
  ProjectPriorityLabel
> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
}

/**
 * Convert display label -> backend priority number
 */
const PRIORITY_NUM_MAP: Record<
  ProjectPriorityLabel,
  ProjectPriority
> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
}

const ProjectDetailInner: React.FC<{
  projectId: string
}> = ({ projectId }) => {
  const navigate = useNavigate()

  const {
    project,
    progress,
    statistics,
    loading,
    error,
    refetch,
  } = useProjectDetail(projectId)



  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [formLoading, setFormLoading] = useState(false)

  // =========================================================
  // Edit form state
  // =========================================================

  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')

  /**
   * UI sử dụng label để hiển thị:
   * Low / Medium / High / Critical
   *
   * Khi submit sẽ convert lại thành:
   * 1 / 2 / 3 / 4
   */
  const [editPriority, setEditPriority] =
    useState<ProjectPriorityLabel>('Medium')

  const [editErrors, setEditErrors] =
    useState<Record<string, string>>({})

  const actions = useProjectActions()
  const permissions = useProjectPermissions()

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <CCard className="shadow-sm border-0">
        <CCardBody className="text-center py-5">
          <CSpinner color="primary" />

          <div className="text-body-secondary mt-2 small">
            Đang tải dữ liệu chi tiết dự án...
          </div>
        </CCardBody>
      </CCard>
    )
  }

  // =========================================================
  // Error
  // =========================================================

  if (error || !project) {
    return <ToastAlert message={error || 'Không tìm thấy dự án.'} />
  }

  // =========================================================
  // Navigation
  // =========================================================

  const handleBack = () => {
    navigate('/projects')
  }

  const handleKanban = () => {
    navigate(`/projects/${projectId}/kanban`)
  }

  // =========================================================
  // Open edit drawer
  // =========================================================

  const handleEditOpen = () => {
    if (!permissions.can(project, 'edit')) {
      toast.error(permissions.getDeniedMessage(project))
      return
    }

    setEditName(project.name || '')

    setEditDesc(project.description || '')

    setEditStart(
      project.startDate
        ? project.startDate.substring(0, 10)
        : '',
    )

    setEditEnd(
      project.endDate
        ? project.endDate.substring(0, 10)
        : '',
    )

    /**
     * Backend trả priority:
     *
     * 1 = Low
     * 2 = Medium
     * 3 = High
     * 4 = Critical
     *
     * Nếu API không trả priority thì mặc định Medium.
     */
    const priority: ProjectPriority =
      project.priority ?? 2

    setEditPriority(
      PRIORITY_LABEL_MAP[priority] ?? 'Medium',
    )

    setEditErrors({})
    setShowEdit(true)
  }

    // =========================================================
    // Submit edit
    // =========================================================

  const handleEditSubmit = async () => {
    const errs: Record<string, string> = {}

    if (!editName.trim()) {
      errs.name = 'Tên dự án không được để trống.'
    }

    if (
      editStart &&
      editEnd &&
      editEnd < editStart
    ) {
      errs.endDate =
        'Ngày kết thúc phải lớn hơn ngày bắt đầu.'
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs)
      return
    }

    try {
      setFormLoading(true)

      const priority: ProjectPriority =
        PRIORITY_NUM_MAP[editPriority]

      await projectService.updateProject(
        project.id,
        {
          name: editName.trim(),
          description: editDesc.trim() || undefined,
          startDate: editStart || null,
          endDate: editEnd || null,
          priority,
        },
      )

      setShowEdit(false)

      toast.success(
        'Cập nhật thông tin dự án thành công.',
      )

      await refetch()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          'Không thể cập nhật thông tin dự án.',
      )
    } finally {
      setFormLoading(false)
    }
  }

  // =========================================================
  // Delete project
  // =========================================================

  const handleDeleteConfirm = async () => {
    if (!permissions.can(project, 'delete')) {
      setShowDeleteModal(false)
      toast.error(permissions.getDeniedMessage(project))
      return
    }

    const result =
      await actions.deleteProject(project.id)

    if (result.success) {
      setShowDeleteModal(false)

      navigate('/projects')
    } else {
      toast.error(
        result.error ||
          'Không thể xóa dự án.',
      )
    }
  }

  // =========================================================
  // Render
  // =========================================================

  return (
    <div>
      {/* =====================================================
          Project Header
      ===================================================== */}

      <ProjectDetailHeader
        project={project}
        onBack={handleBack}
        onOpenKanban={handleKanban}
        onEdit={handleEditOpen}
      />

      {/* =====================================================
          Global message
      ===================================================== */}

   

      {/* =====================================================
          Project Detail Tabs
      ===================================================== */}

      <ProjectDetailTabs
        projectId={projectId}
      />

      {/* =====================================================
          Nested pages
      ===================================================== */}

      <Outlet
        context={{
          project,
          progress,
          statistics,
          loading,
          error,
          refetch,
          onEdit: handleEditOpen,
          onDelete: () =>
            setShowDeleteModal(true),
        }}
      />

      {/* =====================================================
          Edit Project Drawer
      ===================================================== */}

      {showEdit && (
        <ProjectEditDrawer
          visible={showEdit}
          projectCode={project.code}

          name={editName}
          description={editDesc}

          startDate={editStart}
          endDate={editEnd}

          priority={editPriority}

          errors={editErrors}
          loading={formLoading}

          onClose={() =>
            setShowEdit(false)
          }

          onSubmit={handleEditSubmit}

          onNameChange={setEditName}

          onDescriptionChange={
            setEditDesc
          }

          onStartDateChange={
            setEditStart
          }

          onEndDateChange={
            setEditEnd
          }

          onPriorityChange={
            setEditPriority
          }
        />
      )}

      {/* =====================================================
          Delete Modal
      ===================================================== */}

      {showDeleteModal && (
        <ProjectDeleteModal
          visible={showDeleteModal}
          projectName={project.name}
          loading={actions.loading}

          onClose={() =>
            setShowDeleteModal(false)
          }

          onConfirm={
            handleDeleteConfirm
          }
        />
      )}
    </div>
  )
}

// =============================================================
// Route component
// =============================================================

const ProjectDetail: React.FC = () => {
  const { projectId } =
    useParams<{ projectId: string }>()

  if (!projectId) {
    return <ToastAlert message="Không tìm thấy projectId." />
  }

  return (
    <ProjectDetailInner
      projectId={projectId}
    />
  )
}

export default ProjectDetail