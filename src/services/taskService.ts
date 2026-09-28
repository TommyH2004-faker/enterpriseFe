import { ApiResponse } from "src/api/authApi"
import axiosClient from "src/api/axiosClient"
import { MoveTaskRequest, TaskDetailResponse, UpdateTaskAssigneesRequest, UpdateTaskRequest, UpdateTaskResponse } from "src/types/TaskDetailType/task"

const BASE_URL = '/api/v1'

export const taskService = {
  async getTaskDetail(taskId: string): Promise<TaskDetailResponse> {
    const response = await axiosClient.get<ApiResponse<TaskDetailResponse>>(`${BASE_URL}/tasks/${taskId}`)
    return response.data.data
  },

  async updateTask(taskId: string, payload: UpdateTaskRequest): Promise<UpdateTaskResponse> {
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
    const response = await axiosClient.put<unknown>(
      `${BASE_URL}/tasks/${taskId}/assignees`,
      payload,
    )
    return response.data
  },

  async moveTask(taskId: string, payload: MoveTaskRequest): Promise<unknown> {
    const response = await axiosClient.put<unknown>(`${BASE_URL}/tasks/${taskId}/move`, payload)
    return response.data
  },
}

export default taskService
