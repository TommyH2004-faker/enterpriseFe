import React, { useEffect, useState } from 'react'
import { CSpinner } from '@coreui/react'
import ToastAlert from 'src/components/ToastAlert'
import { useNavigate, useParams } from 'react-router-dom'

import taskService from 'src/services/taskService'
import { projectService, type ProjectMemberResponse } from 'src/services/projectService'
import type { TaskDetailResponse } from 'src/types/task'
import type { TaskAssigneeOption } from '../TaskDetail/components/TaskAssigneesSection'
import TaskDetailModal from '../TaskDetail/components/TaskDetailModal'

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<TaskDetailResponse | null>(null)
  const [columns, setColumns] = useState<Array<{ id: string; name: string }>>([])
  const [members, setMembers] = useState<TaskAssigneeOption[]>([])
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!taskId) return

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const taskData = await taskService.getTaskDetail(taskId)
        const [board, projectMembers, allTasks] = await Promise.all([
          projectService.getBoard(taskData.projectId, taskData.boardId),
          projectService.getProjectMembers(taskData.projectId),
          taskService.getAllTasks({
            page: 1,
            pageSize: 100,
            projectId: taskData.projectId,
          }),
        ])

        const globalTask = allTasks.items.find((item) => item.id === taskData.id)
        const globalAssigneeIds = globalTask?.assignees?.map((assignee) => assignee.id) ?? []

        setTask(taskData)
        setAssigneeIds(Array.from(new Set(
          globalAssigneeIds.length > 0
            ? globalAssigneeIds
            : (taskData.assigneeIds ?? []),
        )))
        setColumns((board.columns ?? []).map((column) => ({
          id: column.id,
          name: column.name,
        })))
        setMembers(projectMembers.map((member: ProjectMemberResponse) => ({
          id: member.id || member.employeeId || '',
            name: member.name || (member as any).fullName || 'Thành viên',
            email: member.email || '',
          })).filter((member) => member.id))
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết công việc.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [taskId])

  if (loading) {
    return <div className="text-center py-5"><CSpinner /></div>
  }

  if (error || !task) {
    return <ToastAlert message={error || 'Không tìm thấy công việc.'} />
  }

  return (
    <TaskDetailModal
      visible
      taskId={task.id}
      projectId={task.projectId}
      columns={columns}
      members={members}
      initialAssigneeIds={assigneeIds}
      onClose={() => navigate(-1)}
      onChanged={() => undefined}
    />
  )
}

export default TaskDetailPage
