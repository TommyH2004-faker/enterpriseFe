import { CPagination, CPaginationItem } from '@coreui/react'

interface Props {
  page: number
  totalPages: number
  pageSize: number
  totalCount: number
  onChange: (page: number) => void
}

function buildPages(page: number, total: number): (number | '...')[] {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1)
  if (page <= 3) return [1, 2, 3, 4, 5, '...', total]
  if (page >= total - 2) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', page - 1, page, page + 1, '...', total]
}

export default function LogPagination({ page, totalPages, pageSize, totalCount, onChange }: Props) {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-3 small text-body-secondary">
      <span>
        Hiển thị {from} - {to} trên <b>{totalCount.toLocaleString('vi-VN')}</b> bản ghi
      </span>

      {totalPages > 1 && (
        <CPagination size="sm" className="mb-0">
          <CPaginationItem disabled={page === 1} onClick={() => onChange(page - 1)}>
            &lsaquo;
          </CPaginationItem>
          {buildPages(page, totalPages).map((p, i) =>
            p === '...' ? (
              <CPaginationItem key={`gap-${i}`} disabled>
                …
              </CPaginationItem>
            ) : (
              <CPaginationItem key={p} active={p === page} onClick={() => onChange(p)}>
                {p}
              </CPaginationItem>
            ),
          )}
          <CPaginationItem disabled={page === totalPages} onClick={() => onChange(page + 1)}>
            &rsaquo;
          </CPaginationItem>
        </CPagination>
      )}
    </div>
  )
}
