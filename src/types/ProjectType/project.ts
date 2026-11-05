// src/types/project.ts

import { ProjectMember, ProjectMilestone } from "./project-member"

export type ProjectStatus =
  | 'Planning'
  | 'Active'
  | 'OnHold'
  | 'Completed'
  | 'Cancelled'

export type ProjectPriority = 1 | 2 | 3 | 4

export type ProjectPriorityLabel =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical'

export interface ApiError {
  code?: string
  description?: string
  message?: string
}

export interface ApiEnvelope<T> {
  isSuccess?: boolean
  statusCode?: number
  message?: string
  data: T
  errors?: Array<string | ApiError>
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
  allowedActions?: string[]
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
    code?: string
    name: string
  } | null

  manager?: {
    id: string
    fullName: string
    email?: string
  } | null
  memebers?: ProjectMember[]
  milestones?: ProjectMilestone[]
}

export interface CreateProjectRequest {
  code: string
  name: string
  description?: string

  departmentId: string
  managerId: string
  memberIds: string[]
  startDate?: string | null
  endDate?: string | null
  priority: ProjectPriority
}

export interface UpdateProjectRequest {
  name: string
  description?: string

  startDate?: string | null
  endDate?: string | null

  priority: ProjectPriority
}

export interface ChangeDepartmentRequest {
  departmentId: string
}

export interface ChangeManagerRequest {
  managerId: string
}

export interface ProjectFilters {
  page?: number
  pageSize?: number

  search?: string

  status?: ProjectStatus | ''

  departmentId?: string

  managerId?: string

  sortBy?: string

  sortDirection?: 'asc' | 'desc'
}
export interface ProjectFilter {
  page?: number
  pageSize?: number

  search?: string

  status?: ProjectStatus | ''

  departmentId?: string

  managerId?: string

  sortBy?: string

  sortDirection?: 'asc' | 'desc'
}
export interface ProjectOption {
  id: string
  name: string
  code?: string
}