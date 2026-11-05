/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

import {
  cilBell,
  cilCommentSquare,
  cilEnvelopeClosed,
  cilInfo,
  cilTask,
  cilUserPlus,
} from '@coreui/icons'

/** Backend chỉ nhận 2 giá trị này (NormalizeKind: "mention" → mention, còn lại → general). */
export type NotificationKind = 'general' | 'mention'

export const NOTIFICATION_KINDS: readonly NotificationKind[] = ['general', 'mention'] as const

export type NotificationType =
  | 'Assignment'
  | 'Task'
  | 'Comment'
  | 'Mention'
  | 'Message'
  | 'System'
  | (string & {}) // cho phép type lạ từ BE nhưng vẫn giữ autocomplete

export interface NotificationDto {
  id: string // Guid
  type: NotificationType
  title: string
  content: string
  conversationId?: string | null
  messageId?: string | null
  taskId?: string | null
  senderName?: string | null
  createdAt: string // ISO 8601
  isRead: boolean
}

export interface NotificationPage {
  items: NotificationDto[]
  total: number
}
// Thêm vào src/types/notifications.ts

export interface SystemNotificationRecipientDto {
  userId: string
  isRead: boolean
  readAt: string | null
  deliveredAt: string
  isArchived: boolean
  isDeleted: boolean
}

export interface SystemNotificationDto {
  id: string
  type: string
  title: string
  content: string
  priority: string
  status: string
  createdBy: string | null
  senderName: string | null
  createdAt: string
  taskId: string | null
  conversationId: string | null
  messageId: string | null
  recipients: SystemNotificationRecipientDto[]
}

export interface SystemNotificationPage {
  items: SystemNotificationDto[]
  total: number
}

export interface UnreadCount {
  general: number
  mention: number
}

/** Khớp với kết quả HandleResult(...) của ApiController. */
export interface ApiResponse<T> {
  isSuccess: boolean
  statusCode: number
  message: string
  traceId: string
  data: T
  errors: unknown[]
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export const NOTIFICATION_RECEIVED_EVENT = 'notification:received'
export const NOTIFICATION_RESYNC_EVENT = 'notification:resync'

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Phải giống logic BE: chỉ 'Mention' thuộc tab mention, còn lại là general. */
export const kindOf = (n: Pick<NotificationDto, 'type'>): NotificationKind =>
  n.type === 'Mention' ? 'mention' : 'general'

export interface NotificationTypeMeta {
  label: string
  color: string
  badgeColor: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
  icon: string | string[]
  description: string
}

export const getNotificationTypeMeta = (type: NotificationType): NotificationTypeMeta => {
  switch (type) {
    case 'Assignment':
      return { label: 'Phân công', color: '#3b82f6', badgeColor: 'primary', icon: cilUserPlus, description: 'Phân công công việc mới' }
    case 'Task':
      return { label: 'Công việc', color: '#06b6d4', badgeColor: 'info', icon: cilTask, description: 'Cập nhật trạng thái công việc' }
    case 'Comment':
      return { label: 'Bình luận', color: '#10b981', badgeColor: 'success', icon: cilCommentSquare, description: 'Bình luận mới trong công việc' }
    case 'Mention':
      return { label: 'Nhắc tên', color: '#f59e0b', badgeColor: 'warning', icon: cilBell, description: 'Bạn được nhắc đến' }
    case 'Message':
      return { label: 'Tin nhắn', color: '#8b5cf6', badgeColor: 'primary', icon: cilEnvelopeClosed, description: 'Tin nhắn mới' }
    case 'System':
      return { label: 'Hệ thống', color: '#64748b', badgeColor: 'secondary', icon: cilInfo, description: 'Thông báo hệ thống' }
    default:
      return { label: type || 'Thông báo', color: '#6b7280', badgeColor: 'secondary', icon: cilInfo, description: 'Thông báo' }
  }
}
