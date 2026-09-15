import axiosClient from 'src/api/axiosClient'

import type { Role } from 'src/types/role'
import type {  User, UserListResponse, UserQueryParams } from 'src/types/user'

interface ApiResponse<T> {
  isSuccess: boolean
  statusCode: number
  message: string
  traceId: string
  data: T
  errors: unknown[]
}

const userService = {
  async getAll(params?: UserQueryParams): Promise<UserListResponse> {
    const response = await axiosClient.get<ApiResponse<UserListResponse>>(
      'api/v1/users',
      {
        params: {
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 10,
          search: params?.search || undefined,
          sortBy: params?.sortBy || 'Username',
          sortDescending: params?.sortDescending ?? false,
        },
      },
    )

    return response.data.data
  },


  async getById(id: string): Promise<User> {
    const response = await axiosClient.get<ApiResponse<User>>(`api/users/${id}/permissions`)
    return response.data.data
  },

  async getRoles(userId: string): Promise<Role[]> {
    const response = await axiosClient.get<ApiResponse<Role[]>>(
      `api/v1/users/${userId}/roles`,
    )
    return response.data.data
  },

  async updateRoles(userId: string, roleIds: string[]): Promise<void> {
    await axiosClient.put<ApiResponse<unknown>>(`api/v1/users/${userId}/roles`, {
      roleIds,
    })
  },

  // async getPermissions(userId: string): Promise<Permission[]> {
  //   const response = await axiosClient.get<ApiResponse<Permission[]>>(
  //     `api/users/${userId}/permissions`,
  //   )
  //   return response.data.data
  // },
}

export default userService
