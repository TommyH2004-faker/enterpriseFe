import { ApiResponse, getErrorMessage } from 'src/api/authApi'
import axiosClient from 'src/api/axiosClient'
import { DashboardSummaryDto, DashboardWeeklyTrendResponse } from 'src/types/dashboard'

const BASE_URL = '/api/v1'

export const dashboardService = {
  async getSummary(fromDate?: string, toDate?: string): Promise<DashboardSummaryDto> {
    const params: Record<string, string> = {}
    if (fromDate) params.fromDate = fromDate
    if (toDate) params.toDate = toDate

    const response = await axiosClient.get<ApiResponse<DashboardSummaryDto>>(
      `${BASE_URL}/dashboard/summary`,
      { params },
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

  async getWeeklyTrend(
    numberOfWeeks?: number,
    fromDate?: string,
    toDate?: string,
  ): Promise<DashboardWeeklyTrendResponse> {
    const params: Record<string, any> = {}
    if (numberOfWeeks) params.numberOfWeeks = numberOfWeeks
    if (fromDate) params.fromDate = fromDate
    if (toDate) params.toDate = toDate

    const response = await axiosClient.get<ApiResponse<DashboardWeeklyTrendResponse>>(
      `${BASE_URL}/dashboard/weekly-trend`,
      { params },
    )

    const { isSuccess, data, errors, message } = response.data

    if (!isSuccess || !data) {
      throw new Error(
        getErrorMessage(errors, message || 'Không nhận được dữ liệu xu hướng theo tuần.'),
      )
    }

    return data
  },
}