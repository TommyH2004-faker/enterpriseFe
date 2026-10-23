
import { ApiResponse } from 'src/api/authApi'
import axiosClient from 'src/api/axiosClient'

import {
  ActivityLogFilterOptions,
  ActivityLogListItem,
  ActivityLogPageResult,
  ActivityLogStats,
  ActivityLogStatsParams,
  GetActivityLogsParams,
} from 'src/types/activityLog'
import { endOfDayUtc, startOfDayUtc } from 'src/views/activities/utils/logHelpers'

const BASE_URL = '/api/v1'

export const activityLogQueryService = {
  async getActivityLogs(
    params: GetActivityLogsParams = {},
  ): Promise<ActivityLogPageResult<ActivityLogListItem>> {
    const response = await axiosClient.get<
      ApiResponse<ActivityLogPageResult<ActivityLogListItem>>
    >(`${BASE_URL}/activity-logs`, {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        search: params.search || undefined,
        activityType: params.activityType || undefined,
        employeeId: params.employeeId || undefined,
        fromDate: startOfDayUtc(params.fromDate),
        toDate: endOfDayUtc(params.toDate),
        sortBy: params.sortBy ?? 'CreatedAt',
        sortDirection: params.sortDirection ?? 'desc',
      },
    })

    return response.data.data
  },

  async getActivityLogStats(
    params: ActivityLogStatsParams = {},
  ): Promise<ActivityLogStats> {
    const response = await axiosClient.get<ApiResponse<ActivityLogStats>>(
      `${BASE_URL}/activity-logs/stats`,
      {
        params: {
          fromDate: startOfDayUtc(params.fromDate),
          toDate: endOfDayUtc(params.toDate),
        },
      },
    )

    return response.data.data
  },

  async getActivityLogFilters(): Promise<ActivityLogFilterOptions> {
    const response = await axiosClient.get<
      ApiResponse<ActivityLogFilterOptions>
    >(`${BASE_URL}/activity-logs/filters`)

    return response.data.data
  },
}

export default activityLogQueryService
