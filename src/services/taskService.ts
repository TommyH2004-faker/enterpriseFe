import { ApiResponse } from "src/api/authApi"
import axiosClient from "src/api/axiosClient"
import {
  MoveTaskRequest,
  TaskDetailResponse,
  UpdateTaskAssigneesRequest,
  UpdateTaskRequest,
  UpdateTaskResponse,
  AllTasksData,
  CreateTaskRequest,
  TaskListItem,
} from "src/types/task"

const BASE_URL = '/api/v1'

export const taskService = {
  async getAllTasks(params: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    projectId?: string
    assigneeId?: string
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  } = {}): Promise<AllTasksData> {
    const response = await axiosClient.get<{ data: AllTasksData }>(
      `${BASE_URL}/getalltasks`,
      { params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 12,
        search: params.search || undefined,
        status: params.status || undefined,
        projectId: params.projectId || undefined,
        assigneeId: params.assigneeId || undefined,
        sortBy: params.sortBy ?? 'CreatedAt',
        sortDirection: params.sortDirection ?? 'desc',
      } },
    )

    return response.data.data
  },

  async createTask(request: CreateTaskRequest): Promise<TaskListItem> {
    const response = await axiosClient.post<{ data: TaskListItem }>(
      `${BASE_URL}/projects/${request.projectId}/tasks`,
      {
        boardId: request.boardId,
        columnId: request.columnId,
        title: request.title,
        description: request.description,
        taskType: request.taskType,
        priority: request.priority,
        startDate: request.startDate ?? null,
        dueDate: request.dueDate ?? null,
        storyPoint: request.storyPoint,
        estimateHour: request.estimateHour,
        assigneeIds: request.assigneeIds,
        labelIds: request.labelIds,
      },
    )

    return response.data.data
  },

  async getTaskDetail(taskId: string): Promise<TaskDetailResponse> {
    const response = await axiosClient.get<ApiResponse<TaskDetailResponse>>(
      `${BASE_URL}/tasks/${taskId}`
    )

    const resData: any = response.data

    return (resData?.data ?? resData) as TaskDetailResponse
  },

  async updateTask(
    taskId: string,
    payload: UpdateTaskRequest
  ): Promise<UpdateTaskResponse> {
    const response = await axiosClient.put<UpdateTaskResponse>(
      `${BASE_URL}/tasks/${taskId}`,
      payload,
    )

    return response.data
  },

  async updateTaskAssignees(
  taskId: string,
  payload: UpdateTaskAssigneesRequest,
): Promise<unknown> {
  const body = {
    employeeIds: payload.employeeIds,
  }

  const response = await axiosClient.put<unknown>(
    `${BASE_URL}/tasks/${taskId}/assignees`,
    body,
  )

  return response.data
},

  async moveTask(
    taskId: string,
    payload: MoveTaskRequest,
  ): Promise<unknown> {
    const response = await axiosClient.put<unknown>(
      `${BASE_URL}/tasks/${taskId}/move`,
      payload
    )

    return response.data
  },
  async deleteTask(taskId: string): Promise<void> {
    await axiosClient.delete<void>(`${BASE_URL}/tasks/${taskId}`)
  },
  async getTaskByProjectId(projectId: string): Promise<TaskDetailResponse[]> {
    const response = await axiosClient.get<ApiResponse<TaskDetailResponse[]>>(
      `${BASE_URL}/projects/${projectId}/tasks`
    )
    return response.data.data
  }
}

export default taskService