
import { CCol, CRow } from '@coreui/react'
import { cilClipboard, cilPencil, cilLayers } from '@coreui/icons'

import { AuditLogStats } from 'src/types/auditLog'
import { topEntries } from 'src/views/activities/utils/logHelpers'
import StatCard, {
  BigNumber,
  InlineStats,
} from 'src/views/activities/common/StatCard'

interface AuditStatsProps {
  stats: AuditLogStats | null
}

export default function AuditStats({ stats }: AuditStatsProps) {
  return (
    <CRow className="g-3 align-items-stretch">
      {/* Tổng số bản ghi */}
      <CCol xs={12} md={6} xl={4}>
        <StatCard icon={cilClipboard} label="Tổng bản ghi">
          <BigNumber value={stats?.total} />
        </StatCard>
      </CCol>

      {/* Hành động phổ biến */}
      <CCol xs={12} md={6} xl={4}>
        <StatCard icon={cilPencil} label="Hành động nhiều nhất">
          <InlineStats items={topEntries(stats?.byAction, 3)} />
        </StatCard>
      </CCol>

      {/* Thống kê theo module */}
      <CCol xs={12} md={6} xl={4}>
        <StatCard icon={cilLayers} label="Module">
          <InlineStats items={topEntries(stats?.byModule, 4)} />
        </StatCard>
      </CCol>
    </CRow>
  )
}
