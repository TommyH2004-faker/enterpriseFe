import React from 'react'
import { CBadge } from '@coreui/react'
import { NotificationKind, UnreadCount } from 'src/types/notifications'
import CIcon from '@coreui/icons-react'
import { cilBell } from '@coreui/icons'

interface NotificationTabsProps {
  tab: NotificationKind
  unread: UnreadCount
  total: number
  startItemIndex: number
  endItemIndex: number
  onTabChange: (tab: NotificationKind) => void
}

export const NotificationTabs: React.FC<NotificationTabsProps> = ({
  tab,
  unread,
  total,
  startItemIndex,
  endItemIndex,
  onTabChange,
}) => {
  return (
    <div className="p-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3 bg-body-tertiary">
      <div className="notif-nav-pills">
        <button
          type="button"
          className={`notif-nav-btn ${tab === 'general' ? 'active' : ''}`}
          onClick={() => onTabChange('general')}
        >
          <span>
          <CIcon icon={cilBell} className="me-2" /> 
          Thông báo chung
        </span>
          {unread.general > 0 && (
            <CBadge color="primary" shape="rounded-pill">
              {unread.general > 99 ? '99+' : unread.general}
            </CBadge>
          )}
        </button>
        <button
          type="button"
          className={`notif-nav-btn ${tab === 'mention' ? 'active' : ''}`}
          onClick={() => onTabChange('mention')}
        >
           <span>
          <CIcon icon={cilBell} className="me-2" /> 
          Thông báo riêng
        </span>
        
          {unread.mention > 0 && (
            <CBadge color="warning" shape="rounded-pill" className="text-dark">
              {unread.mention > 99 ? '99+' : unread.mention}
            </CBadge>
          )}
        </button>
      </div>

      <div className="text-muted small">
        {total > 0 ? (
          <span>
            Hiển thị <strong>{startItemIndex} - {endItemIndex}</strong> trên tổng <strong>{total}</strong> thông báo
          </span>
        ) : (
          <span>Chưa có thông báo nào</span>
        )}
      </div>
    </div>
  )
}
