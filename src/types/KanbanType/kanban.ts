// src/types/KanbanType/kanban.ts

export interface KanbanBoardSummary {
  id: string
  projectId: string
  name: string
  description?: string | null
  isDefault?: boolean
  columnCount?: number
  taskCount?: number
  columns?: KanbanColumn[]
}

export interface CreateBoardRequest {
  name: string
  description?: string
}

export interface KanbanBoardDetail extends KanbanBoardSummary {
  columns: KanbanColumn[]
}

export interface KanbanColumn {
  id: string
  boardId: string
  name: string
  color?: string | null
  position: number
  wipLimit?: number | null
  tasks?: KanbanTask[]
}

export interface KanbanTask {
  id: string
  boardId: string
  columnId: string
  title: string
  description: string
  reporterId?: string | null
  reporterName?: string | null
  priority: 'Low' | 'Medium' | 'High'
  position: number
  assignees: KanbanUser[]
  dueDate?: string
  startDate?: string
  labels: KanbanLabel[]
  commentCount: number
  attachmentCount: number
}
export interface ProjectTask {
  id: string
  projectId: string
  boardId: string
  columnId: string

  title: string
  description: string

  taskType: string
  priority: string
  status: string

  position: number
  progress: number
  storyPoint: number
  estimateHour: number

  startDate?: string | null
  dueDate?: string | null

  isArchived: boolean
  createdAt: string
}
export interface KanbanUser {
  id: string
  fullName: string
}

export interface KanbanLabel {
  id: string
  name: string
  color: string
}

export interface MoveTaskRequest {
  taskId: string
  columnId: string
  position: number
}