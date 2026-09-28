import axiosClient from "src/api/axiosClient"
import { TaskAttachmentResponse, UploadAttachmentRequest } from "src/types/TaskDetailType/attachment"
import { unwrapArray } from "./utils/unwrapApiResponse"


const BASE_URL = '/api/v1'

export const attachmentService = {
  async getTaskAttachments(
  taskId: string,
): Promise<TaskAttachmentResponse[]> {
  const response = await axiosClient.get(
    `${BASE_URL}/tasks/${taskId}/attachments`,
  )

  return unwrapArray<TaskAttachmentResponse>(
    response.data,
  )
},

  async uploadAttachment(
    taskId: string,
    payload: UploadAttachmentRequest,
  ): Promise<TaskAttachmentResponse> {
    const formData = new FormData()
    formData.append('file', payload.file)

    const response = await axiosClient.post<TaskAttachmentResponse>(
      `${BASE_URL}/tasks/${taskId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    return response.data
  },

  async deleteAttachment(id: string): Promise<unknown> {
    const response = await axiosClient.delete<unknown>(`${BASE_URL}/attachments/${id}`)
    return response.data
  },
}

export default attachmentService
