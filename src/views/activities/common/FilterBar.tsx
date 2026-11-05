import { ReactNode } from 'react'
import { CButton, CFormInput, CInputGroup, CInputGroupText } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'

interface CommonFilterValues {
  search: string
  fromDate: string
  toDate: string
}

interface Props {
  searchPlaceholder: string
  value: CommonFilterValues
  onChange: (patch: Partial<CommonFilterValues>) => void
  onApply: () => void
  onReset: () => void
  loading?: boolean
  children?: ReactNode
}

export default function FilterBar({
  searchPlaceholder,
  value,
  onChange,
  onApply,
  onReset,
  loading,
  children,
}: Props) {
  return (
    <div className="d-flex flex-wrap align-items-center gap-3">
      {/* Search Input */}
      <CInputGroup className="flex-grow-1" style={{ minWidth: '250px', maxWidth: '400px' }}>
        <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
        <CFormInput
          value={value.search}
          placeholder={searchPlaceholder}
          onChange={(e) => onChange({ search: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && onApply()}
        />
      </CInputGroup>

      {/* Date Range */}
      <CInputGroup style={{ width: 'auto' }}>
        <CFormInput
          type="date"
          value={value.fromDate}
          max={value.toDate || undefined}
          onChange={(e) => onChange({ fromDate: e.target.value })}
        />
        <CInputGroupText className="bg-light text-body-secondary px-2">-</CInputGroupText>
        <CFormInput
          type="date"
          value={value.toDate}
          min={value.fromDate || undefined}
          onChange={(e) => onChange({ toDate: e.target.value })}
        />
      </CInputGroup>

      {/* Selects from children */}
      <div className="d-flex flex-wrap gap-2 flex-grow-1">
        {children}
      </div>

      {/* Actions */}
      <div className="d-flex gap-2 ms-auto">
        <CButton color="light" variant="outline" onClick={onReset} disabled={loading}>
          Đặt lại
        </CButton>
        <CButton color="primary" onClick={onApply} disabled={loading} className="px-4">
          Lọc
        </CButton>
      </div>
    </div>
  )
}