import { ApiResponse, getErrorMessage } from 'src/api/authApi'
import axiosClient from 'src/api/axiosClient'
import { DashboardSummaryDto } from 'src/types/dashboard'

const BASE_URL = '/api/v1'

export const dashboardService = {
  async getSummary(): Promise<DashboardSummaryDto> {
    const response = await axiosClient.get<ApiResponse<DashboardSummaryDto>>(
      `${BASE_URL}/dashboard/summary`,
    )

    const { isSuccess, data, errors, message } = response.data

    // ApiResponse.data có kiểu T | null nên phải xử lý rõ ràng, không trả dữ liệu giả.
    if (!isSuccess || !data) {
      throw new Error(
        getErrorMessage(errors, message || 'Không nhận được dữ liệu Dashboard.'),
      )
    }

    return data
  },
}