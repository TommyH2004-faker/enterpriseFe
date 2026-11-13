import { DateTimeString, Guid } from "../task"

export interface ProjectLabelResponse {
  id: Guid
  projectId: Guid
  name: string
  color: string
  description: string
}

export interface CreateProjectLabelRequest {
  name: string
  color: string
  description?: string
}

export interface UpdateLabelRequest {
  name: string
  color: string
  description?: string
}

export interface TaskLabelResponse {
  id: Guid
  taskId: Guid
  labelId: Guid
  name: string
  color: string
  description: string
  assignedAt: DateTimeString
}

export interface AssignTaskLabelRequest {
  labelId: Guid
}
