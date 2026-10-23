import { CCol, CRow } from '@coreui/react'
import { cilClipboard, cilLayers, cilPencil, cilPeople } from '@coreui/icons'
import { AuditLogStats } from 'src/types/auditLog'
import { topEntries } from 'src/views/activities/utils/logHelpers'
import StatCard, { BigNumber, InlineStats } from 'src/views/activities/common/StatCard'


export default function AuditStats({ stats }: { stats: AuditLogStats | null }) {
  return (
    <CRow className="g-3">
      <CCol md={6} xl={2}>
        <StatCard icon={cilClipboard} label="Tổng bản ghi">
          <BigNumber value={stats?.total} />
        </StatCard>
      </CCol>
      <CCol md={6} xl={4}>
        <StatCard icon={cilPencil} label="Hành động nhiều nhất">
          <InlineStats items={topEntries(stats?.byAction, 3)} />
        </StatCard>
      </CCol>
      <CCol md={6} xl={4}>
        <StatCard icon={cilLayers} label="Module">
          <InlineStats items={topEntries(stats?.byModule, 4)} />
        </StatCard>
      </CCol>
      <CCol md={6} xl={2}>
        <StatCard icon={cilPeople} label="Người thực hiện">
          <BigNumber value={stats?.actorCount} />
        </StatCard>
      </CCol>
    </CRow>
  )
}
