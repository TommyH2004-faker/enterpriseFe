import axiosClient from "src/api/axiosClient"
import { CreateCommentRequest, CreateCommentResponse, TaskCommentResponse, UpdateCommentRequest } from "src/types/TaskDetailType/comment"
import { unwrapArray } from "./utils/unwrapApiResponse"

const BASE_URL = '/api/v1'

export const commentService = {
  async getTaskComments(
  taskId: string,
): Promise<TaskCommentResponse[]> {
  const response = await axiosClient.get(
    `${BASE_URL}/tasks/${taskId}/comments`,
  )

  return unwrapArray<TaskCommentResponse>(
    response.data,
  )
},

  async createComment(
    taskId: string,
    payload: CreateCommentRequest,
  ): Promise<CreateCommentResponse> {
    const response = await axiosClient.post<CreateCommentResponse>(
      `${BASE_URL}/tasks/${taskId}/comments`,
      payload,
    )
    return response.data
  },

  async updateComment(id: string, payload: UpdateCommentRequest): Promise<unknown> {
    const response = await axiosClient.put<unknown>(`${BASE_URL}/comments/${id}`, payload)
    return response.data
  },

  async deleteComment(id: string): Promise<unknown> {
    const response = await axiosClient.delete<unknown>(`${BASE_URL}/comments/${id}`)
    return response.data
  },
}

export default commentService
