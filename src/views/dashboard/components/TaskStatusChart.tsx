import React, { useMemo } from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import { CChartDoughnut } from '@coreui/react-chartjs'
import { DashboardTaskStatusDto } from 'src/types/dashboard'
import ChartEmpty from './ChartEmpty'
import { buildChartRows, hasAnyData } from './chartUtils'

const TASK_STATUS_LABELS: Record<string, string> = {
  Todo: 'Chưa bắt đầu',
  InProgress: 'Đang thực hiện',
  Review: 'Đang review',
  Done: 'Hoàn thành',
}

const STATUS_COLORS: Record<string, string> = {
  Todo: '#E8EAED',
  InProgress: '#321FDB',
  Review: '#FFC107',
  Done: '#2ED8B6',
}
const FALLBACK_COLORS = ['#6F42C1', '#E55353', '#54A3FF', '#20C997']

interface Props {
  data: DashboardTaskStatusDto[]
}

const TaskStatusChart: React.FC<Props> = ({ data }) => {
  const rows = useMemo(
    () => buildChartRows(data.map((i) => ({ key: i.status, count: i.count })), TASK_STATUS_LABELS),
    [data],
  )

  return (
    <CCard className="h-100 shadow-sm border-0">
      <CCardHeader className="border-bottom-0 pt-4 px-4 pb-0 bg-transparent">
        <div className="fw-bold">Công việc theo trạng thái</div>
      </CCardHeader>
      <CCardBody className="p-4">
        {hasAnyData(rows) ? (
          <CChartDoughnut
            data={{
              labels: rows.map((r) => r.label),
              datasets: [
                {
                  backgroundColor: rows.map(
                    (r, i) => STATUS_COLORS[r.key] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
                  ),
                  data: rows.map((r) => r.count),
                  borderWidth: 0,
                },
              ],
            }}
            options={{ plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } } }}
          />
        ) : (
          <ChartEmpty />
        )}
      </CCardBody>
    </CCard>
  )
}

export default TaskStatusChart