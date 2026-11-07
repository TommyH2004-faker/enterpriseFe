import React from 'react'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import { TasksOverTimeReportDto } from 'src/types/reports'

interface TasksOverTimeChartCardProps {
  report: TasksOverTimeReportDto
  expanded?: boolean
}

const TasksOverTimeChartCard: React.FC<TasksOverTimeChartCardProps> = ({
  report,
  expanded = false,
}) => {
  const points = report.points ?? []
  const labels = points.map((p) => p.label)
  const createdSeries = points.map((p) => p.createdCount)
  const completedSeries = points.map((p) => p.completedCount)
  const overdueSeries = points.map((p) => p.overdueCount)

  const updatedLabel = report.generatedAt
    ? new Date(report.generatedAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Vừa xong'

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader className="bg-white d-flex justify-content-between align-items-center">
        <strong>Công việc theo thời gian</strong>
        <CBadge color="light" className="text-dark border">
          {report.rangeLabel}
        </CBadge>
      </CCardHeader>
      <CCardBody>
        <CChartLine
          style={{ height: expanded ? '340px' : '300px' }}
          data={{
            labels,
            datasets: [
              {
                label: 'Công việc tạo mới',
                backgroundColor: 'rgba(50, 31, 219, 0.08)',
                borderColor: '#321FDB',
                pointBackgroundColor: '#321FDB',
                tension: 0.3,
                fill: true,
                data: createdSeries,
              },
              {
                label: 'Công việc hoàn thành',
                backgroundColor: 'rgba(46, 216, 182, 0.08)',
                borderColor: '#2ED8B6',
                pointBackgroundColor: '#2ED8B6',
                tension: 0.3,
                fill: true,
                data: completedSeries,
              },
              ...(expanded
                ? [
                    {
                      label: 'Công việc quá hạn',
                      backgroundColor: 'transparent',
                      borderColor: '#E55353',
                      pointBackgroundColor: '#E55353',
                      borderDash: [5, 5],
                      tension: 0.3,
                      data: overdueSeries,
                    },
                  ]
                : []),
            ],
          }}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                },
              },
            },
          }}
        />

        <div className="d-flex flex-wrap gap-3 mt-3 text-muted small">
          <span>Updated: {updatedLabel}</span>
          <span>Source: {report.sourceLabel || 'Tasks + Projects'}</span>
          <span>Range: {report.rangeLabel}</span>
        </div>

        {expanded && points.length > 0 && (
          <div className="mt-4">
            <h6 className="fw-semibold mb-3">Chi tiết số lượng theo từng kỳ</h6>
            <CTable hover responsive bordered className="mb-0 align-middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Kỳ báo cáo</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">
                    Công việc tạo mới
                  </CTableHeaderCell>
                  <CTableHeaderCell className="text-center">
                    Công việc hoàn thành
                  </CTableHeaderCell>
                  <CTableHeaderCell className="text-center">
                    Công việc quá hạn
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {points.map((pt) => (
                  <CTableRow key={pt.periodKey + pt.label}>
                    <CTableDataCell className="fw-semibold">
                      {pt.label}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CBadge color="primary">{pt.createdCount}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CBadge color="success">{pt.completedCount}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      {pt.overdueCount > 0 ? (
                        <CBadge color="danger">{pt.overdueCount}</CBadge>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default TasksOverTimeChartCard
