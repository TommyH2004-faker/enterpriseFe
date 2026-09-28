/** Task Detail API contract types. */

export type Guid = string
export type DateTimeString = string

export interface TaskDetailResponse {
  id: Guid
  projectId: Guid
  boardId: Guid
  columnId: Guid
  parentTaskId: Guid | null
  milestoneId: Guid | null
  title: string
  description: string
  taskType: number
  priority: number
  status: number
  reporterId: Guid
  position: number
  progress: number
  storyPoint: number
  estimateHour: number
  startDate: DateTimeString | null
  dueDate: DateTimeString | null
  completedDate: DateTimeString | null
  isArchived: boolean
  createdAt: DateTimeString
}

export interface UpdateTaskRequest {
  title: string
  description?: string
  priority: number
  startDate?: DateTimeString | null
  dueDate?: DateTimeString | null
}

/**
 * The contract only documents the response as "Result".
 * No response payload fields are specified, so this remains unknown
 * instead of inventing fields that are not present in the API contract.
 */
export type UpdateTaskResponse = unknown

export interface UpdateTaskAssigneesRequest {
  employeeIds: Guid[]
}

export interface MoveTaskRequest {
  columnId: Guid
  position: number
}
