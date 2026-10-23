import { CSpinner, CTableDataCell, CTableRow } from '@coreui/react'

interface Props {
  colSpan: number
  loading: boolean
  empty: boolean
  emptyText: string
}

/** Dòng trạng thái đặt trong <CTableBody>: đang tải / không có dữ liệu. */
export default function TableState({ colSpan, loading, empty, emptyText }: Props) {
  if (!loading && !empty) return null
  return (
    <CTableRow>
      <CTableDataCell colSpan={colSpan} className="text-center text-body-secondary py-5">
        {loading ? <CSpinner size="sm" className="me-2" /> : null}
        {loading ? 'Đang tải dữ liệu...' : emptyText}
      </CTableDataCell>
    </CTableRow>
  )
}
