import React from 'react'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CProgress,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { CChartBar } from '@coreui/react-chartjs'
import {
  CustomReportDisplayMode,
  CustomReportGroupBy,
  CustomReportRowDto,
} from 'src/types/reports'

interface CustomReportCardProps {
  rows: CustomReportRowDto[]
  groupBy: CustomReportGroupBy
  displayMode: CustomReportDisplayMode
  loading: boolean
  expanded?: boolean
  onGroupByChange: (groupBy: CustomReportGroupBy) => void
  onDisplayModeChange: (mode: CustomReportDisplayMode) => void
}

const GROUP_OPTIONS: Array<{
  key: CustomReportGroupBy
  label: string
  color: string
}> = [
  { key: 'project', label: 'By Project', color: 'primary' },
  { key: 'department', label: 'By Department', color: 'secondary' },
  { key: 'employee', label: 'By Employee', color: 'info' },
  { key: 'priority', label: 'By Priority', color: 'danger' },
  { key: 'status', label: 'By Status', color: 'success' },
]

const DISPLAY_OPTIONS: Array<{
  key: CustomReportDisplayMode
  label: string
}> = [
  { key: 'table', label: 'Table' },
  { key: 'chart', label: 'Chart' },
  { key: 'both', label: 'Table / Chart / Both' },
]

const CustomReportCard: React.FC<CustomReportCardProps> = ({
  rows,
  groupBy,
  displayMode,
  loading,
  expanded = false,
  onGroupByChange,
  onDisplayModeChange,
}) => {
  const displayedRows = expanded ? rows : rows.slice(0, 5)

  return (
    <CCard className="shadow-sm border-0 h-100">
      <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <strong>Báo cáo tùy chỉnh</strong>
        {loading && <CSpinner size="sm" color="primary" />}
      </CCardHeader>
      <CCardBody className="p-4">
        <div className="text-muted small mb-3">
          Chọn chỉ số, nhóm dữ liệu và kiểu hiển thị để build report theo nhu
          cầu.
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {GROUP_OPTIONS.map((item) => {
            const isActive = groupBy === item.key
            return (
              <CBadge
                key={item.key}
                color={isActive ? item.color : 'light'}
                className={isActive ? '' : 'text-dark border'}
                shape="rounded-pill"
                role="button"
                onClick={() => onGroupByChange(item.key)}
                style={{ cursor: 'pointer', padding: '6px 12px' }}
              >
                {item.label}
              </CBadge>
            )
          })}

          {DISPLAY_OPTIONS.map((mode) => {
            const isActive = displayMode === mode.key
            return (
              <CBadge
                key={mode.key}
                color={isActive ? 'warning' : 'light'}
                className={isActive ? 'text-dark' : 'text-dark border'}
                shape="rounded-pill"
                role="button"
                onClick={() => onDisplayModeChange(mode.key)}
                style={{ cursor: 'pointer', padding: '6px 12px' }}
              >
                {mode.label}
              </CBadge>
            )
          })}
        </div>

        {(displayMode === 'chart' || displayMode === 'both') &&
          displayedRows.length > 0 && (
            <div className="mb-3">
              <CChartBar
                style={{ height: expanded ? '280px' : '190px' }}
                data={{
                  labels: displayedRows.map((r) => r.name),
                  datasets: [
                    {
                      label: 'Tổng công việc',
                      backgroundColor: '#321FDB',
                      data: displayedRows.map((r) => r.totalTasks),
                    },
                    {
                      label: 'Hoàn thành',
                      backgroundColor: '#2EB85C',
                      data: displayedRows.map((r) => r.completedTasks),
                    },
                    {
                      label: 'Quá hạn',
                      backgroundColor: '#E55353',
                      data: displayedRows.map((r) => r.overdueTasks),
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 },
                    },
                  },
                }}
              />
            </div>
          )}

        {(displayMode === 'table' || displayMode === 'both') && (
          <CTable small hover responsive className="mb-0 align-middle">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Nhóm dữ liệu</CTableHeaderCell>
                <CTableHeaderCell className="text-center">
                  Hoàn thành / Tổng
                </CTableHeaderCell>
                <CTableHeaderCell className="text-center">
                  Quá hạn
                </CTableHeaderCell>
                <CTableHeaderCell style={{ minWidth: '140px' }}>
                  Tỷ lệ
                </CTableHeaderCell>
                <CTableHeaderCell className="text-center">
                  Đánh giá
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {displayedRows.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center text-muted">
                    Không có dữ liệu phù hợp.
                  </CTableDataCell>
                </CTableRow>
              ) : (
                displayedRows.map((row) => (
                  <CTableRow key={row.key}>
                    <CTableDataCell>
                      <div className="fw-semibold text-dark">{row.name}</div>
                      <div className="text-muted small">{row.subtitle}</div>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      {row.completedTasks} / {row.totalTasks}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      {row.overdueTasks > 0 ? (
                        <span className="text-danger fw-bold">
                          {row.overdueTasks}
                        </span>
                      ) : (
                        <span className="text-success">0</span>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
                        <span className="me-2 small fw-bold">
                          {row.completionRate}%
                        </span>
                        <CProgress
                          value={row.completionRate}
                          color={row.statusColor as any}
                          className="flex-grow-1"
                          height={5}
                        />
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CBadge color={row.statusColor as any}>
                        {row.statusLabel}
                      </CBadge>
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default CustomReportCard
