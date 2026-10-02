import { useCallback, useEffect, useState } from 'react'
import { activityService } from 'src/services/activityService'
import { attachmentService } from 'src/services/attachmentService'
import { checklistService } from 'src/services/checklistService'
import { commentService } from 'src/services/commentService'
import { employeeService } from 'src/services/employeeService'
import { labelService } from 'src/services/labelService'
import { projectService, ProjectMemberResponse } from 'src/services/projectService'
import { taskService } from 'src/services/taskService'
import { TaskActivityResponse } from 'src/types/TaskDetailType/activity'
import { TaskAttachmentResponse } from 'src/types/TaskDetailType/attachment'
import { ChecklistResponse } from 'src/types/TaskDetailType/checklist'
import { TaskCommentResponse } from 'src/types/TaskDetailType/comment'
import { ProjectLabelResponse, TaskLabelResponse } from 'src/types/TaskDetailType/label'
import { TaskDetailResponse } from 'src/types/task'


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
  projectMembers: ProjectMemberResponse[]
  activities: TaskActivityResponse[]
  assigneeIds: string[]
  labelIds: string[]
}

const EMPTY_STATE: TaskDetailState = {
  task: null,
  checklists: [],
  comments: [],
  attachments: [],
  projectLabels: [],
  taskLabels: [],
  projectMembers: [],
  activities: [],
  assigneeIds: [],
  labelIds: [],
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

  const resolveTaskLabels = (
    fetchedLabels: TaskLabelResponse[],
    currentTask: TaskDetailResponse,
    pLabels: ProjectLabelResponse[],
  ): TaskLabelResponse[] => {
    if (fetchedLabels && fetchedLabels.length > 0) {
      return fetchedLabels
    }
    const ids = currentTask.labelIds || []
    return ids.map((lid) => {
      const pl = pLabels.find((p) => p.id.toLowerCase() === lid.toLowerCase())
      return {
        id: lid,
        taskId: currentTask.id,
        labelId: lid,
        name: pl?.name || 'Label',
        color: pl?.color || '#0d6efd',
        description: pl?.description || '',
        assignedAt: new Date().toISOString(),
      }
    })
  }

  const loadCoreData = useCallback(async () => {
    if (!taskId) return

    setLoading(true)
    setError(null)

    try {
      const [task, checklists, comments, attachments, rawTaskLabels, activities, projectLabels, projectMembers, allEmployees] =
        await Promise.all([
          taskService.getTaskDetail(taskId),
          checklistService.getTaskChecklists(taskId).catch(() => []),
          commentService.getTaskComments(taskId).catch(() => []),
          attachmentService.getTaskAttachments(taskId).catch(() => []),
          labelService.getTaskLabels(taskId).catch(() => []),
          activityService.getTaskActivities(taskId).catch(() => []),
          projectId ? labelService.getProjectLabels(projectId).catch(() => []) : Promise.resolve([]),
          projectId ? projectService.getProjectMembers(projectId).catch(() => []) : Promise.resolve([]),
          employeeService.getEmployees().catch(() => []),
        ])

      const taskLabels = resolveTaskLabels(rawTaskLabels, task, projectLabels)
      
        const rawAssignees =
          (task as any)?.assignees ||
          (task as any)?.data?.assignees ||
          []

        const taskAssigneeIds: string[] = Array.isArray(rawAssignees)
          ? rawAssignees
              .map((assignee: any) => assignee?.id)
              .filter((id: any): id is string => typeof id === 'string' && id.length > 0)
          : []

      // Merge all member info
      const combinedMembersList: ProjectMemberResponse[] = [...(projectMembers || [])]
      const existingIds = new Set(combinedMembersList.map((m) => m.id.toLowerCase()))

      ;(allEmployees || []).forEach((emp: any) => {
        const empId = emp.id || emp.userId
        if (empId && !existingIds.has(empId.toLowerCase())) {
          existingIds.add(empId.toLowerCase())
          combinedMembersList.push({
            id: empId,
            name: emp.fullName || emp.name,
            email: emp.email || '',
            role: emp.positionName || '',
            department: emp.departmentName || '',
          })
        }
      })

      setState((current) => ({
        ...current,
        task,
        checklists,
        comments,
        attachments,
        projectLabels,
        taskLabels,
        projectMembers: combinedMembersList,
        activities,
        assigneeIds: taskAssigneeIds.length > 0 ? taskAssigneeIds : current.assigneeIds,
        labelIds: task.labelIds ?? (task as any)?.data?.labelIds ?? [],
      }))
      setAssigneeInitialized(true)
    } catch (err) {
      console.error('Failed to load task detail:', err)
      setError('Không thể tải đầy đủ dữ liệu chi tiết công việc.')
    } finally {
      setLoading(false)
    }
  }, [projectId, taskId])

  useEffect(() => {
    if (taskId) {
      if (initialAssigneeIds && initialAssigneeIds.length > 0) {
        setState((curr) => ({ ...curr, assigneeIds: initialAssigneeIds }))
      }
      void loadCoreData()
    } else {
      setState(EMPTY_STATE)
      setAssigneeInitialized(false)
    }
  }, [taskId, projectId])

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
      const validGuids = Array.from(new Set(
        (state.assigneeIds || []).filter((id) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
        ),
      ))
      await taskService.updateTaskAssignees(taskId, {
        employeeIds: validGuids,
      })
      setAssigneeInitialized(true)
      await loadCoreData()
      await notifyChanged()
    })
  }, [loadCoreData, notifyChanged, runAction, state.assigneeIds, taskId])
 

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
        const [rawTaskLabels, task] = await Promise.all([
          labelService.getTaskLabels(taskId).catch(() => []),
          taskService.getTaskDetail(taskId),
        ])
        const resolved = resolveTaskLabels(rawTaskLabels, task, state.projectLabels)
        setState((current) => ({
          ...current,
          task,
          taskLabels: resolved,
          labelIds: task.labelIds ?? [],
        }))
        await notifyChanged()
      })
    },
    [notifyChanged, runAction, state.projectLabels, taskId],
  )

  const removeTaskLabel = useCallback(
    async (labelId: string) => {
      if (!taskId) return
      await runAction(async () => {
        await labelService.removeTaskLabel(taskId, labelId)
        const [rawTaskLabels, task] = await Promise.all([
          labelService.getTaskLabels(taskId).catch(() => []),
          taskService.getTaskDetail(taskId),
        ])
        const resolved = resolveTaskLabels(rawTaskLabels, task, state.projectLabels)
        setState((current) => ({
          ...current,
          task,
          taskLabels: resolved,
          labelIds: task.labelIds ?? [],
        }))
        await notifyChanged()
      })
    },
    [notifyChanged, runAction, state.projectLabels, taskId],
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
