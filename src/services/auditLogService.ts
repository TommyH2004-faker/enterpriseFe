
import { ApiResponse } from 'src/api/authApi'
import axiosClient from 'src/api/axiosClient'

import {
  AuditLogDetail,
  AuditLogFilterOptions,
  AuditLogListItem,
  AuditLogStats,
  AuditLogStatsParams,
  GetAuditLogsParams,
} from 'src/types/auditLog'
import { ActivityLogPageResult } from 'src/types/activityLog'
import { endOfDayUtc, startOfDayUtc } from 'src/views/activities/utils/logHelpers'

const BASE_URL = '/api/v1'

export const auditLogService = {
  async getAuditLogs(
    params: GetAuditLogsParams = {},
  ): Promise<ActivityLogPageResult<AuditLogListItem>> {
    const response = await axiosClient.get<
      ApiResponse<ActivityLogPageResult<AuditLogListItem>>
    >(`${BASE_URL}/audit-logs`, {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        search: params.search || undefined,
        module: params.module || undefined,
        action: params.action || undefined,
        entityType: params.entityType || undefined,
        fromDate: startOfDayUtc(params.fromDate),
        toDate: endOfDayUtc(params.toDate),
        sortBy: params.sortBy ?? 'CreatedAt',
        sortDirection: params.sortDirection ?? 'desc',
      },
    })

    return response.data.data
  },

  async getAuditLogStats(
    params: AuditLogStatsParams = {},
  ): Promise<AuditLogStats> {
    const response = await axiosClient.get<ApiResponse<AuditLogStats>>(
      `${BASE_URL}/audit-logs/stats`,
      {
        params: {
          fromDate: startOfDayUtc(params.fromDate),
          toDate: endOfDayUtc(params.toDate),
        },
      },
    )

    return response.data.data
  },

  async getAuditLogFilters(): Promise<AuditLogFilterOptions> {
    const response = await axiosClient.get<ApiResponse<AuditLogFilterOptions>>(
      `${BASE_URL}/audit-logs/filters`,
    )

    return response.data.data
  },

  async getAuditLogDetail(id: string): Promise<AuditLogDetail> {
    const response = await axiosClient.get<ApiResponse<AuditLogDetail>>(
      `${BASE_URL}/audit-logs/${id}`,
    )

    return response.data.data
  },
}

export default auditLogService
