import React from 'react'
import { CButton, CSpinner } from '@coreui/react'
import { NotificationDto, NotificationKind } from 'src/types/notifications'
import { NotificationItem } from './NotificationItem'

interface NotificationListProps {
  loading: boolean
  items: NotificationDto[]
  tab: NotificationKind
  hasActiveFilters: boolean
  actionLoading: string | null
  onClearFilters: () => void
  onItemClick: (item: NotificationDto) => void
  onMarkSingle: (e: React.MouseEvent, item: NotificationDto) => void
}

export const NotificationList: React.FC<NotificationListProps> = ({
  loading,
  items,
  tab,
  hasActiveFilters,
  actionLoading,
  onClearFilters,
  onItemClick,
  onMarkSingle,
}) => {
  if (loading) {
    return (
      <div className="py-5 text-center">
        <CSpinner color="primary" />
        <div className="text-muted mt-2 small">Đang tải danh sách thông báo...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="notif-empty-container">
        <div className="notif-empty-icon">
          {hasActiveFilters ? '🔍' : tab === 'mention' ? '@' : '🎉'}
        </div>
        <h5 className="fw-bold text-dark mb-1">
          {hasActiveFilters
            ? 'Không tìm thấy thông báo phù hợp'
            : tab === 'mention'
            ? 'Chưa có ai nhắc đến bạn'
            : 'Bạn đã nắm bắt hết mọi thông tin!'}
        </h5>
        <p className="text-muted small mb-3">
          {hasActiveFilters
            ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ các tiêu chí lọc.'
            : tab === 'mention'
            ? 'Khi có đồng nghiệp tag @tên bạn trong bình luận hoặc cuộc trò chuyện, thông báo sẽ hiển thị ở đây.'
            : 'Không có thông báo mới nào cần xử lý lúc này.'}
        </p>
        {hasActiveFilters && (
          <CButton color="light" size="sm" onClick={onClearFilters}>
            Xóa bộ lọc
          </CButton>
        )}
      </div>
    )
  }

  return (
    <div className="notif-list">
      {items.map((item) => (
        <NotificationItem
          key={item.id}
          item={item}
          actionLoading={actionLoading}
          onItemClick={onItemClick}
          onMarkSingle={onMarkSingle}
        />
      ))}
    </div>
  )
}
