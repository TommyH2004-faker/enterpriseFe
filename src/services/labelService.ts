import { ApiResponse } from "src/api/authApi"
import axiosClient from "src/api/axiosClient"
import { AssignTaskLabelRequest, CreateProjectLabelRequest, ProjectLabelResponse, TaskLabelResponse, UpdateLabelRequest } from "src/types/TaskDetailType/label"

const BASE_URL = '/api/v1'

export const labelService = {
  async getProjectLabels(projectId: string): Promise<ProjectLabelResponse[]> {
    const response = await axiosClient.get<ApiResponse<ProjectLabelResponse[]>>(
      `${BASE_URL}/projects/${projectId}/labels`,
    )
    return response.data.data ?? []
  },

  async createLabel(
    projectId: string,
    payload: CreateProjectLabelRequest,
  ): Promise<unknown> {
    const response = await axiosClient.post<unknown>(
      `${BASE_URL}/projects/${projectId}/labels`,
      payload,
    )
    return response.data
  },

  async updateLabel(id: string, payload: UpdateLabelRequest): Promise<unknown> {
    const response = await axiosClient.put<unknown>(`${BASE_URL}/labels/${id}`, payload)
    return response.data
  },

  async deleteLabel(id: string): Promise<unknown> {
    const response = await axiosClient.delete<unknown>(`${BASE_URL}/labels/${id}`)
    return response.data
  },

  async getTaskLabels(taskId: string): Promise<TaskLabelResponse[]> {
    const response = await axiosClient.get<ApiResponse<TaskLabelResponse[]>>(
      `${BASE_URL}/tasks/${taskId}/labels`,
    )
    return response.data.data ?? []
  },

  async assignTaskLabel(
    taskId: string,
    payload: AssignTaskLabelRequest,
  ): Promise<unknown> {
    const response = await axiosClient.post<unknown>(
      `${BASE_URL}/tasks/${taskId}/labels`,
      payload,
    )
    return response.data
  },

  async removeTaskLabel(taskId: string, labelId: string): Promise<unknown> {
    const response = await axiosClient.delete<unknown>(
      `${BASE_URL}/tasks/${taskId}/labels/${labelId}`,
    )
    return response.data
  },
}

export default labelService
