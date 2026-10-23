import { CButton, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilZoom } from '@coreui/icons'
import { AuditLogListItem } from 'src/types/auditLog'
import { formatDateTime, humanize, shortId } from 'src/views/activities/utils/logHelpers'
import ActorCell from 'src/views/activities/common/ActorCell'
import { ActionBadge, ModuleBadge } from 'src/views/activities/common/Badges'
import TableState from 'src/views/activities/common/TableState'
import {
  CTable,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'


interface Props {
  items: AuditLogListItem[]
  loading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
}

const HEADS = ['Thời gian', 'Người thực hiện', 'Hành động', 'Đối tượng', 'Mô tả', 'Module', 'Địa chỉ IP', 'Chi tiết']

export default function AuditTable({ items, loading, selectedId, onSelect }: Props) {
  return (
    <CTable align="middle" hover responsive className="mb-0">
      <CTableHead color="light">
        <CTableRow>
          {HEADS.map((h) => (
            <CTableHeaderCell key={h}>{h}</CTableHeaderCell>
          ))}
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {!loading &&
          items.map((r) => (
            <CTableRow key={r.id} active={r.id === selectedId}>
              <CTableDataCell className="text-nowrap">{formatDateTime(r.createdAt)}</CTableDataCell>
              <CTableDataCell>
                <ActorCell name={r.actorName} code={r.actorCode} avatarUrl={r.actorAvatarUrl} />
              </CTableDataCell>
              <CTableDataCell>
                <ActionBadge action={r.action} />
              </CTableDataCell>
              <CTableDataCell>
                <div className="fw-semibold">{humanize(r.entityType)}</div>
                <small className="text-body-secondary" title={r.entityId}>
                  {shortId(r.entityId)}
                </small>
              </CTableDataCell>
              <CTableDataCell style={{ maxWidth: 280 }}>{r.description}</CTableDataCell>
              <CTableDataCell>
                <ModuleBadge module={r.module} />
              </CTableDataCell>
              <CTableDataCell>{r.ipAddress ?? '-'}</CTableDataCell>
              <CTableDataCell>
                <CButton color="link" size="sm" className="p-0 text-nowrap" onClick={() => onSelect(r.id)}>
                  <CIcon icon={cilZoom} className="me-1" /> Xem chi tiết
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        <TableState
          colSpan={HEADS.length}
          loading={loading}
          empty={items.length === 0}
          emptyText="Không có bản ghi nào khớp với bộ lọc."
        />
      </CTableBody>
    </CTable>
  )
}
