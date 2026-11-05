import React from 'react'
import { CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'

export type DashboardColor = 'primary' | 'info' | 'success' | 'warning' | 'danger'

export interface DashboardStatCardProps {
  title: string
  value: number
  icon: string | string[]
  color: DashboardColor
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({ title, value, icon, color }) => (
  <CCard className="h-100 shadow-sm border-0">
    <CCardBody className="p-4">
      <div className="mb-3">
        <div
          className={`bg-${color} bg-opacity-10 text-${color} rounded d-inline-flex align-items-center justify-content-center`}
          style={{ width: '48px', height: '48px' }}
        >
          <CIcon icon={icon} size="xl" />
        </div>
      </div>
      <div className="fw-bold" style={{ fontSize: '28px' }}>
        {Number.isFinite(value) ? value.toLocaleString('vi-VN') : 0}
      </div>
      <div
        className="text-uppercase text-muted small fw-semibold"
        style={{ letterSpacing: '0.03em' }}
      >
        {title}
      </div>
    </CCardBody>
  </CCard>
)

export default DashboardStatCard