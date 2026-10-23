
export interface UserProfile {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatarUrl: string | null
  phoneNumber: string | null
  gender: number | null
  dateOfBirth: string | null
}

export interface EmployeeProfile {
  userId: string
  employeeCode: string
  fullName: string
  email: string
  departmentId: string | null
  departmentName: string | null
  positionId: string | null
  positionName: string | null
  joinedDate: string | null
  isActive: boolean
}

export interface MyProfile {
  user: UserProfile
  employee: EmployeeProfile | null
}

export interface UpdateMyProfileRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  gender: number
  dateOfBirth: string | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
