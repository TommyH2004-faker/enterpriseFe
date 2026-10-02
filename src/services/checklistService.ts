import { ApiResponse } from "src/api/authApi"
import axiosClient from "src/api/axiosClient"
import { ChangeChecklistItemOrderRequest, ChecklistItemResponse, ChecklistResponse, CreateChecklistItemRequest, CreateChecklistRequest, UpdateChecklistItemRequest, UpdateChecklistRequest } from "src/types/TaskDetailType/checklist"

const BASE_URL = '/api/v1'

export const checklistService = {
  async getTaskChecklists(
    taskId: string,
  ): Promise<ChecklistResponse[]> {
    const response = await axiosClient.get<ApiResponse<ChecklistResponse[]>>(
      `${BASE_URL}/tasks/${taskId}/checklists`,
    )
    return response.data.data ?? []
  },

  async getChecklist(id: string): Promise<ChecklistResponse> {
    const response = await axiosClient.get<ApiResponse<ChecklistResponse>>(`${BASE_URL}/checklists/${id}`)
    return response.data.data
  },

  async createChecklist(taskId: string, payload: CreateChecklistRequest): Promise<unknown> {
    const response = await axiosClient.post<unknown>(
      `${BASE_URL}/tasks/${taskId}/checklists`,
      payload,
    )
    return response.data
  },

  async updateChecklist(id: string, payload: UpdateChecklistRequest): Promise<unknown> {
    const response = await axiosClient.put<unknown>(`${BASE_URL}/checklists/${id}`, payload)
    return response.data
  },

  async deleteChecklist(id: string): Promise<unknown> {
    const response = await axiosClient.delete<unknown>(`${BASE_URL}/checklists/${id}`)
    return response.data
  },

  async completeChecklist(id: string): Promise<unknown> {
    const response = await axiosClient.put<unknown>(`${BASE_URL}/checklists/${id}/complete`)
    return response.data
  },

  async reopenChecklist(id: string): Promise<unknown> {
    const response = await axiosClient.put<unknown>(`${BASE_URL}/checklists/${id}/reopen`)
    return response.data
  },

  async getChecklistItems(checklistId: string): Promise<ChecklistItemResponse[]> {
    const response = await axiosClient.get<ApiResponse<ChecklistItemResponse[]>>(
      `${BASE_URL}/checklists/${checklistId}/items`,
    )
    return response.data.data ?? []
  },

  async getChecklistItem(id: string): Promise<ChecklistItemResponse> {
    const response = await axiosClient.get<ApiResponse<ChecklistItemResponse>>(
      `${BASE_URL}/checklist-items/${id}`,
    )
    return response.data.data
  },

  async createChecklistItem(
    checklistId: string,
    payload: CreateChecklistItemRequest,
  ): Promise<unknown> {
    const response = await axiosClient.post<unknown>(
      `${BASE_URL}/checklists/${checklistId}/items`,
      payload,
    )
    return response.data
  },

  async updateChecklistItem(
    id: string,
    payload: UpdateChecklistItemRequest,
  ): Promise<unknown> {
    const response = await axiosClient.put<unknown>(`${BASE_URL}/checklist-items/${id}`, payload)
    return response.data
  },

  async deleteChecklistItem(id: string): Promise<unknown> {
    const response = await axiosClient.delete<unknown>(`${BASE_URL}/checklist-items/${id}`)
    return response.data
  },

  async completeChecklistItem(id: string): Promise<ChecklistItemResponse> {
    const response = await axiosClient.put<ApiResponse<ChecklistItemResponse>>(
      `${BASE_URL}/checklist-items/${id}/complete`,
    )
    return response.data.data
  },

  async reopenChecklistItem(id: string): Promise<ChecklistItemResponse> {
    const response = await axiosClient.put<ApiResponse<ChecklistItemResponse>>(
      `${BASE_URL}/checklist-items/${id}/reopen`,
    )
    return response.data.data
  },

  async changeChecklistItemOrder(
    id: string,
    payload: ChangeChecklistItemOrderRequest,
  ): Promise<unknown> {
    const response = await axiosClient.put<unknown>(
      `${BASE_URL}/checklist-items/${id}/order`,
      payload,
    )
    return response.data
  },
}

export default checklistService
