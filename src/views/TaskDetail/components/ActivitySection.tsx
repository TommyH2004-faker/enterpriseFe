import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilHistory } from '@coreui/icons'
import { TaskActivityResponse } from 'src/types/TaskDetailType/activity'

interface ActivitySectionProps { activities: TaskActivityResponse[] }

export const ActivitySection: React.FC<ActivitySectionProps> = ({ activities }) => (
  <div>
    <h6 className="fw-bold mb-3 text-dark d-flex align-items-center">
      <CIcon icon={cilHistory} className="me-2 text-muted" /> Lịch sử hoạt động
    </h6>
    <div className="border-start border-2 ms-2 ps-3 py-1">
      {activities.map((log) => (
        <div key={log.id} className="mb-3 position-relative">
          <div className="position-absolute bg-primary rounded-circle" style={{ width: 8, height: 8, left: -21, top: 6 }} />
          <div className="text-muted small">
            <strong className="text-dark">{log.employeeId}</strong> {log.title}
            <span className="text-muted ms-2" style={{ fontSize: '11px' }}>
              {new Date(log.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="small text-muted mt-1 fst-italic">{log.description}</div>
        </div>
      ))}
      {activities.length === 0 && <span className="small text-muted">Chưa có lịch sử.</span>}
    </div>
  </div>
)