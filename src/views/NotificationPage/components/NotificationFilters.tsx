import React from 'react'
import { CCol, CFormInput, CFormSelect, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'

interface NotificationFiltersProps {
  search: string
  statusFilter: 'all' | 'unread' | 'read'
  typeFilter: string
  pageSize: number
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: 'all' | 'unread' | 'read') => void
  onTypeFilterChange: (value: string) => void
  onPageSizeChange: (value: number) => void
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  search,
  statusFilter,
  typeFilter,
  pageSize,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onPageSizeChange,
}) => {
  return (
    <div className="p-3 border-bottom bg-white">
      <CRow className="g-2 align-items-center">
        {/* Search Input */}
        <CCol xs={12} md={5}>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light border-end-0 text-muted">
              <CIcon icon={cilSearch} size="sm" />
            </span>
            <CFormInput
              size="sm"
              placeholder="Tìm theo tiêu đề, nội dung, người gửi..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="border-start-0"
            />
            {search && (
              <button
                type="button"
                className="btn btn-sm btn-light border"
                onClick={() => onSearchChange('')}
              >
                ✕
              </button>
            )}
          </div>
        </CCol>

        {/* Status Filter */}
        <CCol xs={6} md={3}>
          <CFormSelect
            size="sm"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="unread">Chỉ chưa đọc</option>
            <option value="read">Đã đọc</option>
          </CFormSelect>
        </CCol>

        {/* Type Filter */}
        <CCol xs={6} md={2}>
          <CFormSelect
            size="sm"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
          >
            <option value="all">Tất cả phân loại</option>
            <option value="Assignment">Phân công</option>
            <option value="Task">Công việc</option>
            <option value="Comment">Bình luận</option>
            <option value="Mention">Nhắc tên</option>
            <option value="Message">Tin nhắn</option>
            <option value="System">Hệ thống</option>
          </CFormSelect>
        </CCol>

        {/* Page Size */}
        <CCol xs={12} md={2} className="text-md-end">
          <div className="d-flex align-items-center justify-content-md-end gap-2">
            <span className="small text-muted text-nowrap">Hiển thị:</span>
            <CFormSelect
              size="sm"
              style={{ width: '80px' }}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </CFormSelect>
          </div>
        </CCol>
      </CRow>
    </div>
  )
}
