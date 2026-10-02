import type { DateTimeString, Guid } from './task'

export interface TaskAttachmentResponse {
  id: Guid
  taskId: Guid
  fileName: string
  originalFileName: string
  fileUrl: string
  contentType: string
  fileSize: number
  uploadedBy: Guid
  uploadedAt: DateTimeString
}

export interface UploadAttachmentRequest {
  file: File
}

export interface AttachmentListData {
  items: TaskAttachmentResponse[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
