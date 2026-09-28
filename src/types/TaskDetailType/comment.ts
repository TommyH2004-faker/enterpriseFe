import type { DateTimeString, Guid } from './task'

export interface TaskCommentResponse {
  id: Guid
  taskId: Guid
  employeeId: Guid
  content: string
  createdAt: DateTimeString
  updatedAt: DateTimeString | null
  isEdited: boolean
}

export interface CreateCommentRequest {
  content: string
}

export interface UpdateCommentRequest {
  content: string
}

/** POST /tasks/{taskId}/comments documents a Guid response. */
export type CreateCommentResponse = Guid
