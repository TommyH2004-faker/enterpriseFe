// src/types/kanban.ts

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

export interface KanbanColumn {
  id: string
  boardId: string

  name: string

  color?: string | null

  position: number

  wipLimit?: number | null
}