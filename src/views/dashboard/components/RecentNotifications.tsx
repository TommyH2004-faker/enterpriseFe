import React from 'react'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
} from '@coreui/react'
import type { SystemNotificationDto } from 'src/types/notifications'

interface RecentNotificationsProps {
  items: SystemNotificationDto[]
  total: number
  loading: boolean
  error: string | null
  onRetry: () => void
}

const formatDateTime = (value: string) => {
  if (!value) return '--'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '--'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'published':
      return 'success'
    case 'draft':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return 'secondary'
  }
}

const getPriorityColor = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 'danger'
    case 'high':
      return 'warning'
    case 'normal':
      return 'info'
    case 'low':
      return 'secondary'
    default:
      return 'secondary'
  }
}

const RecentNotifications: React.FC<RecentNotificationsProps> = ({
  items,
  total,
  loading,
  error,
  onRetry,
}) => {
  const unreadRecipientCount = items.reduce((sum, item) => {
    const activeRecipients = (item.recipients ?? []).filter(
      (recipient) => !recipient.isArchived && !recipient.isDeleted,
    )

    return sum + activeRecipients.filter((recipient) => !recipient.isRead).length
  }, 0)

  return (
    <CCard className="w-100 h-100">
      <CCardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <strong>Thông báo hệ thống gần đây</strong>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <CBadge color="secondary">{total} thông báo</CBadge>

          {unreadRecipientCount > 0 && (
            <CBadge color="danger">
              {unreadRecipientCount} lượt chưa đọc
            </CBadge>
          )}
        </div>
      </CCardHeader>

      <CCardBody className="p-0">
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: 320 }}
          >
            <CSpinner color="primary" />
          </div>
        ) : error ? (
          <div className="p-3 text-center" style={{ minHeight: 320 }}>
            <p className="text-danger mb-2">{error}</p>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={onRetry}
            >
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <div
            className="d-flex justify-content-center align-items-center text-body-secondary"
            style={{ height: 320 }}
          >
            Chưa có thông báo hệ thống nào.
          </div>
        ) : (
          <div
            className="recent-dashboard-scroll"
            style={{
              height: 320,
              maxHeight: 320,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              overscrollBehaviorY: 'contain',
            }}
          >
            <ul className="list-group list-group-flush">
              {items.map((item) => {
                const activeRecipients = (item.recipients ?? []).filter(
                  (recipient) =>
                    !recipient.isArchived && !recipient.isDeleted,
                )

                const readCount = activeRecipients.filter(
                  (recipient) => recipient.isRead,
                ).length

                const unreadCount = activeRecipients.length - readCount

                return (
                  <li
                    key={item.id}
                    className="list-group-item px-3 py-3"
                    style={{ minWidth: 0 }}
                  >
                    <div className="d-flex align-items-start gap-2">
                      {unreadCount > 0 && (
                        <span
                          className="rounded-circle bg-primary mt-2 flex-shrink-0"
                          style={{ width: 8, height: 8 }}
                          aria-label="Có người chưa đọc"
                          title="Có người chưa đọc"
                        />
                      )}

                      <div
                        className="min-w-0 flex-grow-1"
                        style={{ overflowWrap: 'anywhere' }}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                          <div
                            className="fw-semibold"
                            style={{
                              minWidth: 0,
                              overflowWrap: 'anywhere',
                              whiteSpace: 'pre-line',
                            }}
                          >
                            {item.title || 'Thông báo'}
                          </div>

                          <div className="d-flex align-items-center gap-1 flex-wrap">
                            <CBadge
                              color={getStatusColor(item.status)}
                              style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
                            >
                              {item.status || 'Không rõ trạng thái'}
                            </CBadge>

                            <CBadge
                              color={getPriorityColor(item.priority)}
                              style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
                            >
                              {item.priority || 'Không rõ ưu tiên'}
                            </CBadge>
                          </div>
                        </div>

                        {item.senderName && (
                          <div
                            className="small text-body-secondary mt-1"
                            style={{ overflowWrap: 'anywhere' }}
                          >
                            Người gửi: {item.senderName}
                          </div>
                        )}

                        {item.content && (
                          <div
                            className="small text-body-secondary mt-1"
                            style={{
                              overflowWrap: 'anywhere',
                              whiteSpace: 'pre-line',
                            }}
                          >
                            {item.content}
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap mt-2">
                          <span className="small text-body-secondary">
                            {formatDateTime(item.createdAt)}
                          </span>

                          <span
                            className="small text-body-secondary"
                            style={{ overflowWrap: 'anywhere' }}
                          >
                            {readCount}/{activeRecipients.length} người đã đọc
                            {unreadCount > 0 && (
                              <span className="text-danger">
                                {' '}· {unreadCount} chưa đọc
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default RecentNotifications