import axiosClient from '../api/axiosClient'
import {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  EmployeeActionResponse,
  EmployeeFilters,
  EmployeeApiResponse,
  EmployeeResponse,
  PositionResponse,
  UpdateEmployeeRequest,
} from '../types/Employee'

class EmployeeService {
  async getEmployees(filters?: EmployeeFilters): Promise<EmployeeResponse[]> {
    const response = await axiosClient.get<
      EmployeeApiResponse<EmployeeResponse[]>
    >('/api/v1/employees', { params: filters })
    return response.data.data
  }

  async getPositions(): Promise<PositionResponse[]> {
    const response = await axiosClient.get<
      EmployeeApiResponse<PositionResponse[]>
    >('/api/v1/positions', { params: { includeInactive: false } })
    return response.data.data
  }

  async createEmployee(
    request: CreateEmployeeRequest,
  ): Promise<{ data: CreateEmployeeResponse; message?: string }> {
    const response = await axiosClient.post<
      EmployeeApiResponse<CreateEmployeeResponse>
    >('/api/v1/employees', request)
    // log ra loi 
    console.log('createEmployee response:', response.data)
    return response.data
  }

  async updateEmployee(
    id: string,
    request: UpdateEmployeeRequest,
  ): Promise<EmployeeActionResponse> {
    const url = `/api/v1/employees/${id}`
    console.log('updateEmployee request:', {
      url,
      employeeId: id,
      payload: JSON.stringify(request, null, 2),
    })

    try {
      const response = await axiosClient.put<EmployeeActionResponse>(
        url,
        request,
      )
      return response.data
    } catch (error: any) {
      console.error('updateEmployee error response:', {
        status: error.response?.status,
        data: JSON.stringify(error.response?.data, null, 2),
      })
      throw error
    }
  }

  async deleteEmployee(id: string): Promise<EmployeeActionResponse> {
    const response = await axiosClient.delete<EmployeeActionResponse>(
      `/api/v1/employees/${id}`,
    )
    return response.data
  }
}

export const employeeService = new EmployeeService()
