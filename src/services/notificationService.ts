import axiosClient from 'src/api/axiosClient'
import { ApiResponse, NOTIFICATION_KINDS, NotificationKind, NotificationPage, SystemNotificationPage, UnreadCount } from 'src/types/notifications'


const BASE = '/api/notifications'

export const notificationService = {
  /** GET /api/notifications?kind=&page=&pageSize= */
  async getList(kind: NotificationKind, page = 1, pageSize = 20): Promise<NotificationPage> {
    const res = await axiosClient.get<ApiResponse<NotificationPage>>(BASE, {
      params: { kind, page: Math.max(1, page), pageSize },
    })
    return res.data.data
  },
getSystemList: async (
  kind: 'general' | 'mention' = 'general',
  page = 1,
  pageSize = 5,
): Promise<SystemNotificationPage> => {
  const response = await axiosClient.get<ApiResponse<SystemNotificationPage>>(
    '/api/notifications/system',
    {
      params: { kind, page, pageSize },
    },
  )

  return response.data.data
},
  /** GET /api/notifications/unread-count */
  async getUnreadCount(): Promise<UnreadCount> {
    const res = await axiosClient.get<ApiResponse<UnreadCount>>(`${BASE}/unread-count`)
    return res.data.data
  },

  /** POST /api/notifications/{id}/read  (id phải là Guid) */
  async markAsRead(id: string): Promise<void> {
    await axiosClient.post<ApiResponse<unknown>>(`${BASE}/${id}/read`)
  },

  /**
   * POST /api/notifications/read-all?kind=
   * BẮT BUỘC truyền kind: BE luôn normalize kind rỗng về "general",
   * nên không truyền kind sẽ KHÔNG đánh dấu thông báo mention.
   */
  async markAllAsRead(kind: NotificationKind): Promise<void> {
    await axiosClient.post<ApiResponse<unknown>>(`${BASE}/read-all`, null, {
      params: { kind },
    })
  },

  /** Đánh dấu đã đọc tất cả cả 2 loại (general + mention). */
  async markEverythingAsRead(): Promise<void> {
    await Promise.all(NOTIFICATION_KINDS.map((k) => notificationService.markAllAsRead(k)))
  },
}