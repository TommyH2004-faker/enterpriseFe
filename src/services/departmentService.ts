import axiosClient from '../api/axiosClient'
import {
  ApiResponse,
  CreateDepartmentRequest,
  DepartmentResponse,
  PaginatedResponse,
  UpdateDepartmentRequest,
} from '../types/Department'

interface DepartmentFilters {
  code?: string
  name?: string
  description?: string
  managerId?: string
  createdAt?: string
  updatedAt?: string
  sortBy?: string
  sortDescending?: boolean
}

class DepartmentService {
  /**
   * Lấy danh sách phòng ban với phân trang và bộ lọc
   */
  async getAllDepartments(
    pageNumber: number = 1,
    pageSize: number = 10,
    filters?: DepartmentFilters,
  ): Promise<PaginatedResponse> {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse>>(
      '/department/get-all',
      {
        params: {
          pageNumber,
          pageSize,
          ...filters,
        },
      },
    )
    return response.data.data
  }

  /**
   * Lấy thông tin chi tiết một phòng ban
   */
  async getDepartmentById(id: string): Promise<DepartmentResponse> {
    const response = await axiosClient.get<ApiResponse<DepartmentResponse>>(
      `/department/get_by_id/${id}`,
    )
    return response.data.data
  }

  /**
   * Tạo phòng ban mới
   */
  async createDepartment(request: CreateDepartmentRequest): Promise<string> {
    const response = await axiosClient.post<ApiResponse<string>>(
      '/department/create',
      request,
    )
    return response.data.data
  }

  /**
   * Cập nhật phòng ban
   */
  async updateDepartment(
    id: string,
    request: UpdateDepartmentRequest,
  ): Promise<void> {
    await axiosClient.put(`/department/update/${id}`, {
      ...request,
      id,
    })
  }

  /**
   * Xóa phòng ban
   */
  async deleteDepartment(id: string): Promise<void> {
    await axiosClient.delete(`/department/delete/${id}`)
  }

  /**
   * Gán quản lý cho phòng ban
   */
  async assignManager(
    departmentId: string,
    managerUserId: string,
  ): Promise<void> {
    await axiosClient.post(
      `/departments/${departmentId}/assign-manager`,
      { managerUserId },
    )
  }

  /**
   * Kích hoạt phòng ban
   */
  async activateDepartment(id: string): Promise<void> {
    await axiosClient.post(`/departments/${id}/activate`)
  }

  /**
   * Vô hiệu hóa phòng ban
   */
  async deactivateDepartment(id: string): Promise<void> {
    await axiosClient.post(`/departments/${id}/deactivate`)
  }
}

export const departmentService = new DepartmentService()