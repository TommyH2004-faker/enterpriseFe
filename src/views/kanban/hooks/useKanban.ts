import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DropResult } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'

import { projectService } from '../../../services/projectService'

import { Task } from '../../../types'
import {
  KanbanBoardSummary,
  KanbanTask,
} from 'src/types/KanbanType/kanban'
import { ProjectDetail } from 'src/types/ProjectType/project'
import taskService from 'src/services/taskService'

/**
 * Chuyển KanbanTask -> Task dùng cho TaskDetailModal.
 *
 * Lưu ý:
 * - KanbanTask.priority là number.
 * - Không được đổi KanbanTask.priority thành string
 *   vì Kanban đang dùng priority dạng number.
 */
export const toTaskModal = (task: KanbanTask): Task => ({
  id: task.id,
  content: task.title,
  description: task.description || '',
 priority:
  task.priority === 'High'
    ? 'Cao'
    : task.priority === 'Medium'
      ? 'Trung bình'
      : 'Thấp',
  assignee:
    task.assignees?.[0]?.fullName ||
    (task.assignees?.[0] as any)?.name ||
    (task as any)?.assigneeName ||
    (typeof (task as any)?.assignee === 'string' ? (task as any).assignee : null) ||
    'Chưa phân công',

  dueDate: task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('vi-VN')
    : 'Chưa có hạn',

  comments: task.commentCount || 0,
  attachments: task.attachmentCount || 0,

  labels:
    task.labels?.map((label) => ({
      text: label.name,
      color: 'primary',
    })) || [],
})

/**
 * Filter task trên Kanban.
 */
// export const matchesTaskFilter = (
//   task: KanbanTask,
//   search: string,
//   priority: string,
// ) => {
//   const matchesSearch =
//     !search ||
//     `${task.title} ${task.description || ''}`
//       .toLowerCase()
//       .includes(search.toLowerCase())

//   /**
//    * priority của KanbanTask là number.
//    * Filter từ select là string.
//    */
//   const matchesPriority =
//     !priority || task.priority === Number(priority)

//   return matchesSearch && matchesPriority
// }
export const matchesTaskFilter = (
  task: KanbanTask,
  search: string,
  priority: string,
) => {
  const matchesSearch =
    !search ||
    `${task.title} ${task.description || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())

  const priorityMap: Record<string, string> = {
    '1': 'Low',
    '2': 'Medium',
    '3': 'High',
  }

  const matchesPriority =
    !priority || task.priority === priorityMap[priority]

  return matchesSearch && matchesPriority
}

export const useKanban = () => {
  const { projectId } = useParams<{
    projectId: string
  }>()

  // =========================================================
  // PROJECT
  // =========================================================

  const [project, setProject] =
    useState<ProjectDetail | null>(null)

  // =========================================================
  // BOARDS
  // =========================================================

  const [boards, setBoards] =
    useState<KanbanBoardSummary[]>([])

  const [board, setBoard] =
    useState<KanbanBoardSummary | null>(null)

  // =========================================================
  // LOADING / ERROR
  // =========================================================

  const [loading, setLoading] = useState(true)

  const [boardLoading, setBoardLoading] =
    useState(false)

  const [error, setError] = useState('')

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState('')

  const [priority, setPriority] = useState('')

  // =========================================================
  // TASK DETAIL
  // =========================================================

  const [selectedTask, setSelectedTask] =
    useState<KanbanTask | null>(null)

  const [modalVisible, setModalVisible] =
    useState(false)

  // =========================================================
  // CREATE BOARD
  // =========================================================

  const [createBoardVisible, setCreateBoardVisible] =
    useState(false)

  // =========================================================
  // CREATE TASK
  // =========================================================

  const [createTaskVisible, setCreateTaskVisible] =
    useState(false)

  const [targetColumnId, setTargetColumnId] =
    useState('')

  // =========================================================
  // LOAD BOARD
  // =========================================================

  /**
   * Load toàn bộ dữ liệu của một board thật:
   *
   * 1. GET board detail
   * 2. GET board tasks
   * 3. Gắn task vào column theo columnId
   */
  const loadBoard = useCallback(
    async (
      boardId: string,
      currentProjectId = projectId,
    ) => {
      if (!currentProjectId || !boardId) {
        return
      }

      try {
        setBoardLoading(true)
        setError('')

        const [detail, tasks] =
          await Promise.all([
            projectService.getBoard(
              currentProjectId,
              boardId,
            ),

            projectService.getBoardTasks(
              boardId,
              currentProjectId,
            ),
          ])

        const columns = (
          detail.columns || []
        ).map((column) => ({
          ...column,

          tasks: tasks.filter(
            (task) =>
              task.columnId === column.id,
          ),
        }))

        setBoard({
          ...detail,
          columns,
        } as KanbanBoardSummary)
      } catch (err: any) {
        console.error(
          'Load Kanban board error:',
          err,
        )

        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Không thể tải dữ liệu Kanban của dự án.',
        )

        setBoard(null)
      } finally {
        setBoardLoading(false)
      }
    },
    [projectId],
  )

  // =========================================================
  // LOAD PROJECT + BOARDS
  // =========================================================

  useEffect(() => {
    if (!projectId) {
      return
    }

    const load = async () => {
      try {
        setLoading(true)
        setError('')

        /**
         * Chỉ load project + danh sách board trước.
         */
        const [
          projectResult,
          boardsResult,
        ] = await Promise.all([
          projectService.getProjectById(projectId),
          projectService.getBoards(projectId),
        ])

        setProject(projectResult)
        setBoards(boardsResult)

        /**
         * Mặc định chọn board đầu tiên.
         */
        const defaultBoard =
          boardsResult[0]

        if (defaultBoard) {
          await loadBoard(
            defaultBoard.id,
            projectId,
          )
        } else {
          setBoard(null)
        }
      } catch (err: any) {
        console.error(
          'Load Kanban error:',
          err,
        )

        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Không thể tải dữ liệu Kanban.',
        )

        setBoard(null)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [projectId, loadBoard])

  // =========================================================
  // DRAG & DROP
  // =========================================================

  /**
   * Backend là source of truth.
   *
   * Sau khi move thành công:
   * -> reload board
   * -> tránh FE lệch database.
   */
  const onDragEnd = async (
    result: DropResult,
  ) => {
    if (!board || !result.destination) {
      return
    }

    const sourceColumnId =
      result.source.droppableId

    const destinationColumnId =
      result.destination.droppableId

    const sourceColumn =
      board.columns?.find(
        (column) =>
          column.id === sourceColumnId,
      )

    const destinationColumn =
      board.columns?.find(
        (column) =>
          column.id === destinationColumnId,
      )

    if (
      !sourceColumn ||
      !destinationColumn
    ) {
      return
    }

    const task =
      sourceColumn.tasks?.find(
        (item) =>
          item.id === result.draggableId,
      )

    if (!task) {
      return
    }

    /**
     * Không có thay đổi vị trí.
     */
    if (
      sourceColumnId ===
        destinationColumnId &&
      result.destination.index ===
        result.source.index
    ) {
      return
    }

    try {
      await projectService.moveTask(
        task.id,
        {
          taskId: task.id,
          columnId: destinationColumnId,
          position:
            result.destination.index,
        },
      )

      toast.success(
        'Đã cập nhật vị trí công việc',
      )

      await loadBoard(
        board.id,
        projectId,
      )
    } catch (err: any) {
      console.error(
        'Move task error:',
        err,
      )

      toast.error(
        err?.response?.data?.message ||
          'Không thể cập nhật vị trí công việc.',
      )
    }
  }

  // =========================================================
  // CREATE BOARD
  // =========================================================

  /**
   * Create Board - API thật.
   */
  const createBoard = async (
    name: string,
    description: string,
  ) => {
    if (!projectId) {
      throw new Error(
        'Không xác định được dự án.',
      )
    }

    if (!name.trim()) {
      throw new Error(
        'Vui lòng nhập tên board.',
      )
    }

    try {
      const createdBoard =
        await projectService.createBoard(
          projectId,
          {
            name: name.trim(),
            description:
              description.trim() ||
              undefined,
          },
        )

      /**
       * Append board mới vào danh sách.
       */
      setBoards((previous) => [
        ...previous,
        createdBoard,
      ])

      setCreateBoardVisible(false)

      /**
       * Board vừa tạo là board thật từ DB.
       */
      await loadBoard(
        createdBoard.id,
        projectId,
      )

      toast.success(
        `Đã tạo board "${createdBoard.name}"`,
      )
    } catch (err: any) {
      console.error(
        'Create board error:',
        err,
      )

      throw new Error(
        err?.response?.data?.message ||
          err?.message ||
          'Không thể tạo board.',
      )
    }
  }

  // =========================================================
  // CREATE TASK
  // =========================================================

  /**
   * Create Task - API thật.
   *
   * QUAN TRỌNG:
   *
   * Không gửi reporterId từ frontend.
   *
   * Backend tự lấy:
   *     reporterId = ICurrentUser.UserId
   *                  = JWT claim "sub"
   *
   * Không gửi:
   * - reporterId
   * - status
   * - position
   * - progress
   * - createdAt
   *
   * Các field trên do backend/domain xử lý.
   */
  const createTask = async (params: {
    projectId: string
    boardId: string
    columnId: string

    title: string
    description: string

    taskType: number
    priority: number

    startDate?: string | null
    dueDate?: string | null

    storyPoint: number
    estimateHour: number

    assigneeIds: string[]
    labelIds: string[]
  }) => {
    // -------------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------------

    if (!projectId) {
      throw new Error(
        'Không xác định được dự án.',
      )
    }

    if (!board) {
      throw new Error(
        'Không xác định được Kanban board.',
      )
    }

    if (
      params.projectId !== projectId
    ) {
      throw new Error(
        'Project không hợp lệ.',
      )
    }

    if (
      params.boardId !== board.id
    ) {
      throw new Error(
        'Board không hợp lệ.',
      )
    }

    if (!params.columnId) {
      throw new Error(
        'Vui lòng chọn cột Kanban.',
      )
    }

    if (!params.title.trim()) {
      throw new Error(
        'Vui lòng nhập tiêu đề công việc.',
      )
    }

    // -------------------------------------------------------
    // NUMBER VALIDATION
    // -------------------------------------------------------

    if (params.storyPoint < 0) {
      throw new Error(
        'Story Point không được nhỏ hơn 0.',
      )
    }

    if (params.estimateHour < 0) {
      throw new Error(
        'Số giờ ước tính không được nhỏ hơn 0.',
      )
    }

    // -------------------------------------------------------
    // DATE VALIDATION
    // -------------------------------------------------------

    if (
      params.startDate &&
      params.dueDate
    ) {
      const start =
        new Date(params.startDate)

      const due =
        new Date(params.dueDate)

      if (due < start) {
        throw new Error(
          'Ngày kết thúc không được trước ngày bắt đầu.',
        )
      }
    }

    // -------------------------------------------------------
    // CREATE TASK
    // -------------------------------------------------------

    try {
      await projectService.createTask({
        projectId: params.projectId,

        boardId: params.boardId,

        columnId: params.columnId,

        title: params.title.trim(),

        description:
          params.description?.trim() ||
          '',

        taskType: params.taskType,

        priority: params.priority,

        startDate:
          params.startDate || null,

        dueDate:
          params.dueDate || null,

        storyPoint:
          params.storyPoint,

        estimateHour:
          params.estimateHour,

        assigneeIds:
          params.assigneeIds || [],

        labelIds:
          params.labelIds || [],
      })

      // -----------------------------------------------------
      // API SUCCESS
      // -----------------------------------------------------

      /**
       * Không tự append task giả vào FE.
       *
       * Backend/database là source of truth.
       * Reload lại board sau khi create thành công.
       */
      await loadBoard(
        board.id,
        projectId,
      )

      setCreateTaskVisible(false)

      setTargetColumnId('')

      const columnName =
        board.columns?.find(
          (column) =>
            column.id ===
            params.columnId,
        )?.name || 'Kanban'

      toast.success(
        `Đã tạo công việc vào "${columnName}"`,
      )
    } catch (err: any) {
      console.error(
        'Create task error:',
        err,
      )

      throw new Error(
        err?.response?.data?.message ||
          err?.message ||
          'Không thể tạo công việc.',
      )
    }
  }

  // =========================================================
  // TASK DETAIL
  // =========================================================

  const openTaskModal = (
    task: KanbanTask,
  ) => {
    setSelectedTask(task)
    setModalVisible(true)
  }

  const closeTaskModal = () => {
    setModalVisible(false)
    setSelectedTask(null)
  }

  // =========================================================
  // UPDATE TASK
  // =========================================================

  /**
   * Hiện tại chưa có endpoint update task
   * trong contract backend được cung cấp.
   *
   * Không mock dữ liệu.
   */
  const updateTask = async (
    updated: KanbanTask,
  ) => {
    if (!board) {
      return
    }

    console.warn(
      'updateTask chưa được nối API backend:',
      updated.id,
    )
  }

const deleteTask = async (taskId: string) => {
  if (!board) {
    return
  }

  try {
    await taskService.deleteTask(taskId)

    setBoard((prevBoard) => {
      if (!prevBoard) return prevBoard

      return {
        ...prevBoard,
        columns: prevBoard.columns.map((column) => ({
          ...column,
          tasks: column.tasks.filter(
            (task) => task.id !== taskId,
          ),
        })),
      }
    })
  } catch (error) {
    const message =
      (error as any)?.response?.data?.message ||
      (error as any)?.response?.data?.error?.description ||
      (error as any)?.message ||
      'Không thể xóa công việc.'
    toast.error(message)
  }
}

  // =========================================================
  // OPEN CREATE TASK MODAL
  // =========================================================

  const openCreateTaskModal = (
    columnId?: string,
  ) => {
    if (!board) {
      toast.error(
        'Dự án chưa có Kanban board.',
      )

      return
    }

    const selectedColumnId =
      columnId ||
      board.columns?.[0]?.id ||
      ''

    if (!selectedColumnId) {
      toast.error(
        'Board chưa có cột Kanban.',
      )

      return
    }

    setTargetColumnId(
      selectedColumnId,
    )

    setCreateTaskVisible(true)
  }

  // =========================================================
  // CLOSE CREATE TASK MODAL
  // =========================================================

  const closeCreateTaskModal = () => {
    setCreateTaskVisible(false)
    setTargetColumnId('')
  }

  // =========================================================
  // RETURN
  // =========================================================

  return {
    projectId,

    project,

    boards,

    board,

    loading,

    boardLoading,

    error,

    // Filters
    search,
    priority,
    setSearch,
    setPriority,

    // Task detail
    selectedTask,
    modalVisible,

    openTaskModal,
    closeTaskModal,

    updateTask,
    deleteTask,

    // Create board
    createBoardVisible,
    setCreateBoardVisible,

    // Create task
    createTaskVisible,
    targetColumnId,

    openCreateTaskModal,
    closeCreateTaskModal,

    // Board
    loadBoard,
    onDragEnd,

    // Actions
    createBoard,
    createTask,
  }
}