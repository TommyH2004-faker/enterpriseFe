import React from 'react'
import { CBadge, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowRight,
  cilBell,
  cilCheck,
  cilCommentSquare,
  cilEnvelopeClosed,
  cilInfo,
  cilTask,
  cilUserPlus,
} from '@coreui/icons'
import { NotificationDto, NotificationType, getNotificationTypeMeta } from 'src/types/notifications'

interface NotificationItemProps {
  item: NotificationDto
  actionLoading: string | null
  onItemClick: (item: NotificationDto) => void
  onMarkSingle: (e: React.MouseEvent, item: NotificationDto) => void
}

const timeAgo = (iso: string) => {
  if (!iso) return ''
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(Math.max(0, diff) / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatFullDate = (iso: string) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const getInitial = (name?: string | null, title?: string) => {
  const target = (name || title || '?').trim()
  return target.charAt(0).toUpperCase()
}

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case 'Assignment':
      return cilUserPlus
    case 'Task':
      return cilTask
    case 'Comment':
      return cilCommentSquare
    case 'Mention':
      return cilBell
    case 'Message':
      return cilEnvelopeClosed
    case 'System':
    default:
      return cilInfo
  }
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  item,
  actionLoading,
  onItemClick,
  onMarkSingle,
}) => {
  const meta = getNotificationTypeMeta(item.type)
  const isItemActionLoading = actionLoading === item.id

  return (
    <div
      className={`notif-item-card ${item.isRead ? 'read' : 'unread'}`}
      onClick={() => onItemClick(item)}
    >
      <div className="d-flex align-items-start gap-3">
        {/* Avatar with type badge */}
        <div
          className="notif-avatar"
          style={{
            background: `${meta.color}18`,
            color: meta.color,
          }}
        >
          {getInitial(item.senderName, item.title)}
          <span className="notif-avatar-badge" title={meta.label}>
            <CIcon icon={getTypeIcon(item.type)} size="sm" style={{ color: meta.color }} />
          </span>
        </div>

        {/* Content */}
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="fw-semibold text-dark small">
                {item.senderName || 'Hệ thống'}
              </span>
              <CBadge
                color={meta.badgeColor}
                shape="rounded-pill"
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                {meta.label}
              </CBadge>
              {!item.isRead && (
                <CBadge color="danger" shape="rounded-pill" style={{ fontSize: '10px' }}>
                  Mới
                </CBadge>
              )}
            </div>

            <div className="d-flex align-items-center gap-2">
              <span
                className="text-muted small"
                title={formatFullDate(item.createdAt)}
                style={{ fontSize: '12px' }}
              >
                {timeAgo(item.createdAt)}
              </span>
              {!item.isRead && <div className="notif-unread-glow" />}
            </div>
          </div>

          {/* Title */}
          <div
            className={`mb-1 ${item.isRead ? 'fw-semibold text-dark' : 'fw-bold text-dark'}`}
            style={{ fontSize: '14px' }}
          >
            {item.title}
          </div>

          {/* Content text */}
          <div
            className="text-muted small mb-2"
            style={{
              lineHeight: 1.5,
              wordBreak: 'break-word',
            }}
          >
            {item.content}
          </div>

          {/* Bottom Actions Bar */}
          <div className="d-flex align-items-center justify-content-between gap-2 mt-2 pt-2 border-top border-light-subtle flex-wrap">
            <div className="d-flex align-items-center gap-2">
              {item.taskId && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary py-0 px-2 rounded-pill small notif-action-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onItemClick(item)
                  }}
                >
                  Xem công việc <CIcon icon={cilArrowRight} size="sm" className="ms-1" />
                </button>
              )}

              {item.conversationId && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-pill small notif-action-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onItemClick(item)
                  }}
                >
                  Mở tin nhắn <CIcon icon={cilArrowRight} size="sm" className="ms-1" />
                </button>
              )}
            </div>

            {!item.isRead && (
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none text-muted p-0 small notif-action-btn d-flex align-items-center gap-1"
                disabled={isItemActionLoading}
                onClick={(e) => onMarkSingle(e, item)}
              >
                {isItemActionLoading ? (
                  <CSpinner size="sm" />
                ) : (
                  <CIcon icon={cilCheck} size="sm" />
                )}
                <span>Đánh dấu đã đọc</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
