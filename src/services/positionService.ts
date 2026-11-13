// services/positionService.ts

import axiosClient from 'src/api/axiosClient.ts'
import { API_BASE_URL } from 'src/config/env'
import {
  Position,
  CreatePositionDTO,
  UpdatePositionDTO,
  PositionResponse,
  SinglePositionResponse,
} from '../types/position.ts'

class PositionService {
  // Lấy danh sách tất cả positions
  async getAll(): Promise<Position[]> {
    const response = await axiosClient.get<PositionResponse>(`${API_BASE_URL}/api/v1/positions`, {
      params: { includeInactive: false },
    })
    return response.data.data
  }

  // Lấy chi tiết một position
  async getById(id: string): Promise<Position> {
    const response = await axiosClient.get<SinglePositionResponse>(
      `${API_BASE_URL}/api/v1/positions/${id}`,
    )
    return response.data.data
  }

  // Tạo position mới
  async create(position: CreatePositionDTO): Promise<string> {
    const response = await axiosClient.post<{
      isSuccess: boolean
      statusCode: number
      message: string
      traceId: string
      data: string
      errors: string[]
    }>(`${API_BASE_URL}/api/v1/positions`, position)

    return response.data.data
  }

  // Cập nhật position
  async update(id: string, position: UpdatePositionDTO): Promise<void> {
    await axiosClient.put(`${API_BASE_URL}/api/v1/positions/${id}`, position)
  }

  // Xóa position
  async delete(id: string): Promise<boolean> {
    const response = await axiosClient.delete<SinglePositionResponse>(
      `${API_BASE_URL}/api/v1/positions/${id}`,
    )
    const data = response.data
    return data.isSuccess
  }
}

export default new PositionService()
