import React from 'react'
import { CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilFilter, cilTask } from '@coreui/icons'
import { NotificationKind, UnreadCount } from 'src/types/notifications'

interface NotificationStatsProps {
  totalUnreadAll: number
  unread: UnreadCount
  total: number
  tab: NotificationKind
}

export const NotificationStats: React.FC<NotificationStatsProps> = ({
  totalUnreadAll,
  unread,
  total,
  tab,
}) => {
  return (
    <CRow className="g-3 mb-4">
      <CCol xs={12} sm={6} lg={3}>
        <div className="notif-stat-card p-3 shadow-sm d-flex align-items-center justify-content-between">
          <div>
            <div className="text-muted small fw-semibold text-uppercase">Chưa đọc (Tổng)</div>
            <div className="fw-bold mt-1" style={{ fontSize: '26px', color: '#dc2626' }}>
              {totalUnreadAll}
            </div>
          </div>
          <div className="notif-stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <CIcon icon={cilBell} size="lg" />
          </div>
        </div>
      </CCol>

      <CCol xs={12} sm={6} lg={3}>
        <div className="notif-stat-card p-3 shadow-sm d-flex align-items-center justify-content-between">
          <div>
            <div className="text-muted small fw-semibold text-uppercase">Thông báo chung</div>
            <div className="fw-bold mt-1" style={{ fontSize: '26px', color: '#2563eb' }}>
              {unread.general} <span className="text-muted fs-6 fw-normal">chưa đọc</span>
            </div>
          </div>
          <div className="notif-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <CIcon icon={cilTask} size="lg" />
          </div>
        </div>
      </CCol>

      <CCol xs={12} sm={6} lg={3}>
        <div className="notif-stat-card p-3 shadow-sm d-flex align-items-center justify-content-between">
          <div>
            <div className="text-muted small fw-semibold text-uppercase">Được nhắc tên</div>
            <div className="fw-bold mt-1" style={{ fontSize: '26px', color: '#d97706' }}>
              {unread.mention} <span className="text-muted fs-6 fw-normal">chưa đọc</span>
            </div>
          </div>
          <div className="notif-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <span style={{ fontWeight: 800 }}>@</span>
          </div>
        </div>
      </CCol>

      <CCol xs={12} sm={6} lg={3}>
        <div className="notif-stat-card p-3 shadow-sm d-flex align-items-center justify-content-between">
          <div>
            <div className="text-muted small fw-semibold text-uppercase">
              Tổng số mục ({tab === 'general' ? 'Chung' : 'Nhắc tên'})
            </div>
            <div className="fw-bold mt-1 text-dark" style={{ fontSize: '26px' }}>
              {total}
            </div>
          </div>
          <div className="notif-stat-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
            <CIcon icon={cilFilter} size="lg" />
          </div>
        </div>
      </CCol>
    </CRow>
  )
}
