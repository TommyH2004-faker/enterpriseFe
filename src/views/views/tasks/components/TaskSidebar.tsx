import React from 'react'
import { CCard, CCardBody, CFormInput } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCalendar, cilChart, cilClock, cilUser } from '@coreui/icons'

import type { TaskDetailModel } from '../hooks/useTaskDetail'

interface Props {
  task: TaskDetailModel
  onDateChange: (field: 'startDate' | 'dueDate', value: string) => void
}

const toInputDate = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value.slice(0, 10) : date.toISOString().slice(0, 10)
}

const TaskSidebar: React.FC<Props> = ({ task, onDateChange }) => (
  <div className="d-flex flex-column gap-3">
    <CCard className="border-0 shadow-sm">
      <CCardBody>
        <h6 className="fw-semibold mb-3">Thông tin</h6>

        <div className="small text-body-secondary mb-1">
          <CIcon icon={cilUser} className="me-2" />
          Reporter
        </div>
        <div className="mb-3 text-break">{task.reporterId || '—'}</div>

        <div className="small text-body-secondary mb-1">
          <CIcon icon={cilChart} className="me-2" />
          Tiến độ
        </div>
        <div className="mb-3">{task.progress ?? 0}%</div>

        <div className="small text-body-secondary mb-1">Story Point</div>
        <div className="mb-3">{task.storyPoint ?? '—'}</div>

        <div className="small text-body-secondary mb-1">
          <CIcon icon={cilClock} className="me-2" />
          Estimate
        </div>
        <div>{task.estimateHour ?? '—'} giờ</div>
      </CCardBody>
    </CCard>

    <CCard className="border-0 shadow-sm">
      <CCardBody>
        <h6 className="fw-semibold mb-3">
          <CIcon icon={cilCalendar} className="me-2" />
          Lịch
        </h6>

        <label className="small text-body-secondary mb-1">Ngày bắt đầu</label>
        <CFormInput
          type="date"
          className="mb-3"
          value={toInputDate(task.startDate)}
          onChange={(e) => onDateChange('startDate', e.target.value)}
        />

        <label className="small text-body-secondary mb-1">Hạn hoàn thành</label>
        <CFormInput
          type="date"
          value={toInputDate(task.dueDate)}
          onChange={(e) => onDateChange('dueDate', e.target.value)}
        />
      </CCardBody>
    </CCard>
  </div>
)

export default TaskSidebar
