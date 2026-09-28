import React, { useMemo } from 'react'
import { CBadge, CCard, CCardBody, CFormCheck, CProgress, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilList } from '@coreui/icons'

import type { TaskChecklist } from '../hooks/useTaskDetail'

interface Props {
  items: TaskChecklist[]
  saving?: boolean
  onToggle: (id: string, completed: boolean) => Promise<unknown> | void
}

const TaskChecklistSection: React.FC<Props> = ({ items, saving = false, onToggle }) => {
  const completed = useMemo(
    () => items.filter((item) => Boolean(item.isCompleted)).length,
    [items],
  )
  const percent = items.length ? Math.round((completed / items.length) * 100) : 0

  return (
    <CCard className="border-0 shadow-sm mb-3">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 fw-semibold">
            <CIcon icon={cilList} className="me-2" />
            Checklist
          </h6>
          <CBadge color="light" textColor="dark">{completed}/{items.length}</CBadge>
        </div>

        <CProgress height={6} value={percent} className="mb-3" />

        {items.length === 0 ? (
          <div className="small text-body-secondary">Chưa có checklist.</div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {items.map((item) => (
              <CFormCheck
                key={item.id}
                id={`checklist-${item.id}`}
                checked={Boolean(item.isCompleted)}
                disabled={saving}
                onChange={(e) => void onToggle(item.id, e.target.checked)}
                label={item.title || item.name || 'Checklist'}
              />
            ))}
          </div>
        )}

        {saving && items.length > 0 && (
          <div className="small text-body-secondary mt-2">
            <CSpinner size="sm" className="me-1" /> Đang cập nhật...
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default TaskChecklistSection
