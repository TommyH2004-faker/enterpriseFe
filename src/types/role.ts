
export interface Role {
  id: string
  code: string
  displayName: string
  description: string
  createdAt?: string
  updatedAt?: string
}

export interface RoleListResponse {
  items: Role[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface CreateRoleRequest {
  code: string
  name: string
  description: string
}

export interface UpdateRoleRequest {
  id: string
  code: string
  displayName: string
  description: string
}

export interface RoleQueryParams {
  pageNumber?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDescending?: boolean
}
