import React from 'react'
import { CBadge, CCard, CCardBody, CCol, CRow } from '@coreui/react'
import { ReportKpiSummaryDto } from 'src/types/reports'

interface ReportsKpiCardsProps {
  kpi: ReportKpiSummaryDto
}

const ReportsKpiCards: React.FC<ReportsKpiCardsProps> = ({ kpi }) => {
  const cards = [
    {
      label: 'Báo cáo có thể xuất',
      value: kpi.exportableReportsCount,
      sub: `${kpi.totalProjects} dự án · ${kpi.totalTasks} công việc`,
      color: 'primary',
    },
    {
      label: 'On track',
      value: kpi.onTrackProjects,
      sub: `Hoàn thành chung: ${kpi.overallCompletionRate}%`,
      color: 'success',
    },
    {
      label: 'At risk',
      value: kpi.atRiskProjects,
      sub: `${kpi.inProgressTasks} việc đang thực hiện`,
      color: 'warning',
    },
    {
      label: 'Behind',
      value: kpi.behindProjects,
      sub: `${kpi.overdueTasks} việc quá hạn`,
      color: 'danger',
    },
  ]

  return (
    <CRow className="g-3 mb-4">
      {cards.map((item) => (
        <CCol xs={12} sm={6} xl={3} key={item.label}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardBody className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <div className="text-uppercase text-muted small fw-semibold">
                  {item.label}
                </div>
                <div className="fw-bold text-dark" style={{ fontSize: '28px' }}>
                  {item.value}
                </div>
                <div className="text-muted small mt-1">{item.sub}</div>
              </div>
              <CBadge color={item.color} shape="rounded-pill">
                Live
              </CBadge>
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>
  )
}

export default ReportsKpiCards
