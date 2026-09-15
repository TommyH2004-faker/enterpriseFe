import axiosClient from 'src/api/axiosClient'
import { CreatePermissionRequest, Permission, PermissionListResponse, PermissionQueryParams, UpdatePermissionRequest } from 'src/types/permission'



interface ApiResponse<T> {
  isSuccess: boolean
  statusCode: number
  message: string
  traceId: string
  data: T
  errors: unknown[]
}

const permissionService = {
  async getAll(params?: PermissionQueryParams): Promise<PermissionListResponse> {
    const response = await axiosClient.get<ApiResponse<PermissionListResponse>>(
      'api/v1/permissions',
      {
        params: {
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 10,
          search: params?.search || undefined,
          sortBy: params?.sortBy || 'Name',
          sortDescending: params?.sortDescending ?? false,
        },
      },
    )

    return response.data.data
  },

  async getById(id: string): Promise<Permission> {
    const response = await axiosClient.get<ApiResponse<Permission>>(
      `api/v1/permissions/${id}`,
    )

    return response.data.data
  },

  async create(data: CreatePermissionRequest): Promise<Permission> {
    const response = await axiosClient.post<ApiResponse<Permission>>(
      'api/v1/permissions',
      data,
    )
    
    return response.data.data
  },

  async update(data: UpdatePermissionRequest): Promise<void> {
    await axiosClient.put<ApiResponse<unknown>>(`api/v1/permissions/${data.id}`, {
      
    })
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete<ApiResponse<unknown>>(`api/v1/permissions/${id}`)
  },
}

export default permissionService
