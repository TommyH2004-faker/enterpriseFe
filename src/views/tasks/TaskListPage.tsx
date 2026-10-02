import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'

import { projectService } from 'src/services/projectService'
import taskService from 'src/services/taskService'
import type { ProjectSummary } from 'src/types/ProjectType/project'
import type { KanbanColumn, KanbanBoardSummary, ProjectTask } from 'src/types/KanbanType/kanban'
import type { CreateTaskRequest, TaskListItem } from 'src/types/task'
import { CreateTaskModal, type TaskLabelOption, type TaskMemberOption } from '../kanban/components/CreateTaskModal'
import { employeeService } from 'src/services/employeeService'
import labelService from 'src/services/labelService'
import toast from 'react-hot-toast'

interface TaskListPageProps {
  projectId?: string
}

type EditableTask = TaskListItem

const normalizeProjectTask = (task: ProjectTask): TaskListItem => ({
  ...task,
  taskType: task.taskType,
  priority: task.priority,
  status: task.status,
  assignees: [],
  labels: [],
  commentCount: 0,
  attachmentCount: 0,
})

const dateOnly = (value?: string | null) => value?.slice(0, 10) ?? ''

const TaskListPage: React.FC<TaskListPageProps> = ({ projectId: projectIdProp }) => {
  const navigate = useNavigate()
  const { projectId: routeProjectId } = useParams<{ projectId: string }>()
  const projectId = projectIdProp ?? routeProjectId
  const isProjectPage = Boolean(projectId)

  const [tasks, setTasks] = useState<EditableTask[]>([])
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [boards, setBoards] = useState<KanbanBoardSummary[]>([])
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [members, setMembers] = useState<TaskMemberOption[]>([])
  const [labels, setLabels] = useState<TaskLabelOption[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? '')
  const [selectedBoardId, setSelectedBoardId] = useState('')
  const [selectedColumnId, setSelectedColumnId] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [filterProjectId, setFilterProjectId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      if (projectId) {
        const data = await projectService.getProjectTasks(projectId)
        setTasks(data.map(normalizeProjectTask))
        setTotalPages(1)
        setTotalCount(data.length)
      } else {
        const data = await taskService.getAllTasks({
          page,
          pageSize,
          search,
          status,
          projectId: filterProjectId,
          assigneeId,
        })
        setTasks(data.items ?? [])
        setTotalPages(data.totalPages ?? 1)
        setTotalCount(data.totalCount ?? 0)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể tải danh sách công việc.')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [assigneeId, filterProjectId, page, pageSize, projectId, search, status])

  const loadBoards = useCallback(async (currentProjectId: string) => {
    if (!currentProjectId) {
      setBoards([])
      setColumns([])
      setSelectedBoardId('')
      setSelectedColumnId('')
      return
    }

    try {
      const result = await projectService.getBoards(currentProjectId)
      setBoards(result)
      const board = result[0]
      setSelectedBoardId(board?.id ?? '')
      if (board) {
        const detail = await projectService.getBoard(currentProjectId, board.id)
        setColumns(detail.columns ?? [])
        setSelectedColumnId(detail.columns?.[0]?.id ?? '')
      } else {
        setColumns([])
        setSelectedColumnId('')
      }
    } catch {
      setBoards([])
      setColumns([])
      setSelectedBoardId('')
      setSelectedColumnId('')
    }
  }, [])

  useEffect(() => { void loadTasks() }, [loadTasks])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [projectResult, employeeResult] = await Promise.all([
          isProjectPage ? Promise.resolve(null) : projectService.getProjects({ page: 1, pageSize: 100 }),
          employeeService.getEmployees(),
        ])
        if (projectResult) setProjects(projectResult.items)
        setMembers(employeeResult.filter((employee) => employee.isActive).map((employee) => ({
          id: employee.id,
          name: employee.fullName,
          email: employee.email,
        })))
        await loadBoards(projectId ?? '')
      } catch {
        setProjects([])
        setMembers([])
      }
    }
    void loadInitialData()
  }, [isProjectPage, loadBoards, projectId])

  useEffect(() => {
    const currentProjectId = projectId ?? selectedProjectId
    if (!currentProjectId) {
      setLabels([])
      return
    }

    labelService.getProjectLabels(currentProjectId)
      .then((result) => setLabels(result.filter((label) => label.isActive !== false).map((label) => ({
        id: label.id,
        name: label.name,
        color: label.color || '#0d6efd',
      }))))
      .catch(() => setLabels([]))
  }, [projectId, selectedProjectId])

  useEffect(() => {
    if (isProjectPage) return
    if (selectedProjectId) void loadBoards(selectedProjectId)
  }, [isProjectPage, loadBoards, selectedProjectId])

  const visibleTasks = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return tasks
    return tasks.filter((task) => `${task.title} ${task.description ?? ''}`.toLowerCase().includes(term))
  }, [search, tasks])

  const openCreate = () => {
    setSelectedProjectId(projectId ?? selectedProjectId)
    setShowCreate(true)
  }

  const createLabel = async (name: string, color: string) => {
    const currentProjectId = projectId ?? selectedProjectId
    if (!currentProjectId) return

    try {
      await labelService.createLabel(currentProjectId, { name, color })
      const result = await labelService.getProjectLabels(currentProjectId)
      setLabels(result.filter((label) => label.isActive !== false).map((label) => ({
        id: label.id,
        name: label.name,
        color: label.color || '#0d6efd',
      })))
      toast.success('Tạo label thành công.')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể tạo label.')
      throw err
    }
  }

  const handleCreate = async (request: CreateTaskRequest) => {
    try {
      setSaving(true)
      const createResponse: any = await projectService.createTask(request)
      const createdTask = createResponse?.data || createResponse?.value || createResponse
      const createdTaskId = createdTask?.id

      if (createdTaskId && request.assigneeIds?.length > 0) {
        await taskService.updateTaskAssignees(createdTaskId, {
          employeeIds: request.assigneeIds,
        })
      }

      setShowCreate(false)
      toast.success('Tạo công việc thành công.')
      await loadTasks()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể tạo công việc.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (task: EditableTask) => {
    try {
      setSaving(true)
      await taskService.deleteTask(task.id)
      toast.success('Xóa công việc thành công.')
      await loadTasks()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xóa công việc.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (task: EditableTask) => {
    toast.custom((toastItem) => (
      <div className="bg-white border rounded shadow p-3 d-flex align-items-center gap-3">
        <span className="small">Xóa công việc <strong>{task.title}</strong>?</span>
        <CButton size="sm" color="danger" onClick={() => {
          toast.dismiss(toastItem.id)
          void confirmDelete(task)
        }}>
          Xóa
        </CButton>
        <CButton size="sm" color="light" className="border" onClick={() => toast.dismiss(toastItem.id)}>
          Hủy
        </CButton>
      </div>
    ), { duration: 5000 })
  }

  const activeProjectId = projectId ?? selectedProjectId
  const canCreate = !isProjectPage && Boolean(activeProjectId && selectedBoardId && selectedColumnId)
  const pageTitle = isProjectPage ? 'Công việc của dự án' : 'Tất cả công việc'

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
        <div>
          <h4 className="mb-1">{pageTitle}</h4>
          <div className="text-body-secondary">Quản lý, cập nhật và theo dõi công việc.</div>
        </div>
        {!isProjectPage && (
          <CButton color="primary" onClick={openCreate} disabled={!canCreate || saving}>
            + Tạo công việc
          </CButton>
        )}
      </div>

      {!isProjectPage && (
        <CCard className="mb-3">
          <CCardBody className="row g-3">
            <div className="col-md-3">
              <CFormLabel>Tìm kiếm</CFormLabel>
              <CFormInput value={search} placeholder="Tiêu đề hoặc mô tả" onChange={(event) => { setPage(1); setSearch(event.target.value) }} />
            </div>
            <div className="col-md-2">
              <CFormLabel>Trạng thái</CFormLabel>
              <CFormSelect value={status} onChange={(event) => { setPage(1); setStatus(event.target.value) }}>
                <option value="">Tất cả</option>
                <option value="Todo">Todo</option>
                <option value="InProgress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
                <option value="Cancelled">Cancelled</option>
              </CFormSelect>
            </div>
            <div className="col-md-3">
              <CFormLabel>Lọc theo dự án</CFormLabel>
              <CFormSelect value={filterProjectId} onChange={(event) => { setPage(1); setFilterProjectId(event.target.value) }}>
                <option value="">Tất cả dự án</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </CFormSelect>
            </div>
            <div className="col-md-4">
              <CFormLabel>Lọc theo người thực hiện</CFormLabel>
              <CFormSelect value={assigneeId} onChange={(event) => { setPage(1); setAssigneeId(event.target.value) }}>
                <option value="">Tất cả người thực hiện</option>
                {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </CFormSelect>
            </div>
            <div className="col-md-4">
              <CFormLabel>Dự án</CFormLabel>
              <CFormSelect value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
                <option value="">Chọn dự án để tạo task</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </CFormSelect>
            </div>
            <div className="col-md-4">
              <CFormLabel>Board</CFormLabel>
              <CFormSelect value={selectedBoardId} onChange={async (event) => {
                const boardId = event.target.value
                setSelectedBoardId(boardId)
                const detail = await projectService.getBoard(selectedProjectId, boardId)
                setColumns(detail.columns ?? [])
                setSelectedColumnId(detail.columns?.[0]?.id ?? '')
              }} disabled={!selectedProjectId}>
                <option value="">Chọn board</option>
                {boards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}
              </CFormSelect>
            </div>
            <div className="col-md-4">
              <CFormLabel>Cột</CFormLabel>
              <CFormSelect value={selectedColumnId} onChange={(event) => setSelectedColumnId(event.target.value)} disabled={!selectedBoardId}>
                <option value="">Chọn cột</option>
                {columns.map((column) => <option key={column.id} value={column.id}>{column.name}</option>)}
              </CFormSelect>
            </div>
          </CCardBody>
        </CCard>
      )}

      <CCard>
        <CCardBody>
          <CFormInput className="mb-3" placeholder="Tìm theo tiêu đề hoặc mô tả..." value={search} onChange={(event) => setSearch(event.target.value)} />
          {loading ? <div className="text-center py-5"><CSpinner /></div> : visibleTasks.length === 0 ? <div className="text-center text-body-secondary py-5">Chưa có công việc.</div> : (
            <CTable responsive hover align="middle">
              <CTableHead><CTableRow><CTableHeaderCell>Tiêu đề</CTableHeaderCell><CTableHeaderCell>Trạng thái</CTableHeaderCell><CTableHeaderCell>Ưu tiên</CTableHeaderCell><CTableHeaderCell>Tiến độ</CTableHeaderCell><CTableHeaderCell>Hạn</CTableHeaderCell><CTableHeaderCell className="text-end">Thao tác</CTableHeaderCell></CTableRow></CTableHead>
              <CTableBody>{visibleTasks.map((task) => (
                <CTableRow key={task.id}>
                  <CTableDataCell><div className="fw-semibold">{task.title}</div><div className="small text-body-secondary">{task.description || 'Không có mô tả'}</div></CTableDataCell>
                  <CTableDataCell>{task.status}</CTableDataCell>
                  <CTableDataCell>{task.priority}</CTableDataCell>
                  <CTableDataCell>{task.progress}%</CTableDataCell>
                  <CTableDataCell>{dateOnly(task.dueDate) || '-'}</CTableDataCell>
                  <CTableDataCell className="text-end text-nowrap"><CButton size="sm" color="info" variant="outline" className="me-2" onClick={() => navigate(`/tasks/${task.id}`)}>Chi tiết</CButton><CButton size="sm" color="danger" variant="outline" onClick={() => void handleDelete(task)} disabled={saving}>Xóa</CButton></CTableDataCell>
                </CTableRow>
              ))}</CTableBody>
            </CTable>
          )}
          {!isProjectPage && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span className="small text-body-secondary">
                Tổng cộng {totalCount} công việc, trang {page}/{totalPages}
              </span>
              <div className="d-flex gap-2">
                <CButton
                  size="sm"
                  color="light"
                  className="border"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Trước
                </CButton>
                <CButton
                  size="sm"
                  color="light"
                  className="border"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  Sau
                </CButton>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>

      {!isProjectPage && (
        <CreateTaskModal
          visible={showCreate}
          columns={columns}
          projectId={activeProjectId}
          boardId={selectedBoardId}
          defaultColumnId={selectedColumnId}
          members={members}
          labels={labels}
          onCreateLabel={createLabel}
          onClose={() => setShowCreate(false)}
          onSubmit={(request) => void handleCreate(request)}
        />
      )}

    </div>
  )
}

export default TaskListPage
