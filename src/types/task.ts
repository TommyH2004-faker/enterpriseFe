// src/types/kanban.ts

import { KanbanColumn } from "./KanbanType/kanban"

export interface KanbanBoardSummary {
  id: string
  projectId: string

  name: string
  description?: string | null

  isDefault?: boolean

  columnCount?: number
  taskCount?: number
}

export interface CreateBoardRequest {
  name: string
  description?: string
}

export interface KanbanBoardDetail extends KanbanBoardSummary {
  columns: KanbanColumn[]
}

export interface KanbanTask {
  id: string;
  title: string;
  description?: string | null;
  priority: string | null;
  position?: number | null;
  boardId: string | null;
  columnId: string | null;
  assigneeIds?: number[] | null;
  startDate?: string | null;
  dueDate?: string | null;
  taskLabels?: KanbanLabel[] | null;
  commentCount?: number | null;
  attachmentCount?: number | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// src/types/kanban.ts

export interface KanbanLabel {
  id: string;
  name: string;
  color: string | null;
}

export interface KanbanUser {
  id: string;
  fullName: string;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface KanbanComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: KanbanUser;
}

export interface KanbanAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  uploadedAt: string;
  uploadedBy?: KanbanUser;
}
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
  assigneeIds: Guid[]
  labelIds: Guid[]

}

export interface UpdateTaskRequest {
  title: string
  description?: string
  priority: number
  startDate?: DateTimeString | null
  dueDate?: DateTimeString | null
}

export interface TaskListAssignee {
  id: Guid
  fullName: string
  username?: string
}

export interface TaskListLabel {
  id: Guid
  name: string
}

export interface TaskListItem {
  id: Guid
  projectId: Guid
  boardId: Guid
  columnId: Guid
  title: string
  description?: string | null
  taskType: string | number
  priority: string | number
  status: string
  position: number
  progress: number
  storyPoint: number
  estimateHour: number
  startDate?: DateTimeString | null
  dueDate?: DateTimeString | null
  reporterId?: Guid
  reporterName?: string
  isArchived: boolean
  createdAt: DateTimeString
  assignees: TaskListAssignee[]
  labels: TaskListLabel[]
  commentCount: number
  attachmentCount: number
}

export interface AllTasksData {
  items: TaskListItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface CreateTaskRequest {
  projectId: Guid
  boardId: Guid
  columnId: Guid
  title: string
  description?: string
  taskType: number
  priority: number
  startDate?: DateTimeString | null
  dueDate?: DateTimeString | null
  storyPoint: number
  estimateHour: number
  assigneeIds: Guid[]
  labelIds: Guid[]
}


export type UpdateTaskResponse = unknown

export interface UpdateTaskAssigneesRequest {
  employeeIds: Guid[]
}

export interface MoveTaskRequest {
  columnId: Guid
  position: number
}
