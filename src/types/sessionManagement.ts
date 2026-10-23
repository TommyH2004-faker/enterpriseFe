
export interface SessionManagementItem {
  id: string
  userId: string
  username: string
  ipAddress: string
  userAgent: string
  createdAt: string
  lastActivityAt: string
  expiredAt: string
  isRevoked: boolean
  revokedAt: string | null
  revokedReason: string | null
  isActive: boolean

}
export interface SessionManagementSummary {
  activeCount: number
  expiredCount: number
  revokedCount: number
}
export interface SessionManagementQuery {
  username?: string
  page: number
  pageSize: number
}

export interface SessionManagementResponse {
  items: SessionManagementItem[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  summary: SessionManagementSummary
}
