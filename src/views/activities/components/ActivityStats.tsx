import { CCol, CRow } from '@coreui/react'
import { cilCalendar, cilChartLine, cilLayers, cilUser } from '@coreui/icons'


import StatCard, { BigNumber, InlineStats } from '../common/StatCard'
import { topEntries } from '../utils/logHelpers'
import { ActivityLogStats } from 'src/types/activityLog'

export default function ActivityStats({ stats }: { stats: ActivityLogStats | null }) {
  return (
    <CRow className="g-3">
      <CCol md={6} xl={3}>
        <StatCard icon={cilChartLine} label="Tổng hoạt động">
          <BigNumber value={stats?.total} />
        </StatCard>
      </CCol>
      <CCol md={6} xl={2}>
        <StatCard icon={cilCalendar} label="Hôm nay">
          <BigNumber value={stats?.today} />
        </StatCard>
      </CCol>
      <CCol md={6} xl={4}>
        <StatCard icon={cilLayers} label="Hoạt động theo loại">
          <InlineStats items={topEntries(stats?.byActivityType, 4)} />
        </StatCard>
      </CCol>
      <CCol md={6} xl={3}>
        <StatCard icon={cilUser} label="Nhân viên hoạt động">
          <BigNumber value={stats?.activeEmployeeCount} />
        </StatCard>
      </CCol>
    </CRow>
  )
}
