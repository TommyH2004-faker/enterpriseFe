import axiosClient from 'src/api/axiosClient'

export type NotificationKind = 'general' | 'mention'

export interface NotificationDto {
  id: string
  type: string
  title: string
  content: string
  conversationId?: string | null
  messageId?: string | null
  senderName?: string | null
  createdAt: string
  isRead: boolean
}

export interface NotificationPage {
  items: NotificationDto[]
  total: number
}

export interface UnreadCount {
  general: number
  mention: number
}

interface ApiResponse<T> {
  isSuccess: boolean
  statusCode: number
  message: string
  traceId: string
  data: T
  errors: unknown[]
}

export const NOTIFICATION_RECEIVED_EVENT = 'notification:received'
export const NOTIFICATION_RESYNC_EVENT = 'notification:resync'

export const kindOf = (n: Pick<NotificationDto, 'type'>): NotificationKind =>
  n.type === 'Mention' ? 'mention' : 'general'

const BASE = '/api/notifications'

export const notificationService = {
  async getList(kind: NotificationKind, page = 1, pageSize = 20): Promise<NotificationPage> {
    const res = await axiosClient.get<ApiResponse<NotificationPage>>(BASE, {
      params: { kind, page, pageSize },
    })
    return res.data.data
  },

  async getUnreadCount(): Promise<UnreadCount> {
    const res = await axiosClient.get<ApiResponse<UnreadCount>>(`${BASE}/unread-count`)
    return res.data.data
  },

  async markAsRead(id: string): Promise<void> {
    await axiosClient.post(`${BASE}/${id}/read`)
  },

  async markAllAsRead(kind: NotificationKind): Promise<void> {
    await axiosClient.post(`${BASE}/read-all`, null, { params: { kind } })
  },
}