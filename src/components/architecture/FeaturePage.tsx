import React from 'react'
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'

export type FeatureStat = {
  label: string
  value: string
  hint?: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
}

export type FeatureItem = {
  label: string
  value: string
  meta?: string
  badge?: string
  badgeColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
}

export type FeatureSection = {
  title: string
  subtitle?: string
  items: FeatureItem[]
}

export type FeatureTable = {
  columns: string[]
  rows: string[][]
}

type FeaturePageProps = {
  title: string
  subtitle: string
  actions?: string[]
  stats?: FeatureStat[]
  sections?: FeatureSection[]
  table?: FeatureTable
}

const colorClassMap: Record<NonNullable<FeatureStat['color']>, string> = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  secondary: 'secondary',
}

const FeaturePage: React.FC<FeaturePageProps> = ({ title, subtitle, actions = [], stats = [], sections = [], table }) => {
  return (
    <div className="py-2">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1 text-light">{title}</h1>
          <div className="text-muted">{subtitle}</div>
        </div>
        {actions.length > 0 && (
          <div className="d-flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <CButton key={action} color={index === 0 ? 'primary' : 'secondary'} variant={index === 0 ? 'outline' : 'outline'} size="sm">
                {action}
              </CButton>
            ))}
          </div>
        )}
      </div>

      {stats.length > 0 && (
        <CRow className="g-3 mb-4">
          {stats.map((stat) => (
            <CCol xs={12} sm={6} xl={stats.length > 4 ? 3 : 4} key={stat.label}>
              <CCard className="h-100 shadow-sm border-0">
                <CCardBody className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className={`bg-${colorClassMap[stat.color ?? 'primary']} bg-opacity-10 text-${colorClassMap[stat.color ?? 'primary']} rounded d-inline-flex align-items-center justify-content-center`} style={{ width: '48px', height: '48px' }}>
                      <strong>{stat.label.charAt(0)}</strong>
                    </div>
                    {stat.hint && <CBadge color={stat.color ?? 'secondary'} shape="rounded-pill">{stat.hint}</CBadge>}
                  </div>
                  <div className="fw-bold" style={{ fontSize: '28px' }}>{stat.value}</div>
                  <div className="text-uppercase text-muted small fw-semibold" style={{ letterSpacing: '0.04em' }}>{stat.label}</div>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      )}

      {sections.length > 0 && (
        <CRow className="g-4 mb-4">
          {sections.map((section) => (
            <CCol xs={12} lg={6} key={section.title}>
              <CCard className="h-100 shadow-sm border-0">
                <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0">
                  <div className="fw-bold text-light">{section.title}</div>
                  {section.subtitle && <div className="text-muted small mt-1">{section.subtitle}</div>}
                </CCardHeader>
                <CCardBody className="p-4">
                  <div className="d-grid gap-3">
                    {section.items.map((item) => (
                      <div key={item.label} className="d-flex justify-content-between align-items-start gap-3 pb-3 border-bottom">
                        <div>
                          <div className="fw-semibold text-light">{item.label}</div>
                          {item.meta && <div className="text-muted small">{item.meta}</div>}
                        </div>
                        <div className="text-end">
                          <div className="fw-semibold text-light">{item.value}</div>
                          {item.badge && <CBadge color={item.badgeColor ?? 'secondary'} shape="rounded-pill">{item.badge}</CBadge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      )}

      {table && (
        <CCard className="shadow-sm border-0">
          <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0">
            <div className="fw-bold text-dark">Bảng dữ liệu</div>
          </CCardHeader>
          <CCardBody className="p-0">
            <div className="table-responsive">
              <CTable hover className="mb-0 align-middle">
                <CTableHead>
                  <CTableRow>
                    {table.columns.map((column) => (
                      <CTableHeaderCell key={column}>{column}</CTableHeaderCell>
                    ))}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {table.rows.map((row, rowIndex) => (
                    <CTableRow key={`${row[0] ?? 'row'}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <CTableDataCell key={`${cell}-${cellIndex}`}>{cell}</CTableDataCell>
                      ))}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      )}
    </div>
  )
}

export default React.memo(FeaturePage)