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

import ProjectDeleteModal from './components/ProjectDeleteModal'
import ProjectEmptyState from './components/ProjectEmptyState'
import ProjectStatusModal from './components/ProjectStatusModal'
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

  const actions =useProjectActions()
  const [projectMembers, setProjectMembers] =useState<EmployeeResponse[]>([])
  const [departments, setDepartments] = useState<ProjectOption[]>([])
  const [employees, setEmployees] = useState<EmployeeResponse[]>([])
  const [managers, setManagers] = useState<ProjectOption[]>([])

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [
          departmentResult,
          employeeResult,
        ] = await Promise.all([
          departmentService.getAllDepartments(1,100,),
          // Lấy toàn bộ employee.
          // Không truyền departmentId.
          employeeService.getEmployees(),
        ])

        setDepartments(
          departmentResult.items.map(
            (department) => ({
              id: department.id,
              name: department.name,
            }),
          ),
        )

        setEmployees(employeeResult)
        // Project members có thể đến từ bất kỳ
        // phòng ban nào, chỉ cần employee đang active.
        setProjectMembers(
          employeeResult.filter(
            (employee) => employee.isActive,
          ),
        )
      } catch (error) {
        console.error(
          'Failed to load project options:',
          error,
        )

        setDepartments([])
        setEmployees([])
        setProjectMembers([])
        setManagers([])
      }
    }

    loadOptions()
  }, [])



  const hasFilter = useMemo(() => {
    return Boolean(
      filters.search ||
        filters.status ||
        filters.departmentId ||
        filters.managerId,
    )
  }, [filters])
  const handleCreateDepartmentChange = (
    departmentId: string,
  ) => {
    // ==========================================
    // PROJECT DEPARTMENT
    // ==========================================

    createForm.setDepartmentId(
      departmentId,
    )

    // Đổi phòng ban Project
    // => Manager phải chọn lại
    createForm.setManagerId('')

    // ==========================================
    // KHÔNG RESET MEMBER
    // ==========================================
    //
    // Member không phụ thuộc department của Project.
    //
    // Ví dụ:
    // Project Department = Backend
    //
    // Members:
    // - Backend A
    // - Frontend B
    // - QA C
    //
    // Nếu đổi Project Department:
    // Backend -> Product
    //
    // Các member trên vẫn được giữ.
    //
    // KHÔNG được:
    // createForm.setMemberIds([])

    // ==========================================
    // MANAGER
    // ==========================================
    //
    // Manager vẫn bị giới hạn theo department
    // của Project.
    //

    const departmentManagers = employees
      .filter(
        (employee) =>
          employee.isActive &&
          employee.departmentId ===
            departmentId &&
          employee.positionName
            ?.toUpperCase() ===
            'MANAGER',
      )
      .map((employee) => ({
        id: employee.userId,
        name: employee.fullName,
      }))

    setManagers(
      departmentManagers,
    )
  }
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
          onEdit={(proj) => setEditingProject(proj)}
          onStatus={(proj) => setStatusProject(proj)}
          onSettings={(id) => navigate(`/projects/${id}/settings`)}
          onDelete={(proj) => setDeletingProject(proj)}
          onOpenKanban={openKanban}
        />
      ) : (
        <CCard>
          <CCardBody>
            <ProjectList
              projects={data.items}
              onOpen={openDetail}
              onEdit={(proj) => setEditingProject(proj)}
              onStatus={(proj) => setStatusProject(proj)}
              onSettings={(id) => navigate(`/projects/${id}/settings`)}
              onDelete={(proj) => setDeletingProject(proj)}
            />
          </CCardBody>
        </CCard>
      )}

      <ProjectCreateDrawer
      visible={showCreate}
      code={createForm.code}
      name={createForm.name}
      description={createForm.description}
      departmentId={createForm.departmentId}
      managerId={createForm.managerId}

      memberIds={createForm.memberIds}
      projectMembers={projectMembers}

      startDate={createForm.startDate}
      endDate={createForm.endDate}
      priority={createForm.priority}

      departments={departments}
      managers={managers}

      errors={createForm.errors}
      loading={formLoading}

      onClose={() => setShowCreate(false)}
      onSubmit={handleCreate}

      onCodeChange={createForm.setCode}
      onNameChange={createForm.setName}
      onDescriptionChange={createForm.setDescription}

      onDepartmentChange={
        handleCreateDepartmentChange
      }

      onManagerChange={
        createForm.setManagerId
      }

      onMemberIdsChange={
        createForm.setMemberIds
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

      <ProjectStatusModal
        visible={!!statusProject}
        projectName={statusProject?.name ?? ''}
        projectCode={statusProject?.code ?? ''}
        currentStatus={statusProject?.status ?? 'Planning'}
        isActive={statusProject?.isActive}
        loading={actions.loading}
        onClose={() => setStatusProject(null)}
        onStart={() =>
          runStatusAction(() => actions.start(statusProject!.id))
        }
        onHold={() =>
          runStatusAction(() => actions.hold(statusProject!.id))
        }
        onResume={() =>
          runStatusAction(() => actions.resume(statusProject!.id))
        }
        onComplete={() =>
          runStatusAction(() => actions.complete(statusProject!.id))
        }
        onCancel={() =>
          runStatusAction(() => actions.cancel(statusProject!.id))
        }
        onActivate={() =>
          runStatusAction(() => actions.activate(statusProject!.id))
        }
        onDeactivate={() =>
          runStatusAction(() => actions.deactivate(statusProject!.id))
        }
      />
    </div>
  )
}




export default Projects