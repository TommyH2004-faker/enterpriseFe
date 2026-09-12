import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DropResult } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import { projectService } from '../../services/projectService'
import {
  KanbanBoardDetail,
  KanbanBoardSummary,
  KanbanColumn,
  KanbanTask,
  ProjectDetail,
} from '../../types/Project'
import { Task } from '../../types'

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'col-todo', boardId: '', name: 'Cần làm', color: '#6c757d', position: 1, tasks: [] },
  { id: 'col-in-progress', boardId: '', name: 'Đang làm', color: '#f59e0b', position: 2, tasks: [] },
  { id: 'col-review', boardId: '', name: 'Chờ duyệt', color: '#0ea5e9', position: 3, tasks: [] },
  { id: 'col-done', boardId: '', name: 'Hoàn thành', color: '#10b981', position: 4, tasks: [] },
]

export const toTaskModal = (task: KanbanTask): Task => ({
  id: task.id,
  content: task.title,
  description: task.description || '',
  priority:
    task.priority === 'Critical'
      ? 'Khẩn cấp'
      : task.priority === 'High'
        ? 'Cao'
        : task.priority === 'Low'
          ? 'Thấp'
          : 'Trung bình',
  assignee: task.assignees?.[0]?.fullName || 'Chưa phân công',
  dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Chưa có hạn',
  comments: task.commentCount || 0,
  attachments: task.attachmentCount || 0,
  labels: task.labels?.map((label) => ({ text: label.name, color: 'primary' })) || [],
})

export const matchesTaskFilter = (task: KanbanTask, search: string, priority: string) => {
  const matchesSearch =
    !search ||
    `${task.title} ${task.description || ''}`.toLowerCase().includes(search.toLowerCase())
  const matchesPriority = !priority || task.priority === priority
  return matchesSearch && matchesPriority
}

export const useKanban = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [boards, setBoards] = useState<KanbanBoardSummary[]>([])
  const [board, setBoard] = useState<KanbanBoardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [boardLoading, setBoardLoading] = useState(false)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('')

  // Task detail modal state
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  // Creation modals state
  const [createBoardVisible, setCreateBoardVisible] = useState(false)
  const [createTaskVisible, setCreateTaskVisible] = useState(false)
  const [targetColumnId, setTargetColumnId] = useState<string>('')

  const ensureColumns = (detail: KanbanBoardDetail): KanbanBoardDetail => {
    if (!detail.columns || detail.columns.length === 0) {
      return {
        ...detail,
        columns: DEFAULT_COLUMNS.map((col) => ({ ...col, boardId: detail.id })),
      }
    }
    return detail
  }

  const loadBoard = useCallback(
    async (boardId: string, currentProjectId = projectId) => {
      if (!currentProjectId) return
      try {
        setBoardLoading(true)
        const detail = await projectService.getBoard(currentProjectId, boardId)
        if (!detail.columns?.some((column) => column.tasks)) {
          const tasks = await projectService.getBoardTasks(boardId).catch(() => [])
          detail.columns = (detail.columns || []).map((column) => ({
            ...column,
            tasks: tasks.filter((task) => task.columnId === column.id),
          }))
        }
        setBoard(ensureColumns(detail))
      } catch {
        setError('Không thể tải dữ liệu Kanban của dự án.')
      } finally {
        setBoardLoading(false)
      }
    },
    [projectId],
  )

  useEffect(() => {
    if (!projectId) return
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const [projectResult, boardsResult] = await Promise.all([
          projectService.getProjectById(projectId),
          projectService.getBoards(projectId).catch(() => []),
        ])
        setProject(projectResult)
        setBoards(boardsResult)

        const defaultBoard = boardsResult.find((item) => item.isDefault) || boardsResult[0]
        if (defaultBoard) {
          await loadBoard(defaultBoard.id, projectId)
        } else {
          // If no board exists yet, prepare a virtual default board with 4 columns
          setBoard({
            id: 'default-board',
            projectId,
            name: 'Sprint chính',
            description: 'Quy trình công việc chuẩn 4 cột',
            isDefault: true,
            columns: DEFAULT_COLUMNS.map((col) => ({ ...col, boardId: 'default-board' })),
          })
        }
      } catch {
        setError('Không thể tải dự án hoặc danh sách Kanban.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [projectId, loadBoard])

  // Drag and Drop Handler
  const onDragEnd = async (result: DropResult) => {
    if (!board || !result.destination) return
    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return
    }

    const sourceColumn = board.columns.find((column) => column.id === result.source.droppableId)
    const destinationColumn = board.columns.find(
      (column) => column.id === result.destination?.droppableId,
    )
    if (!sourceColumn || !destinationColumn) return

    const task = sourceColumn.tasks?.find((item) => item.id === result.draggableId)
    if (!task) return

    const nextColumns = board.columns.map((column) => ({
      ...column,
      tasks: [...(column.tasks || [])],
    }))
    const nextSource = nextColumns.find((column) => column.id === sourceColumn.id) as KanbanColumn
    const nextDestination = nextColumns.find(
      (column) => column.id === destinationColumn.id,
    ) as KanbanColumn

    nextSource.tasks = nextSource.tasks?.filter((item) => item.id !== task.id)

    const visibleDestinationTasks =
      nextDestination.tasks?.filter((item) => matchesTaskFilter(item, search, priority)) || []
    const anchorTask = visibleDestinationTasks[result.destination.index]
    const insertionIndex = anchorTask
      ? nextDestination.tasks?.findIndex((item) => item.id === anchorTask.id) ??
        nextDestination.tasks?.length ??
        0
      : nextDestination.tasks?.length ?? 0

    nextDestination.tasks?.splice(insertionIndex, 0, { ...task, columnId: nextDestination.id })
    setBoard({ ...board, columns: nextColumns })

    try {
      await projectService.moveTask(task.id, {
        columnId: nextDestination.id,
        position: insertionIndex,
      })
    } catch {
      toast.error('Không thể cập nhật vị trí công việc trên máy chủ')
      if (board.id !== 'default-board') {
        await loadBoard(board.id)
      }
    }
  }

  // Board Creation
  const createBoard = async (name: string, description: string) => {
    if (!projectId || !name.trim()) {
      throw new Error('Vui lòng nhập tên board.')
    }
    const createdBoard = await projectService.createBoard(projectId, {
      name: name.trim(),
      description: description.trim() || undefined,
    })
    setBoards((previous) => [...previous, createdBoard])
    setCreateBoardVisible(false)
    await loadBoard(createdBoard.id)
  }

  // Task Creation: Defaults to the first column (To Do)
  const createTask = (params: {
    title: string
    description?: string
    priority?: string
    dueDate?: string | null
    columnId?: string
  }) => {
    if (!board) return

    // Pick targeted column or fallback to the FIRST column (To Do)
    const firstColId = board.columns[0]?.id || 'col-todo'
    const colId = params.columnId || targetColumnId || firstColId

    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      projectId,
      boardId: board.id,
      columnId: colId,
      title: params.title,
      description: params.description || '',
      priority: params.priority || 'Medium',
      dueDate: params.dueDate || null,
      assignees: [],
      labels: [],
      commentCount: 0,
      attachmentCount: 0,
      position: 0,
    }

    // Add to the top of the selected column
    const nextColumns = board.columns.map((col) => {
      if (col.id === colId) {
        return {
          ...col,
          tasks: [newTask, ...(col.tasks || [])],
        }
      }
      return col
    })

    setBoard({ ...board, columns: nextColumns })
    setCreateTaskVisible(false)
    toast.success(`Đã thêm công việc vào cột "${board.columns.find((c) => c.id === colId)?.name || 'Cần làm'}"`)
  }

  const openTaskModal = (task: KanbanTask) => {
    setSelectedTask(task)
    setModalVisible(true)
  }

  const closeTaskModal = () => {
    setModalVisible(false)
    setSelectedTask(null)
  }

  const updateTask = (updated: KanbanTask) => {
    if (!board) return
    const nextColumns = board.columns.map((col) => {
      const existing = col.tasks?.find((t) => t.id === updated.id)
      if (col.id === updated.columnId) {
        if (existing) {
          return {
            ...col,
            tasks: col.tasks?.map((t) => (t.id === updated.id ? updated : t)),
          }
        } else {
          return {
            ...col,
            tasks: [updated, ...(col.tasks || [])],
          }
        }
      } else {
        return {
          ...col,
          tasks: col.tasks?.filter((t) => t.id !== updated.id),
        }
      }
    })

    setBoard({ ...board, columns: nextColumns })
    setSelectedTask(updated)
    toast.success('Đã lưu thay đổi công việc')
  }

  const deleteTask = (taskId: string) => {
    if (!board) return
    const nextColumns = board.columns.map((col) => ({
      ...col,
      tasks: col.tasks?.filter((t) => t.id !== taskId),
    }))
    setBoard({ ...board, columns: nextColumns })
    closeTaskModal()
    toast.success('Đã xóa công việc khỏi bảng')
  }

  const openCreateTaskModal = (columnId?: string) => {
    setTargetColumnId(columnId || board?.columns[0]?.id || '')
    setCreateTaskVisible(true)
  }

  const closeCreateTaskModal = () => {
    setCreateTaskVisible(false)
    setTargetColumnId('')
  }

  return {
    projectId,
    project,
    boards,
    board,
    loading,
    boardLoading,
    error,
    search,
    priority,
    setSearch,
    setPriority,
    selectedTask,
    modalVisible,
    openTaskModal,
    closeTaskModal,
    updateTask,
    deleteTask,
    createBoardVisible,
    setCreateBoardVisible,
    createTaskVisible,
    targetColumnId,
    openCreateTaskModal,
    closeCreateTaskModal,
    loadBoard,
    onDragEnd,
    createBoard,
    createTask,
  }
}
