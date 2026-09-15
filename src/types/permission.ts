
export interface Permission {
  id: string
  code: string
  module: string
  action: string
  displayName: string
  description: string
}

export interface PermissionForm {
  id: string
  code: string
  module: string
  action: string
  displayName: string
  description: string

}
export interface PermissionQueryParams {
  pageNumber?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDescending?: boolean
}
export interface PermissionListResponse {
  items: Permission[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
export interface CreatePermissionRequest {
  code: string
  module: string
  action: string
  displayName: string
  description: string
}
export interface UpdatePermissionRequest {
  id: string
  code: string
  module: string
  action: string
  displayName: string
  description: string
}