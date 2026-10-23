export interface ActivityLogListItem {
  id: string
  createdAt: string // UTC, ISO 8601 (có hậu tố Z)
  employeeId: string
  employeeName: string
  employeeCode?: string | null
  avatarUrl?: string | null
  activityType: string // ActivityType (tên enum C#)
  title: string
  description: string
  entityId: string // Guid
  correlationId: string
}

export interface ActivityLogStats {
  total: number;
  today: number;
  byActivityType: Record<string, number>;
  activeEmployeeCount: number;
}

export interface ActivityLogPageResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
}

export interface ActivityEmployeeOption {
  id: string
  fullName: string
  employeeCode?: string | null
}

export interface ActivityLogFilterOptions {
  activityTypes: string[]
  employees: ActivityEmployeeOption[]
}

export interface GetActivityLogsParams {
  page?: number
  pageSize?: number
  search?: string
  activityType?: string
  employeeId?: string
  fromDate?: string
  toDate?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface ActivityLogStatsParams {
  fromDate?: string
  toDate?: string
}

/** State bộ lọc của trang Activity Logs */
export interface ActivityFilters {
  search: string
  activityType: string
  employeeId: string
  fromDate: string
  toDate: string
}

export interface SelectOption {
  value: string
  label: string
}