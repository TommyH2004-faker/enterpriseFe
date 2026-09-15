import axios from "axios"
import axiosClient from "src/api/axiosClient"
import { CreateRoleRequest, Role, RoleListResponse, RoleQueryParams, UpdateRoleRequest } from "src/types/role"




interface ApiResponse<T> {
  isSuccess: boolean
  statusCode: number
  message: string
  traceId: string
  data: T
  errors: unknown[]
}

const roleService = {
  async getAll(params?: RoleQueryParams): Promise<RoleListResponse> {
    const response = await axiosClient.get<ApiResponse<RoleListResponse>>(
      'api/v1/roles',
      {
        params: {
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 10,
          search: params?.search || undefined,
          sortBy: params?.sortBy || 'DisplayName',
          sortDescending: params?.sortDescending ?? false,
        },
      },
    )

    return response.data.data
  },

  async getById(id: string): Promise<Role> {
        const response = await axiosClient.get<ApiResponse<Role>>(
      `api/v1/roles/${id}`,
    )

    return response.data.data
  },

  async create(data: CreateRoleRequest): Promise<Role> {
    const response = await axiosClient.post<ApiResponse<Role>>(
      'api/v1/roles',
      data,
    )

    return response.data.data
  },

  async update(data: UpdateRoleRequest): Promise<void> {
    await axiosClient.put<ApiResponse<unknown>>(
      `api/v1/roles/${data.id}`,
      {
        id: data.id,
        code: data.code,
        displayName: data.displayName,
        description: data.description,
      },
    )
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete<ApiResponse<unknown>>(
      `api/v1/roles/${id}`,
    )
  },
}

export default roleService

