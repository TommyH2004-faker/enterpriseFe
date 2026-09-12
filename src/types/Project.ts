export type ProjectStatus = 'Planning' | 'Active' | 'OnHold' | 'Completed' | 'Cancelled' | 'Archived' | string
export type ProjectPriority = 0 | 1 | 2 | 3 | 'Low' | 'Medium' | 'High' | 'Critical' | string

export interface ApiEnvelope<T> {
  isSuccess?: boolean
  statusCode?: number
  message?: string
  data: T
  errors?: Array<string | { code?: string; description?: string }>
}

export interface ProjectSummary {
  id: string
  code: string
  name: string
  description?: string | null
  status: ProjectStatus
  priority?: ProjectPriority
  departmentId?: string | null
  departmentName?: string | null
  managerId?: string | null
  managerName?: string | null
  startDate?: string | null
  endDate?: string | null
  progress?: number
  memberCount?: number
  taskCount?: number
  createdAt?: string
  updatedAt?: string | null
  isActive?: boolean
}

export interface ProjectListData {
  items: ProjectSummary[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
}

export interface ProjectDetail extends ProjectSummary {
  department?: {
    id: string
    name: string
    code?: string
  } | null
  manager?: {
    id: string
    fullName: string
    email?: string
  } | null
  members?: ProjectMember[]
  boards?: KanbanBoardSummary[]
  milestones?: Array<{
    id?: string
    title?: string
    name?: string
    dueDate?: string | null
    isCompleted?: boolean
    [key: string]: unknown
  }>
}

export interface ProjectProgress {
  projectId?: string
  projectName?: string
  overallProgress?: number
  progress?: number
  totalTasks?: number
  totalTaskCount?: number
  completedTasks?: number
  completedTaskCount?: number
  inProgressTasks?: number
  todoTasks?: number
  totalMilestones?: number
  completedMilestones?: number
  milestoneBreakdown?: Array<{
    id?: string
    title?: string
    name?: string
    completed?: boolean
    [key: string]: unknown
  }>
  overdueTaskCount?: number
}

export interface ProjectStatistics {
  projectId?: string
  projectName?: string
  status?: string
  startDate?: string | null
  endDate?: string | null
  createdDate?: string | null
  totalTasks?: number
  taskCount?: number
  completedTasks?: number
  completedTaskCount?: number
  totalMembers?: number
  memberCount?: number
  activeMembers?: number
  activeMemberCount?: number
  totalMilestones?: number
  milestoneCount?: number
  completedMilestones?: number
  totalKanbanBoards?: number
}

export interface ProjectMember {
  userId: string
  fullName: string
  email?: string
  role?: string
  joinedAt?: string
}

export interface CreateProjectRequest {
  code: string
  name: string
  description?: string
  departmentId: string
  managerId: string
  startDate?: string | null
  endDate?: string | null
  priority: ProjectPriority
}

export interface ProjectFilters {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  departmentId?: string
  managerId?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

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

export interface KanbanColumn {
  id: string
  boardId: string
  name: string
  color?: string | null
  position: number
  wipLimit?: number | null
  tasks?: KanbanTask[]
}

export interface TaskChecklistItem {
  id: string
  title: string
  isCompleted: boolean
}

export interface TaskComment {
  id: string
  authorName: string
  avatarUrl?: string
  content: string
  createdAt: string
}

export interface TaskAttachment {
  id: string
  fileName: string
  fileSize: string
  fileType: string
  uploadedAt: string
  url?: string
}

export interface TaskActivityLog {
  id: string
  userName: string
  action: string
  timestamp: string
}

export interface KanbanTask {
  id: string
  projectId?: string
  boardId?: string
  columnId: string
  title: string
  description?: string | null
  type?: string
  priority?: string
  status?: string
  startDate?: string | null
  dueDate?: string | null
  assignees?: Array<{ id: string; fullName: string; avatarUrl?: string | null }>
  labels?: Array<{ id: string; name: string; color?: string | null }>
  commentCount?: number
  attachmentCount?: number
  position?: number
  checklists?: TaskChecklistItem[]
  comments?: TaskComment[]
  attachments?: TaskAttachment[]
  activityLogs?: TaskActivityLog[]
}

export interface KanbanBoardDetail extends KanbanBoardSummary {
  columns: KanbanColumn[]
}

export interface MoveTaskRequest {
  columnId: string
  position: number
}
