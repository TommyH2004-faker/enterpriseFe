import { ReactNode } from 'react'
import { CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { formatNumber } from '../utils/logHelpers'


interface Props {
  icon: string | string[]
  label: string
  children: ReactNode
}

export default function StatCard({ icon, label, children }: Props) {
  return (
    <CCard className="h-100">
      <CCardBody className="d-flex align-items-center gap-3">
        <div
          className="d-flex align-items-center justify-content-center rounded-3 bg-info-subtle text-info flex-shrink-0"
          style={{ width: 56, height: 56 }}
        >
          <CIcon icon={icon} size="xl" />
        </div>
        <div className="min-w-0">
          <div className="small text-body-secondary">{label}</div>
          {children}
        </div>
      </CCardBody>
    </CCard>
  )
}

export function BigNumber({ value }: { value?: number }) {
  return <div className="fs-3 fw-bold">{formatNumber(value)}</div>
}

export interface InlineStatItem {
  label: string
  value?: number
  color?: string // màu chấm CoreUI: success | primary | danger ...
}

export function InlineStats({ items }: { items: InlineStatItem[] }) {
  return (
    <div className="d-flex flex-wrap align-items-center column-gap-3 small">
      {items.map((it) => (
        <span key={it.label} className="d-inline-flex align-items-center gap-1">
          {it.color && <span className={`d-inline-block rounded-circle bg-${it.color}`} style={{ width: 8, height: 8 }} />}
          {it.label} <b>{formatNumber(it.value)}</b>
        </span>
      ))}
    </div>
  )
}
