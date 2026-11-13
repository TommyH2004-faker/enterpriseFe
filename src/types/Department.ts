export interface DepartmentResponse {
  id: string
  code: string
  name: string
  isActive: boolean
  description: string
  managerUserId: string | null
  createdAt: string
  updatedAt: string | null
}

export enum DepartmentMemberRole {
  Head = 1,
  DeputyHead = 2,
  Member = 3,
}

export interface DepartmentMemberResponse {
  id: string
  departmentId: string
  userId: string
  employeeCode: string
  fullName: string
  email: string
  avatarUrl?: string
  role: DepartmentMemberRole
  roleName: string
  positionName?: string
  joinedDate: string
  leftDate?: string
  isActive: boolean
}

export interface AddDepartmentMemberRequest {
  userId: string
  role: DepartmentMemberRole
}

export interface UpdateDepartmentMemberRoleRequest {
  role: DepartmentMemberRole
}

export interface PaginationData {
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface ApiResponse<T> {
  message: string
  data: T
}

export interface PaginatedResponse {
  items: DepartmentResponse[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface CreateDepartmentRequest {
  code: string
  name: string
  description?: string
  isActive: boolean | null
}

export interface UpdateDepartmentRequest {
  code: string
  name: string
  description?: string
  isActive: boolean
}
