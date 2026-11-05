import { DateTimeString, Guid } from "../task"

export interface TaskCommentResponse {
  id: Guid
  taskId: Guid
  employeeId: Guid
  employeeName: string
  content: string
  parentCommentId?: Guid | null
  createdAt: DateTimeString
  updatedAt: DateTimeString | null
  isEdited: boolean
}

export interface CreateCommentRequest {
  content: string
  parentCommentId?: Guid | null
}

export interface UpdateCommentRequest {
  content: string
}

/** POST /tasks/{taskId}/comments documents a Guid response. */
export type CreateCommentResponse = Guid
