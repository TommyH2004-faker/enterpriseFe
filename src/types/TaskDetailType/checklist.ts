import type { DateTimeString, Guid } from './task'

export interface ChecklistItemResponse {
  id: Guid
  checklistId: Guid
  content: string
  orderIndex: number
  isCompleted: boolean
  completedAt: DateTimeString | null
}

export interface ChecklistResponse {
  id: Guid
  taskId: Guid
  title: string
  isCompleted: boolean
  items: ChecklistItemResponse[]
}

export interface CreateChecklistRequest {
  title: string
}

export interface UpdateChecklistRequest {
  title: string
}

export interface CreateChecklistItemRequest {
  content: string
  orderIndex: number
}

export interface UpdateChecklistItemRequest {
  content: string
}

export interface ChangeChecklistItemOrderRequest {
  orderIndex: number
}
