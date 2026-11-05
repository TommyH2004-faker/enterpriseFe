/** Các giá trị enum (module/action/entityType) là chuỗi trả về từ backend (tên enum C#). */
/** Các giá trị enum là chuỗi trả về từ backend. */
export interface AuditLogListItem {
  id: string
  createdAt: string

  actorId: string | null
  actorName: string
  actorCode?: string | null
  actorAvatarUrl?: string | null

  module: string
  entityType: string
  entityId: string
  action: string
  description: string
  ipAddress?: string | null
}
/** Response chi tiết nguyên bản từ API backend. */
export interface AuditLogDetailResponse {
  id: string
  userId: string
  userName: string | null
  affectedUserId: string | null
  affectedUserName: string | null

  module: string
  entityType: string
  entityId: string
  action: string
  description: string

  oldValues: string | null
  newValues: string | null
  ipAddress: string | null
  userAgent: string | null
  correlationId: string | null
  createdAt: string
}
export interface AuditLogDetail extends AuditLogListItem {
  userName?: string | null
  userAgent?: string | null
  correlationId: string
  affectedUserId?: string | null
  affectedUserName?: string | null
  oldValues: string | null // JSON string
  newValues: string | null // JSON string
}

export interface AuditLogStats {
  total: number
  byModule: Record<string, number>
  byAction: Record<string, number>
  actorCount: number // số UserId khác nhau
}

export interface AuditLogFilterOptions {
  modules: string[]
  actions: string[]
  entityTypes: string[]
}

export interface GetAuditLogsParams {
  page?: number
  pageSize?: number
  search?: string
  module?: string
  action?: string
  entityType?: string
  fromDate?: string // yyyy-MM-dd (giờ địa phương), service sẽ đổi sang UTC
  toDate?: string // yyyy-MM-dd
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface AuditLogStatsParams {
  fromDate?: string
  toDate?: string
}

/** State bộ lọc của trang Audit Logs */
export interface AuditFilters {
  search: string
  module: string
  action: string
  entityType: string
  fromDate: string
  toDate: string
}
