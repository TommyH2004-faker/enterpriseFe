import { useCallback, useEffect, useState } from 'react'
import { activityService } from 'src/services/activityService'
import { attachmentService } from 'src/services/attachmentService'
import { checklistService } from 'src/services/checklistService'
import { commentService } from 'src/services/commentService'
import { labelService } from 'src/services/labelService'
import { taskService } from 'src/services/taskService'
import { TaskActivityResponse } from 'src/types/TaskDetailType/activity'
import { TaskAttachmentResponse } from 'src/types/TaskDetailType/attachment'
import { ChecklistResponse } from 'src/types/TaskDetailType/checklist'
import { TaskCommentResponse } from 'src/types/TaskDetailType/comment'
import { ProjectLabelResponse, TaskLabelResponse } from 'src/types/TaskDetailType/label'
import { TaskDetailResponse } from 'src/types/TaskDetailType/task'


interface UseTaskDetailOptions {
  taskId: string | null
  projectId: string | null
  initialAssigneeIds?: string[]
  onChanged?: () => void | Promise<void>
}

export interface TaskDetailState {
  task: TaskDetailResponse | null
  checklists: ChecklistResponse[]
  comments: TaskCommentResponse[]
  attachments: TaskAttachmentResponse[]
  projectLabels: ProjectLabelResponse[]
  taskLabels: TaskLabelResponse[]
  activities: TaskActivityResponse[]
  assigneeIds: string[]
}

const EMPTY_STATE: TaskDetailState = {
  task: null,
  checklists: [],
  comments: [],
  attachments: [],
  projectLabels: [],
  taskLabels: [],
  activities: [],
  assigneeIds: [],
}

export function useTaskDetail({
  taskId,
  projectId,
  initialAssigneeIds,
  onChanged,
}: UseTaskDetailOptions) {
  const [state, setState] = useState<TaskDetailState>({
    ...EMPTY_STATE,
    assigneeIds: initialAssigneeIds ?? [],
  })
  const [assigneeInitialized, setAssigneeInitialized] = useState(initialAssigneeIds !== undefined)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const notifyChanged = useCallback(async () => {
    await onChanged?.()
  }, [onChanged])

  const loadCoreData = useCallback(async () => {
    if (!taskId) return

    setLoading(true)
    setError(null)

    try {
      const [task, checklists, comments, attachments, taskLabels, activities, projectLabels] =
        await Promise.all([
          taskService.getTaskDetail(taskId),
          checklistService.getTaskChecklists(taskId),
          commentService.getTaskComments(taskId),
          attachmentService.getTaskAttachments(taskId),
          labelService.getTaskLabels(taskId),
          activityService.getTaskActivities(taskId),
          projectId ? labelService.getProjectLabels(projectId) : Promise.resolve([]),
        ])

      setState((current) => ({
        ...current,
        task,
        checklists,
        comments,
        attachments,
        projectLabels,
        taskLabels,
        activities,
      }))
    } catch (err) {
      console.error('Failed to load task detail:', err)
      setError('Không thể tải đầy đủ dữ liệu chi tiết công việc.')
    } finally {
      setLoading(false)
    }
  }, [projectId, taskId])

  useEffect(() => {
    setState({
      ...EMPTY_STATE,
      assigneeIds: initialAssigneeIds ?? [],
    })
    setAssigneeInitialized(initialAssigneeIds !== undefined)

    if (taskId) {
      void loadCoreData()
    }
  }, [initialAssigneeIds, loadCoreData, taskId])

  const runAction = useCallback(async (action: () => Promise<void>) => {
    setActionLoading(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      console.error('Task detail action failed:', err)
      setError('Thao tác không thành công. Vui lòng thử lại.')
      throw err
    } finally {
      setActionLoading(false)
    }
  }, [])

  const updateTask = useCallback(
    async (payload: Parameters<typeof taskService.updateTask>[1]) => {
      if (!taskId) return
      await runAction(async () => {
        await taskService.updateTask(taskId, payload)
        await loadCoreData()
        await notifyChanged()
      })
    },
    [loadCoreData, notifyChanged, runAction, taskId],
  )

  const updateAssignees = useCallback(async () => {
    if (!taskId) return
    await runAction(async () => {
      await taskService.updateTaskAssignees(taskId, { employeeIds: state.assigneeIds })
      setAssigneeInitialized(true)
      await notifyChanged()
    })
  }, [notifyChanged, runAction, state.assigneeIds, taskId])

  const moveTask = useCallback(
    async (columnId: string, position: number) => {
      if (!taskId) return
      await runAction(async () => {
        await taskService.moveTask(taskId, { columnId, position })
        await loadCoreData()
        await notifyChanged()
      })
    },
    [loadCoreData, notifyChanged, runAction, taskId],
  )

  const createChecklist = useCallback(
    async (title: string) => {
      if (!taskId) return
      await runAction(async () => {
        await checklistService.createChecklist(taskId, { title })
        const checklists = await checklistService.getTaskChecklists(taskId)
        setState((current) => ({ ...current, checklists }))
        await notifyChanged()
      })
    },
    [notifyChanged, runAction, taskId],
  )

  const updateChecklist = useCallback(
    async (id: string, title: string) => {
      await runAction(async () => {
        await checklistService.updateChecklist(id, { title })
        if (taskId) {
          const checklists = await checklistService.getTaskChecklists(taskId)
          setState((current) => ({ ...current, checklists }))
        }
      })
    },
    [runAction, taskId],
  )

  const deleteChecklist = useCallback(
    async (id: string) => {
      await runAction(async () => {
        await checklistService.deleteChecklist(id)
        if (taskId) {
          const checklists = await checklistService.getTaskChecklists(taskId)
          setState((current) => ({ ...current, checklists }))
        }
      })
    },
    [runAction, taskId],
  )

  const completeChecklist = useCallback(
    async (id: string, completed: boolean) => {
      await runAction(async () => {
        if (completed) await checklistService.completeChecklist(id)
        else await checklistService.reopenChecklist(id)
        if (taskId) {
          const checklists = await checklistService.getTaskChecklists(taskId)
          setState((current) => ({ ...current, checklists }))
        }
      })
    },
    [runAction, taskId],
  )

  const createChecklistItem = useCallback(
    async (checklistId: string, content: string, orderIndex: number) => {
      await runAction(async () => {
        await checklistService.createChecklistItem(checklistId, { content, orderIndex })
        if (taskId) {
          const checklists = await checklistService.getTaskChecklists(taskId)
          setState((current) => ({ ...current, checklists }))
        }
      })
    },
    [runAction, taskId],
  )

  const updateChecklistItem = useCallback(
    async (id: string, content: string) => {
      await runAction(async () => {
        await checklistService.updateChecklistItem(id, { content })
        if (taskId) {
          const checklists = await checklistService.getTaskChecklists(taskId)
          setState((current) => ({ ...current, checklists }))
        }
      })
    },
    [runAction, taskId],
  )

  const deleteChecklistItem = useCallback(
    async (id: string) => {
      await runAction(async () => {
        await checklistService.deleteChecklistItem(id)
        if (taskId) {
          const checklists = await checklistService.getTaskChecklists(taskId)
          setState((current) => ({ ...current, checklists }))
        }
      })
    },
    [runAction, taskId],
  )

  const completeChecklistItem = useCallback(
    async (id: string, completed: boolean) => {
      await runAction(async () => {
        if (completed) await checklistService.completeChecklistItem(id)
        else await checklistService.reopenChecklistItem(id)
        if (taskId) {
          const checklists = await checklistService.getTaskChecklists(taskId)
          setState((current) => ({ ...current, checklists }))
        }
      })
    },
    [runAction, taskId],
  )

  const changeChecklistItemOrder = useCallback(
    async (id: string, orderIndex: number) => {
      await runAction(async () => {
        await checklistService.changeChecklistItemOrder(id, { orderIndex })
        if (taskId) {
          const checklists = await checklistService.getTaskChecklists(taskId)
          setState((current) => ({ ...current, checklists }))
        }
      })
    },
    [runAction, taskId],
  )

  const createComment = useCallback(
    async (content: string) => {
      if (!taskId) return
      await runAction(async () => {
        await commentService.createComment(taskId, { content })
        const comments = await commentService.getTaskComments(taskId)
        setState((current) => ({ ...current, comments }))
      })
    },
    [runAction, taskId],
  )

  const updateComment = useCallback(
    async (id: string, content: string) => {
      await runAction(async () => {
        await commentService.updateComment(id, { content })
        if (taskId) {
          const comments = await commentService.getTaskComments(taskId)
          setState((current) => ({ ...current, comments }))
        }
      })
    },
    [runAction, taskId],
  )

  const deleteComment = useCallback(
    async (id: string) => {
      await runAction(async () => {
        await commentService.deleteComment(id)
        if (taskId) {
          const comments = await commentService.getTaskComments(taskId)
          setState((current) => ({ ...current, comments }))
        }
      })
    },
    [runAction, taskId],
  )

  const uploadAttachment = useCallback(
    async (file: File) => {
      if (!taskId) return
      await runAction(async () => {
        await attachmentService.uploadAttachment(taskId, { file })
        const attachments = await attachmentService.getTaskAttachments(taskId)
        setState((current) => ({ ...current, attachments }))
      })
    },
    [runAction, taskId],
  )

  const deleteAttachment = useCallback(
    async (id: string) => {
      await runAction(async () => {
        await attachmentService.deleteAttachment(id)
        if (taskId) {
          const attachments = await attachmentService.getTaskAttachments(taskId)
          setState((current) => ({ ...current, attachments }))
        }
      })
    },
    [runAction, taskId],
  )

  const createProjectLabel = useCallback(
    async (name: string, color: string, description?: string) => {
      if (!projectId) return
      await runAction(async () => {
        await labelService.createLabel(projectId, { name, color, description })
        const projectLabels = await labelService.getProjectLabels(projectId)
        setState((current) => ({ ...current, projectLabels }))
      })
    },
    [projectId, runAction],
  )

  const updateLabel = useCallback(
    async (id: string, name: string, color: string, description?: string) => {
      await runAction(async () => {
        await labelService.updateLabel(id, { name, color, description })
        if (projectId) {
          const projectLabels = await labelService.getProjectLabels(projectId)
          setState((current) => ({ ...current, projectLabels }))
        }
        if (taskId) {
          const taskLabels = await labelService.getTaskLabels(taskId)
          setState((current) => ({ ...current, taskLabels }))
        }
      })
    },
    [projectId, runAction, taskId],
  )

  const deleteLabel = useCallback(
    async (id: string) => {
      await runAction(async () => {
        await labelService.deleteLabel(id)
        if (projectId) {
          const projectLabels = await labelService.getProjectLabels(projectId)
          setState((current) => ({ ...current, projectLabels }))
        }
      })
    },
    [projectId, runAction],
  )

  const assignTaskLabel = useCallback(
    async (labelId: string) => {
      if (!taskId) return
      await runAction(async () => {
        await labelService.assignTaskLabel(taskId, { labelId })
        const taskLabels = await labelService.getTaskLabels(taskId)
        setState((current) => ({ ...current, taskLabels }))
      })
    },
    [runAction, taskId],
  )

  const removeTaskLabel = useCallback(
    async (labelId: string) => {
      if (!taskId) return
      await runAction(async () => {
        await labelService.removeTaskLabel(taskId, labelId)
        const taskLabels = await labelService.getTaskLabels(taskId)
        setState((current) => ({ ...current, taskLabels }))
      })
    },
    [runAction, taskId],
  )

  const updateAssigneeSelection = useCallback((employeeIds: string[]) => {
    setState((current) => ({ ...current, assigneeIds: employeeIds }))
    setAssigneeInitialized(true)
  }, [])

  const refresh = useCallback(async () => {
    await loadCoreData()
  }, [loadCoreData])

  return {
    ...state,
    assigneeInitialized,
    loading,
    actionLoading,
    error,
    refresh,
    updateTask,
    updateAssignees,
    updateAssigneeSelection,
    moveTask,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    completeChecklist,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    completeChecklistItem,
    changeChecklistItemOrder,
    createComment,
    updateComment,
    deleteComment,
    uploadAttachment,
    deleteAttachment,
    createProjectLabel,
    updateLabel,
    deleteLabel,
    assignTaskLabel,
    removeTaskLabel,
  }
}
