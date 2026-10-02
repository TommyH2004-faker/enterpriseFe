import React from 'react'
import { CButton } from '@coreui/react'

interface FilePaginationProps {
  page: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
}

const FilePagination: React.FC<FilePaginationProps> = ({ page, totalPages, totalCount, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <div className="d-flex justify-content-between align-items-center border-top mt-3 pt-3">
      <span className="small text-body-secondary">Trang {page}/{totalPages} · {totalCount} tệp</span>
      <div className="d-flex gap-2">
        <CButton size="sm" color="light" className="border" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>Trước</CButton>
        <CButton size="sm" color="light" className="border" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>Sau</CButton>
      </div>
    </div>
  )
}

export default FilePagination
