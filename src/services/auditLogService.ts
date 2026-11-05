
import { ApiResponse } from 'src/api/authApi'
import axiosClient from 'src/api/axiosClient'

import {
  AuditLogDetail,
  AuditLogDetailResponse,
  AuditLogFilterOptions,
  AuditLogListItem,
  AuditLogStats,
  AuditLogStatsParams,
  GetAuditLogsParams,
} from 'src/types/auditLog'
import { ActivityLogPageResult } from 'src/types/activityLog'
import { endOfDayUtc, startOfDayUtc } from 'src/views/activities/utils/logHelpers'

const BASE_URL = '/api/v1'

type ApiAuditLogListItem = Omit<
  AuditLogListItem,
  'actorId' | 'actorName'
> & {
  userId: string
  userName?: string | null
}

type ApiAuditLogPageResult = {
  items: ApiAuditLogListItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'
const mapAuditLog = (
  item: ApiAuditLogListItem,
): AuditLogListItem => {
  const isSystem =
    !item.userId ||
    item.userId.toLowerCase() === SYSTEM_USER_ID

  return {
    ...item,
    actorId: isSystem ? null : item.userId,
    actorName: isSystem
      ? 'System'
      : item.userName?.trim() || 'Không xác định',
  }
}
export const auditLogService = {

async getAuditLogs(
  params: GetAuditLogsParams = {},
): Promise<ActivityLogPageResult<AuditLogListItem>> {
  const response = await axiosClient.get<
    ApiResponse<ApiAuditLogPageResult>
  >(`${BASE_URL}/audit-logs`, {
    params: {
      pageNumber: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      search: params.search || undefined,
      module: params.module || undefined,
      action: params.action || undefined,
      entityType: params.entityType || undefined,
      userId: undefined,
      fromDate: startOfDayUtc(params.fromDate),
      toDate: endOfDayUtc(params.toDate),
      sortBy: params.sortBy ?? 'createdAt',
      sortDescending: (params.sortDirection ?? 'desc') === 'desc',
    },
  })

  const result = response.data.data

  return {
    ...result,
    items: result.items.map(mapAuditLog),
  }
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
  const response = await axiosClient.get<
    ApiResponse<AuditLogDetailResponse>
  >(`${BASE_URL}/audit-logs/${id}`)

  const item = response.data.data

  return {
    ...item,
    actorId: item.userId,
    actorName: item.userName?.trim() || 'Không xác định',
    actorCode: null,
    actorAvatarUrl: null,
    affectedUserName: item.affectedUserName ?? null,
  }
},
}

export default auditLogService
