import React from 'react'
import { CCard, CCardBody, CProgress } from '@coreui/react'
import { DashboardSummaryDto } from 'src/types/dashboard'

interface Props {
  summary: DashboardSummaryDto
}

const toPercent = (part: number, total: number): number =>
  total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0

const DashboardSummaryCard: React.FC<Props> = ({ summary }) => {
  const { totalTasks, completedTasks, inProgressTasks, overdueTasks } = summary

  const items = [
    { label: 'Tỉ lệ hoàn thành', value: toPercent(completedTasks, totalTasks), color: 'success' },
    { label: 'Tỉ lệ đang thực hiện', value: toPercent(inProgressTasks, totalTasks), color: 'primary' },
    { label: 'Tỉ lệ quá hạn', value: toPercent(overdueTasks, totalTasks), color: 'danger' },
  ]

  return (
    <CCard className="shadow-sm border-0">
      <CCardBody className="p-4">
        <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <div>
            <div className="fw-bold mb-1">Tóm tắt nhanh</div>
            <div className="text-muted small">
              Tính trên tổng {totalTasks.toLocaleString('vi-VN')} công việc hiện có
            </div>
          </div>
          <div className="d-flex gap-3 flex-wrap">
            {items.map((item) => (
              <div key={item.label} style={{ minWidth: '180px' }}>
                <div className="d-flex justify-content-between small mb-1">
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
                <CProgress value={item.value} color={item.color} height={6} />
              </div>
            ))}
          </div>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default DashboardSummaryCard