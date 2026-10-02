import { ApiResponse } from "src/api/authApi"
import axiosClient from "src/api/axiosClient"
import { AttachmentListData, TaskAttachmentResponse, UploadAttachmentRequest } from "src/types/TaskDetailType/attachment"

const BASE_URL = '/api/v1'

export const attachmentService = {
  async getAttachmentContent(taskId: string, fileId: string): Promise<Blob> {
    const response = await axiosClient.get<Blob>(
      `${BASE_URL}/tasks/${taskId}/attachments/${fileId}/content`,
      { responseType: 'blob' },
    )

    return response.data
  },

  async getAllAttachments(params: {
    page?: number
    pageSize?: number
    keyword?: string
    contentType?: string
    sortBy?: 'UploadedAt' | 'OriginalFileName' | 'FileSize'
    sortDirection?: 'asc' | 'desc'
  } = {}): Promise<AttachmentListData> {
    const response = await axiosClient.get<ApiResponse<AttachmentListData>>(
      `${BASE_URL}/attachments`,
      {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          keyword: params.keyword || undefined,
          contentType: params.contentType || undefined,
          sortBy: params.sortBy ?? 'UploadedAt',
          sortDirection: params.sortDirection ?? 'desc',
        },
      },
    )

    return response.data.data ?? {
      items: [],
      pageNumber: 1,
      pageSize: params.pageSize ?? 20,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    }
  },

  async getTaskAttachments(
    taskId: string,
  ): Promise<TaskAttachmentResponse[]> {
    const response = await axiosClient.get<ApiResponse<TaskAttachmentResponse[]>>(
      `${BASE_URL}/tasks/${taskId}/attachments`,
    )
    return response.data.data ?? []
  },

  async uploadAttachment(
    taskId: string,
    payload: UploadAttachmentRequest,
  ): Promise<TaskAttachmentResponse> {
    const formData = new FormData()
    formData.append('file', payload.file)

    const response = await axiosClient.post<ApiResponse<TaskAttachmentResponse>>(
      `${BASE_URL}/tasks/${taskId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    return response.data.data as TaskAttachmentResponse
  },

  async deleteAttachment(id: string): Promise<unknown> {
    const response = await axiosClient.delete<unknown>(`${BASE_URL}/attachments/${id}`)
    return response.data
  },
}

export default attachmentService
