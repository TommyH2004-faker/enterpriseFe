import React from 'react'
import { CPagination, CPaginationItem } from '@coreui/react'

interface NotificationPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const NotificationPagination: React.FC<NotificationPaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null

  return (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4 pt-3 border-top">
      <div className="text-muted small">
        Trang <strong>{page}</strong> trên tổng <strong>{totalPages}</strong> trang
      </div>

      <CPagination className="mb-0" size="sm">
        <CPaginationItem
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          style={{ cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
        >
          &laquo; Trước
        </CPaginationItem>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
          .map((p, idx, arr) => {
            const prevP = arr[idx - 1]
            const showEllipsis = prevP && p - prevP > 1

            return (
              <React.Fragment key={p}>
                {showEllipsis && <CPaginationItem disabled>...</CPaginationItem>}
                <CPaginationItem
                  active={p === page}
                  onClick={() => onPageChange(p)}
                  style={{ cursor: 'pointer' }}
                >
                  {p}
                </CPaginationItem>
              </React.Fragment>
            )
          })}

        <CPaginationItem
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          style={{ cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
        >
          Sau &raquo;
        </CPaginationItem>
      </CPagination>
    </div>
  )
}
