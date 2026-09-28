import React from 'react'
import { CBadge, CButton, CFormSelect, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowRight, cilSave } from '@coreui/icons'

import type { TaskDetailModel } from '../hooks/useTaskDetail'

interface Props {
  task: TaskDetailModel
  columns?: Array<{ id: string; name: string }>
  saving?: boolean
  onClose: () => void
  onSave: () => void
  onMove: (columnId: string) => void
  onPriorityChange: (priority: number) => void
}

const priorityLabel: Record<number, string> = {
  1: 'Thấp',
  2: 'Trung bình',
  3: 'Cao',
  4: 'Khẩn cấp',
}

const priorityColor: Record<number, string> = {
  1: 'secondary',
  2: 'info',
  3: 'warning',
  4: 'danger',
}

const TaskDetailHeader: React.FC<Props> = ({
  task,
  columns = [],
  saving = false,
  onClose,
  onSave,
  onMove,
  onPriorityChange,
}) => (
  <div className="border-bottom px-4 py-3 bg-white">
    <div className="d-flex justify-content-between align-items-start gap-3">
      <div className="min-w-0">
        <div className="small text-body-secondary mb-1">
          Task #{task.id.slice(0, 8)}
        </div>
        <h5 className="mb-2 fw-semibold text-truncate">{task.title}</h5>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <CBadge color={priorityColor[task.priority] || 'secondary'}>
            {priorityLabel[task.priority] || `Priority ${task.priority}`}
          </CBadge>

          {task.progress !== undefined && (
            <CBadge color="light" textColor="dark">
              Tiến độ {task.progress}%
            </CBadge>
          )}

          {task.isArchived && <CBadge color="dark">Archived</CBadge>}
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 flex-shrink-0">
        {columns.length > 0 && (
          <CFormSelect
            size="sm"
            value={task.columnId}
            onChange={(e) => onMove(e.target.value)}
            aria-label="Chuyển cột"
            disabled={saving}
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.name}
              </option>
            ))}
          </CFormSelect>
        )}

        <CFormSelect
          size="sm"
          value={task.priority}
          onChange={(e) => onPriorityChange(Number(e.target.value))}
          aria-label="Độ ưu tiên"
          disabled={saving}
        >
          <option value={1}>Thấp</option>
          <option value={2}>Trung bình</option>
          <option value={3}>Cao</option>
          <option value={4}>Khẩn cấp</option>
        </CFormSelect>

        <CButton color="primary" size="sm" onClick={onSave} disabled={saving}>
          {saving ? <CSpinner size="sm" /> : <CIcon icon={cilSave} />}
        </CButton>

        <CButton color="light" size="sm" onClick={onClose} disabled={saving}>
          <span aria-hidden="true" className="fs-5 lh-1">×</span>
        </CButton>
      </div>
    </div>

    {columns.length > 0 && (
      <div className="small text-body-secondary mt-2">
        <CIcon icon={cilArrowRight} className="me-1" />
        Thay đổi cột sẽ gọi API Move Task riêng.
      </div>
    )}
  </div>
)

export default TaskDetailHeader
