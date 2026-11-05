import React, { useMemo } from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import { CChartPie } from '@coreui/react-chartjs'
import { DashboardTaskPriorityDto } from 'src/types/dashboard'
import ChartEmpty from './ChartEmpty'
import { buildChartRows, hasAnyData } from './chartUtils'

const TASK_PRIORITY_LABELS: Record<string, string> = {
  Low: 'Thấp',
  Medium: 'Trung bình',
  High: 'Cao',
}

const PRIORITY_COLORS: Record<string, string> = {
  Low: '#54A3FF',
  Medium: '#FFC107',
  High: '#E55353',
}
const FALLBACK_COLOR = '#9DA5B1'

interface Props {
  data: DashboardTaskPriorityDto[]
}

const TaskPriorityChart: React.FC<Props> = ({ data }) => {
  const rows = useMemo(
    () => buildChartRows(data.map((i) => ({ key: i.priority, count: i.count })), TASK_PRIORITY_LABELS),
    [data],
  )

  return (
    <CCard className="h-100 shadow-sm border-0">
      <CCardHeader className="border-bottom-0 pt-4 px-4 pb-0 bg-transparent">
        <div className="fw-bold">Ưu tiên công việc</div>
      </CCardHeader>
      <CCardBody className="p-4">
        {hasAnyData(rows) ? (
          <CChartPie
            data={{
              labels: rows.map((r) => r.label),
              datasets: [
                {
                  backgroundColor: rows.map((r) => PRIORITY_COLORS[r.key] ?? FALLBACK_COLOR),
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

export default TaskPriorityChart