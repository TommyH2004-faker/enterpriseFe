import { Permission } from "./permission"

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  status: number
  roles: UserRole[]
}
export interface UserListResponse {
  items: User[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
export interface UserQueryParams {
  pageNumber?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDescending?: boolean
}
export interface UserRole {
  id: string
  code: string
  displayName: string
  description: string
}


export interface UserRolePermission {
  roleId: string
  roleCode: string
  roleDisplayName: string
  roleDescription: string
  permissions: Permission[]
}

export interface UserPermissionsResponse {
  userId: string
  username: string
  email: string
  fullName: string
  status: number
  roles: UserRolePermission[]
}