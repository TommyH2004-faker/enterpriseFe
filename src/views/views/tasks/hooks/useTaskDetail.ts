import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import taskService from 'src/services/taskService'
import checklistService from 'src/services/checklistService'
import commentService from 'src/services/commentService'
import attachmentService from 'src/services/attachmentService'
import activityService from 'src/services/activityService'

import type {
  TaskDetailResponse,
  MoveTaskRequest,
  UpdateTaskAssigneesRequest,
  UpdateTaskRequest,
} from 'src/types/taskDetail'
import type { Checklist } from 'src/types/checklist'
import type { TaskComment } from 'src/types/comment'
import type { TaskAttachment } from 'src/types/attachment'
import type { TaskActivityLog } from 'src/types/activity'

/** Backward-compatible names used by the Task Detail components. */
export type TaskDetailModel = TaskDetailResponse
export type TaskUpdatePayload = UpdateTaskRequest
export type TaskChecklist = Checklist
export type TaskActivity = TaskActivityLog

export interface UseTaskDetailResult {
  task: TaskDetailModel | null
  checklists: TaskChecklist[]
  comments: TaskComment[]
  attachments: TaskAttachment[]
  activities: TaskActivity[]
  loading: boolean
  saving: boolean
  error: string | null
  reload: () => Promise<void>
  updateTask: (payload: TaskUpdatePayload) => Promise<boolean>
  updateAssignees: (employeeIds: string[]) => Promise<boolean>
  moveTask: (columnId: string, position: number) => Promise<boolean>
  createComment: (content: string) => Promise<boolean>
  deleteComment: (commentId: string) => Promise<boolean>
  uploadAttachment: (file: File) => Promise<boolean>
  deleteAttachment: (attachmentId: string) => Promise<boolean>
  completeChecklist: (checklistId: string, completed: boolean) => Promise<boolean>
}

const getErrorMessage = (error: unknown): string => {
  const axiosError = error as {
    response?: { data?: { message?: string } }
    message?: string
  }

  return (
    axiosError?.response?.data?.message ||
    axiosError?.message ||
    'Đã xảy ra lỗi. Vui lòng thử lại.'
  )
}

export const useTaskDetail = (
  taskId?: string,
  visible = true,
): UseTaskDetailResult => {
  const [task, setTask] = useState<TaskDetailModel | null>(null)
  const [checklists, setChecklists] = useState<TaskChecklist[]>([])
  const [comments, setComments] = useState<TaskComment[]>([])
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [activities, setActivities] = useState<TaskActivity[]>([])

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clear = useCallback(() => {
    setTask(null)
    setChecklists([])
    setComments([])
    setAttachments([])
    setActivities([])
    setError(null)
  }, [])

  const load = useCallback(async () => {
    if (!taskId || !visible) {
      if (!visible) clear()
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [taskDetail, taskChecklists, taskComments, taskAttachments, taskActivities] =
        await Promise.all([
          taskService.getById(taskId),
          checklistService.getByTask(taskId),
          commentService.getByTask(taskId),
          attachmentService.getByTask(taskId),
          activityService.getByTask(taskId),
        ])

      setTask(taskDetail)
      setChecklists(taskChecklists ?? [])
      setComments(taskComments ?? [])
      setAttachments(taskAttachments ?? [])
      setActivities(taskActivities ?? [])
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      console.error('Không thể tải chi tiết công việc:', err)
    } finally {
      setLoading(false)
    }
  }, [clear, taskId, visible])

  useEffect(() => {
    void load()
  }, [load])

  const updateTask = useCallback(
    async (payload: TaskUpdatePayload): Promise<boolean> => {
      if (!taskId) return false

      setSaving(true)
      try {
        await taskService.update(taskId, payload)
        await load()
        toast.success('Đã cập nhật công việc')
        return true
      } catch (err) {
        toast.error(getErrorMessage(err))
        console.error('Không thể cập nhật công việc:', err)
        return false
      } finally {
        setSaving(false)
      }
    },
    [load, taskId],
  )

  const updateAssignees = useCallback(
    async (employeeIds: string[]): Promise<boolean> => {
      if (!taskId) return false

      setSaving(true)
      try {
        const request: UpdateTaskAssigneesRequest = { employeeIds }
        await taskService.updateAssignees(taskId, request)
        await load()
        toast.success('Đã cập nhật người thực hiện')
        return true
      } catch (err) {
        toast.error(getErrorMessage(err))
        console.error('Không thể cập nhật người thực hiện:', err)
        return false
      } finally {
        setSaving(false)
      }
    },
    [load, taskId],
  )

  const moveTask = useCallback(
    async (columnId: string, position: number): Promise<boolean> => {
      if (!taskId) return false

      setSaving(true)
      try {
        const request: MoveTaskRequest = { columnId, position }
        await taskService.move(taskId, request)
        await load()
        toast.success('Đã chuyển công việc')
        return true
      } catch (err) {
        toast.error(getErrorMessage(err))
        console.error('Không thể di chuyển công việc:', err)
        return false
      } finally {
        setSaving(false)
      }
    },
    [load, taskId],
  )

  const createComment = useCallback(
    async (content: string): Promise<boolean> => {
      if (!taskId || !content.trim()) return false

      setSaving(true)
      try {
        await commentService.create(taskId, { content: content.trim() })
        setComments(await commentService.getByTask(taskId))
        toast.success('Đã thêm bình luận')
        return true
      } catch (err) {
        toast.error(getErrorMessage(err))
        console.error('Không thể thêm bình luận:', err)
        return false
      } finally {
        setSaving(false)
      }
    },
    [taskId],
  )

  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      if (!taskId || !commentId) return false

      setSaving(true)
      try {
        await commentService.delete(commentId)
        setComments(await commentService.getByTask(taskId))
        toast.success('Đã xóa bình luận')
        return true
      } catch (err) {
        toast.error(getErrorMessage(err))
        console.error('Không thể xóa bình luận:', err)
        return false
      } finally {
        setSaving(false)
      }
    },
    [taskId],
  )

  const uploadAttachment = useCallback(
    async (file: File): Promise<boolean> => {
      if (!taskId || !file) return false

      setSaving(true)
      try {
        await attachmentService.upload(taskId, file)
        setAttachments(await attachmentService.getByTask(taskId))
        toast.success('Tải tệp lên thành công')
        return true
      } catch (err) {
        toast.error(getErrorMessage(err))
        console.error('Không thể tải tệp lên:', err)
        return false
      } finally {
        setSaving(false)
      }
    },
    [taskId],
  )

  const deleteAttachment = useCallback(
    async (attachmentId: string): Promise<boolean> => {
      if (!taskId || !attachmentId) return false

      setSaving(true)
      try {
        await attachmentService.delete(attachmentId)
        setAttachments(await attachmentService.getByTask(taskId))
        toast.success('Đã xóa tệp đính kèm')
        return true
      } catch (err) {
        toast.error(getErrorMessage(err))
        console.error('Không thể xóa tệp đính kèm:', err)
        return false
      } finally {
        setSaving(false)
      }
    },
    [taskId],
  )

  const completeChecklist = useCallback(
    async (checklistId: string, completed: boolean): Promise<boolean> => {
      if (!taskId || !checklistId) return false

      setSaving(true)
      try {
        if (completed) {
          await checklistService.complete(checklistId)
        } else {
          await checklistService.reopen(checklistId)
        }

        setChecklists(await checklistService.getByTask(taskId))
        return true
      } catch (err) {
        toast.error(getErrorMessage(err))
        console.error('Không thể cập nhật checklist:', err)
        return false
      } finally {
        setSaving(false)
      }
    },
    [taskId],
  )

  return {
    task,
    checklists,
    comments,
    attachments,
    activities,
    loading,
    saving,
    error,
    reload: load,
    updateTask,
    updateAssignees,
    moveTask,
    createComment,
    deleteComment,
    uploadAttachment,
    deleteAttachment,
    completeChecklist,
  }
}

export default useTaskDetail
