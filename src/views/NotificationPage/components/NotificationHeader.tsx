import React from 'react'
import { CBadge, CButton, CSpinner, CTooltip } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCheckCircle,
  cilReload,
  cilVolumeHigh,
  cilVolumeOff,
} from '@coreui/icons'

interface NotificationHeaderProps {
  totalUnreadAll: number
  soundOn: boolean
  loading: boolean
  actionLoading: string | null
  currentTabUnread: number
  onToggleSound: () => void
  onReload: () => void
  onMarkAll: () => void
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  totalUnreadAll,
  soundOn,
  loading,
  actionLoading,
  currentTabUnread,
  onToggleSound,
  onReload,
  onMarkAll,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div>
        <div className="d-flex align-items-center gap-3 mb-1">
          <h2 className="h3 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <span>Trung tâm thông báo</span>
            {totalUnreadAll > 0 && (
              <CBadge color="danger" shape="rounded-pill" className="px-2 py-1" style={{ fontSize: '13px' }}>
                {totalUnreadAll} mới
              </CBadge>
            )}
          </h2>
        </div>
        <p className="text-muted mb-0">
          Theo dõi, lọc và xử lý các thông báo công việc, cập nhật tiến độ, bình luận và phản hồi realtime.
        </p>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap">
        <CTooltip content={soundOn ? 'Tắt âm thanh thông báo' : 'Bật âm thanh thông báo'}>
          <CButton
            color={soundOn ? 'black' : 'secondary'}
            variant={soundOn ? 'outline' : 'ghost'}
            className="d-flex align-items-center gap-1 shadow-sm"
            onClick={onToggleSound}
          >
            <CIcon icon={soundOn ? cilVolumeHigh : cilVolumeOff} size="sm" />
            <span className="d-none d-sm-inline">{soundOn ? 'Âm thanh' : 'Tắt tiếng'}</span>
          </CButton>
        </CTooltip>

        <CTooltip content="Làm mới danh sách">
          <CButton
            color="light"
            className="d-flex align-items-center gap-1 shadow-sm"
            disabled={loading}
            onClick={onReload}
          >
            <CIcon icon={cilReload} size="sm" className={loading ? 'fa-spin' : ''} />
            <span className="d-none d-sm-inline">Làm mới</span>
          </CButton>
        </CTooltip>

        <CButton
          color="primary"
          className="d-flex align-items-center gap-2 shadow-sm text-white"
          disabled={currentTabUnread === 0 || actionLoading === 'all'}
          onClick={onMarkAll}
        >
          {actionLoading === 'all' ? (
            <CSpinner size="sm" />
          ) : (
            <CIcon icon={cilCheckCircle} size="sm" />
          )}
          <span>Đánh dấu tất cả đã đọc</span>
        </CButton>
      </div>
    </div>
  )
}
