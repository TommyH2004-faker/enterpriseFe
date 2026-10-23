import { Fragment } from 'react'
import { CCardFooter, CPagination, CPaginationItem } from '@coreui/react'

interface SessionPaginationProps {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
}

const SessionPagination = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: SessionPaginationProps) => {
  if (totalCount === 0) return null

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - page) <= 1,
  )

  return (
    <CCardFooter className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 px-4 py-3">
      <small className="text-body-secondary">
        Hiển thị {from}–{to} trên {totalCount} session
      </small>

      {totalPages > 1 && (
        <CPagination size="sm" className="mb-0" aria-label="Phân trang session">
          <CPaginationItem
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Trước
          </CPaginationItem>

          {visiblePages.map((pageNumber, index) => {
            const previous = visiblePages[index - 1]
            const hasGap =
              previous !== undefined && pageNumber - previous > 1

            return (
              <Fragment key={pageNumber}>
                {hasGap && <CPaginationItem disabled>…</CPaginationItem>}
                <CPaginationItem
                  active={pageNumber === page}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </CPaginationItem>
              </Fragment>
            )
          })}

          <CPaginationItem
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Sau
          </CPaginationItem>
        </CPagination>
      )}
    </CCardFooter>
  )
}

export default SessionPagination