/** Các giá trị enum (module/action/entityType) là chuỗi trả về từ backend (tên enum C#). */
export interface AuditLogListItem {
  id: string
  createdAt: string // UTC, ISO 8601 (có hậu tố Z)
  actorId: string | null // null khi UserId = Guid.Empty (hệ thống)
  actorName: string // "System" khi không có người thực hiện
  actorCode?: string | null
  actorAvatarUrl?: string | null
  module: string // AuditModule: HRM | ProjectManagement | Security | Authentication | System
  entityType: string // AuditEntityType: User, Employee, Task, Role, Permission...
  entityId: string // Guid
  action: string // AuditAction: ChangeDepartment, AssignRole, ChangeDeadline...
  description: string
  ipAddress?: string | null
}

export interface AuditLogDetail extends AuditLogListItem {
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
