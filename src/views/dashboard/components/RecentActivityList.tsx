import React from 'react'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
} from '@coreui/react'
import type { ActivityLogListItem } from 'src/types/activityLog'

interface RecentActivityListProps {
  items: ActivityLogListItem[]
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

const getActivityBadgeColor = (activityType: string) => {
  const type = activityType?.toLowerCase() ?? ''

  if (type.includes('create')) return 'success'
  if (type.includes('update') || type.includes('edit')) return 'info'
  if (type.includes('delete') || type.includes('remove')) return 'danger'
  if (type.includes('assign')) return 'primary'

  return 'secondary'
}

const RecentActivityList: React.FC<RecentActivityListProps> = ({
  items,
  loading,
  error,
  onRetry,
}) => {
  return (
    <CCard className="w-100 h-100">
      <CCardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <strong>Hoạt động gần đây</strong>
        <CBadge color="secondary">{items.length} hoạt động</CBadge>
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
            Chưa có hoạt động nào.
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
              {items.map((item) => (
                <li
                  key={item.id}
                  className="list-group-item px-3 py-3"
                  style={{ minWidth: 0 }}
                >
                  <div className="d-flex align-items-start gap-2">
                    <div
                      className="min-w-0 flex-grow-1"
                      style={{ overflowWrap: 'anywhere' }}
                    >
                      <div
                        className="fw-semibold mb-1"
                        style={{
                          overflowWrap: 'anywhere',
                          whiteSpace: 'pre-line',
                        }}
                        title={item.title || undefined}
                      >
                        {item.title || 'Hoạt động'}
                      </div>

                      <div
                        className="small text-body-secondary mb-1"
                        style={{ overflowWrap: 'anywhere' }}
                      >
                        {item.employeeName || 'Người dùng'}
                        {item.employeeCode ? ` (${item.employeeCode})` : ''}
                      </div>

                      {item.description && (
                        <div
                          className="small text-body-secondary"
                          style={{
                            overflowWrap: 'anywhere',
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {item.description}
                        </div>
                      )}

                      <div className="small text-body-secondary mt-2">
                        {formatDateTime(item.createdAt)}
                      </div>
                    </div>

                    <CBadge
                      color={getActivityBadgeColor(item.activityType)}
                      className="flex-shrink-0 text-break"
                      style={{
                        whiteSpace: 'normal',
                        overflowWrap: 'anywhere',
                        maxWidth: '40%',
                      }}
                    >
                      {item.activityType || 'Khác'}
                    </CBadge>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default RecentActivityList