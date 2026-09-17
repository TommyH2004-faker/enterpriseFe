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

