import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import { ActivityLogListItem } from 'src/types/activityLog'

import ActorCell from '../common/ActorCell'
import TableState from '../common/TableState'
import ActivityTypeCell from './ActivityTypeCell'
import { formatDateTime, shortId } from '../utils/logHelpers'

interface Props {
  items: ActivityLogListItem[]
  loading: boolean
}

const HEADS = ['Thời gian', 'Nhân viên', 'Loại hoạt động', 'Nội dung', 'Mã đối tượng']

export default function ActivityTable({ items, loading }: Props) {
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
            <CTableRow key={r.id}>
              <CTableDataCell className="text-nowrap">{formatDateTime(r.createdAt, false)}</CTableDataCell>
              <CTableDataCell>
                <ActorCell name={r.employeeName} code={r.employeeCode} avatarUrl={r.avatarUrl} />
              </CTableDataCell>
              <CTableDataCell>
                <ActivityTypeCell type={r.activityType} />
              </CTableDataCell>
              <CTableDataCell style={{ maxWidth: 380 }}>
                <div className="fw-semibold">{r.title}</div>
                <small className="text-body-secondary">{r.description}</small>
              </CTableDataCell>
              <CTableDataCell>
                <small className="text-body-secondary" title={r.entityId}>
                  {shortId(r.entityId)}
                </small>
              </CTableDataCell>
            </CTableRow>
          ))}
        <TableState
          colSpan={HEADS.length}
          loading={loading}
          empty={items.length === 0}
          emptyText="Không có hoạt động nào khớp với bộ lọc."
        />
      </CTableBody>
    </CTable>
  )
}
