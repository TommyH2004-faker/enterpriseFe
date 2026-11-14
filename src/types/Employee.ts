export interface CreateEmployeeRequest {
  employeeCode: string
  fullName: string
  email: string
  departmentId: string
  positionId: string
  joinedDate: string | null
}

export interface UpdateEmployeeRequest extends CreateEmployeeRequest {
  isActive: boolean
}

export interface EmployeeActionResponse {
  message?: string
  data?: unknown
}

export interface EmployeeResponse {
  id: string
  userId: string
  employeeCode: string
  fullName: string
  email: string
  departmentId: string
  departmentName: string
  positionId: string
  positionName: string
  positionLevelName: string
  joinedDate: string
  isActive: boolean
  createdDate: string
}

export interface PositionResponse {
  id: string
  code: string
  name: string
  description: string
  level: number
  levelName: string
  isActive: boolean
  employeeCount: number
  createdDate: string
}

export interface CreateEmployeeResponse {
  employeeId: string
  userId: string
  employeeCode: string
  username: string
  linkedExistingAccount?: boolean
}

export interface PendingAccountResponse {
  userId: string
  username: string
  email: string
  fullName: string
  isEmailVerified: boolean
  status: string
  createdAt: string
}

export interface EmployeeApiResponse<T> {
  isSuccess?: boolean
  message?: string
  data: T
}

export interface EmployeeFilters {
  search?: string
  departmentId?: string
  positionId?: string
  includeInactive?: boolean
}
