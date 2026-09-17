// src/views/projects/Projects.tsx

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CSpinner,
} from '@coreui/react'

import { useNavigate } from 'react-router-dom'



import { projectService } from 'src/services/projectService'

import {
  useProjects,
} from './hooks/useProjects'

import {
  useProjectForm,
} from './hooks/useProjectForm'

import {
  useProjectActions,
} from './hooks/useProjectActions'

import ProjectToolbar from './components/ProjectToolbar'
import ProjectFiltersComponent from './components/ProjectFilters'
import ProjectGrid from './components/ProjectGrid'
import ProjectList from './components/ProjectList'
import ProjectCreateDrawer from './components/ProjectCreateDrawer'
import ProjectEditDrawer from './components/ProjectEditDrawer'
import ProjectDeleteModal from './components/ProjectDeleteModal'
import ProjectEmptyState from './components/ProjectEmptyState'
import ProjectStatusMenu from './components/ProjectStatusMenu'
import { ProjectFilter, ProjectOption, ProjectSummary } from 'src/types/ProjectType/project'
import { departmentService } from 'src/services/departmentService'
import { employeeService } from 'src/services/employeeService'
import { EmployeeResponse } from 'src/types/Employee'

const DEFAULT_FILTERS: ProjectFilter = {
  page: 1,
  pageSize: 12,
  search: '',
  status: '',
  departmentId: '',
  managerId: '',
  sortBy: 'CreatedAt',
  sortDirection: 'desc',
}

const Projects: React.FC = () => {
  const navigate = useNavigate()

  const [
    filters,
    setFilters,
  ] = useState<ProjectFilter>(
    DEFAULT_FILTERS,
  )

  const [
    view,
    setView,
  ] = useState<'grid' | 'list'>(
    'grid',
  )

  const [
    showCreate,
    setShowCreate,
  ] = useState(false)

  const [
    editingProject,
    setEditingProject,
  ] = useState<ProjectSummary | null>(
    null,
  )

  const [
    deletingProject,
    setDeletingProject,
  ] = useState<ProjectSummary | null>(
    null,
  )

  const [
    statusProject,
    setStatusProject,
  ] = useState<ProjectSummary | null>(
    null,
  )

  const [
    formLoading,
    setFormLoading,
  ] = useState(false)

  const [
    actionMessage,
    setActionMessage,
  ] = useState<string | null>(
    null,
  )

  const {
    data,
    loading,
    error,
    refetch,
  } = useProjects(filters)

  const createForm =
    useProjectForm()

  const editForm =
    useProjectForm({
      project: editingProject
        ? {
            ...editingProject,
          }
        : null,
    })

  const actions =
    useProjectActions()

 const [departments, setDepartments] = useState<ProjectOption[]>([])
  const [employees, setEmployees] = useState<EmployeeResponse[]>([])
  const [managers, setManagers] = useState<ProjectOption[]>([])
    useEffect(() => {
    const loadOptions = async () => {
      try {
        const [departmentResult, employeeResult] =
          await Promise.all([
            departmentService.getAllDepartments(1, 100),
            employeeService.getEmployees(),
          ])

        setDepartments(
          departmentResult.items.map((department) => ({
            id: department.id,
            name: department.name,
          })),
        )

        setEmployees(employeeResult)
      } catch (error) {
        console.error('Failed to load project options:', error)

        setDepartments([])
        setEmployees([])
        setManagers([])
      }
    }

    loadOptions()
  }, [])
    const handleCreateDepartmentChange = (
    departmentId: string,
  ) => {
    // Cập nhật Department cho form
    createForm.setDepartmentId(departmentId)

    // Mỗi lần đổi Department phải xóa Manager cũ
    createForm.setManagerId('')

    // Chỉ lấy nhân viên thuộc Department đang chọn
    const departmentManagers = employees
      .filter(
        (employee) =>
          employee.isActive &&
          employee.departmentId === departmentId,
      )
      .map((employee) => ({
        id: employee.userId,
        name: employee.fullName,
      }))

    setManagers(departmentManagers)
  }
  const hasFilter = useMemo(() => {
    return Boolean(
      filters.search ||
        filters.status ||
        filters.departmentId ||
        filters.managerId,
    )
  }, [filters])

  const openDetail = (
    projectId: string,
  ) => {
    navigate(
      `/projects/${projectId}`,
    )
  }

  const openKanban = (
    projectId: string,
  ) => {
    navigate(
      `/projects/${projectId}/kanban`,
    )
  }

  const handleCreate = async () => {
    if (
      !createForm.validate(true)
    ) {
      return
    }

    try {
      setFormLoading(true)

        const project =
    await projectService.createProject(
      createForm.buildCreateRequest(),
    )

  setShowCreate(false)

  setActionMessage(
    'Tạo dự án thành công.',
  )

  await refetch()

  if (project?.id) {
    navigate(
      `/projects/${project.id}`,
    )
  }
    } catch (err: any) {
      setActionMessage(
        err?.response?.data?.message ||
          'Không thể tạo dự án.',
      )
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async () => {
    if (
      !editingProject ||
      !editForm.validate(false)
    ) {
      return
    }

    try {
      setFormLoading(true)

      await projectService.updateProject(
        editingProject.id,
        editForm.buildUpdateRequest(),
      )

      setEditingProject(null)

      setActionMessage(
        'Cập nhật dự án thành công.',
      )

      await refetch()
    } catch (err: any) {
      setActionMessage(
        err?.response?.data?.message ||
          'Không thể cập nhật dự án.',
      )
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingProject) {
      return
    }

    const result =
      await actions.deleteProject(
        deletingProject.id,
      )

    if (result.success) {
      setDeletingProject(null)

      setActionMessage(
        'Xóa dự án thành công.',
      )

      await refetch()
    } else {
      setActionMessage(
        result.error ||
          'Không thể xóa dự án.',
      )
    }
  }

  const runStatusAction = async (
    action: () => Promise<{
      success: boolean
      error: string | null
    }>,
  ) => {
    const result = await action()

    if (result.success) {
      setStatusProject(null)

      setActionMessage(
        'Cập nhật trạng thái thành công.',
      )

      await refetch()
    } else {
      setActionMessage(
        result.error ||
          'Không thể cập nhật trạng thái.',
      )
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">
            Quản lý dự án
          </h4>

          <div className="text-body-secondary">
            Quản lý và theo dõi các dự án
            trong hệ thống.
          </div>
        </div>
      </div>

      {actionMessage && (
        <CAlert
          color="info"
          dismissible
          onClose={() =>
            setActionMessage(null)
          }
        >
          {actionMessage}
        </CAlert>
      )}

      {error && (
        <CAlert color="danger">
          {error}
        </CAlert>
      )}

      <ProjectToolbar
        search={
          filters.search || ''
        }
        onSearchChange={(value) =>
          setFilters({
            ...filters,
            page: 1,
            search: value,
          })
        }
        view={view}
        onViewChange={setView}
        canCreate
        onCreate={() =>
          setShowCreate(true)
        }
      />

      <ProjectFiltersComponent
        filters={filters}
        departments={departments}
        managers={managers}
        onChange={setFilters}
      />

      {loading ? (
        <CCard>
          <CCardBody className="text-center py-5">
            <CSpinner />
          </CCardBody>
        </CCard>
      ) : data.items.length === 0 ? (
        <ProjectEmptyState
          hasFilter={hasFilter}
          onCreate={() =>
            setShowCreate(true)
          }
        />
      ) : view === 'grid' ? (
        <ProjectGrid
          projects={data.items}
          onOpen={openDetail}
          onMenu={setStatusProject}
          onOpenKanban={
            openKanban
          }
        />
      ) : (
        <CCard>
          <CCardBody>
            <ProjectList
              projects={data.items}
              onOpen={openDetail}
              onMenu={setStatusProject}
            />
          </CCardBody>
        </CCard>
      )}

      <ProjectCreateDrawer
        visible={showCreate}
        code={createForm.code}
        name={createForm.name}
        description={
          createForm.description
        }
        departmentId={
          createForm.departmentId
        }
        managerId={
          createForm.managerId
        }
        startDate={
          createForm.startDate
        }
        endDate={
          createForm.endDate
        }
        priority={
          createForm.priority
        }
        departments={departments}
        managers={managers}
        errors={createForm.errors}
        loading={formLoading}
        onClose={() =>
          setShowCreate(false)
        }
        onSubmit={handleCreate}
        onCodeChange={
          createForm.setCode
        }
        onNameChange={
          createForm.setName
        }
        onDescriptionChange={
          createForm.setDescription
        }
        onDepartmentChange={
          handleCreateDepartmentChange
        }
        onManagerChange={
          createForm.setManagerId
        }
        onStartDateChange={
          createForm.setStartDate
        }
        onEndDateChange={
          createForm.setEndDate
        }
        onPriorityChange={
          createForm.setPriority
        }
      />

      {editingProject && (
        <ProjectEditDrawer
          visible
          projectCode={
            editingProject.code
          }
          name={editForm.name}
          description={
            editForm.description
          }
          startDate={
            editForm.startDate
          }
          endDate={
            editForm.endDate
          }
          priority={
            editForm.priority
          }
          errors={editForm.errors}
          loading={formLoading}
          onClose={() =>
            setEditingProject(null)
          }
          onSubmit={handleEdit}
          onNameChange={
            editForm.setName
          }
          onDescriptionChange={
            editForm.setDescription
          }
          onStartDateChange={
            editForm.setStartDate
          }
          onEndDateChange={
            editForm.setEndDate
          }
          onPriorityChange={
            editForm.setPriority
          }
        />
      )}

      {deletingProject && (
        <ProjectDeleteModal
          visible
          projectName={
            deletingProject.name
          }
          loading={
            actions.loading
          }
          onClose={() =>
            setDeletingProject(null)
          }
          onConfirm={
            handleDelete
          }
        />
      )}

      {statusProject && (
        <ProjectStatusMenu
          status={
            statusProject.status
          }
          isActive={
            statusProject.isActive
          }
          loading={
            actions.loading
          }
          onStart={() =>
            runStatusAction(
              () =>
                actions.start(
                  statusProject.id,
                ),
            )
          }
          onHold={() =>
            runStatusAction(
              () =>
                actions.hold(
                  statusProject.id,
                ),
            )
          }
          onResume={() =>
            runStatusAction(
              () =>
                actions.resume(
                  statusProject.id,
                ),
            )
          }
          onComplete={() =>
            runStatusAction(
              () =>
                actions.complete(
                  statusProject.id,
                ),
            )
          }
          onCancel={() =>
            runStatusAction(
              () =>
                actions.cancel(
                  statusProject.id,
                ),
            )
          }
          onActivate={() =>
            runStatusAction(
              () =>
                actions.activate(
                  statusProject.id,
                ),
            )
          }
          onDeactivate={() =>
            runStatusAction(
              () =>
                actions.deactivate(
                  statusProject.id,
                ),
            )
          }
        />
      )}
    </div>
  )
}

/*
 * ==========================================================
 * TODO: Replace these two functions with your existing
 * departmentService / employeeService.
 * ==========================================================
 */

async function apiGetDepartments(): Promise<
  ProjectOption[]
> {
  return []
}

async function apiGetManagers(): Promise<
  ProjectOption[]
> {
  return []
}

export default Projects