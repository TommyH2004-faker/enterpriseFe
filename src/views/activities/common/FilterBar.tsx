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
  children?: ReactNode // các FilterSelect
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
    <div className="d-flex flex-wrap align-items-center gap-2">
      <CInputGroup style={{ flex: '1 1 280px', maxWidth: 420 }}>
        <CInputGroupText>
          <CIcon icon={cilSearch} />
        </CInputGroupText>
        <CFormInput
          value={value.search}
          placeholder={searchPlaceholder}
          onChange={(e) => onChange({ search: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && onApply()}
        />
      </CInputGroup>

      <div className="d-flex align-items-center gap-1">
        <CFormInput
          type="date"
          value={value.fromDate}
          max={value.toDate || undefined}
          onChange={(e) => onChange({ fromDate: e.target.value })}
        />
        <span className="text-body-secondary">-</span>
        <CFormInput
          type="date"
          value={value.toDate}
          min={value.fromDate || undefined}
          onChange={(e) => onChange({ toDate: e.target.value })}
        />
      </div>

      {children}

      <CButton color="light" variant="outline" onClick={onReset} disabled={loading}>
        Đặt lại
      </CButton>
      <CButton color="primary" onClick={onApply} disabled={loading}>
        Lọc
      </CButton>
    </div>
  )
}
