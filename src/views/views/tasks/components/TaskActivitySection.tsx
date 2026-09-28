import React from 'react'
import { CCard, CCardBody, CListGroup, CListGroupItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHistory } from '@coreui/icons'

import type { TaskActivity } from '../hooks/useTaskDetail'

interface Props {
  activities: TaskActivity[]
}

const activityTypeLabel: Record<number, string> = {
  1: 'Project',
  2: 'Task',
  3: 'Comment',
  4: 'Attachment',
  5: 'Checklist',
  6: 'Milestone',
  7: 'Member',
  8: 'Message',
}

const TaskActivitySection: React.FC<Props> = ({ activities }) => (
  <CCard className="border-0 shadow-sm mb-3">
    <CCardBody>
      <h6 className="fw-semibold mb-3">
        <CIcon icon={cilHistory} className="me-2" />
        Hoạt động
      </h6>

      {activities.length === 0 ? (
        <div className="small text-body-secondary">Chưa có hoạt động.</div>
      ) : (
        <CListGroup flush>
          {activities.map((activity) => (
            <CListGroupItem key={activity.id} className="px-0">
              <div className="fw-semibold">
                {activity.title || activity.description || 'Hoạt động'}
              </div>
              <div className="small text-body-secondary">
                {activity.activityType
                  ? activityTypeLabel[activity.activityType] || `Activity ${activity.activityType}`
                  : ''}
                {activity.createdAt ? ` • ${new Date(activity.createdAt).toLocaleString('vi-VN')}` : ''}
              </div>
              {activity.title && activity.description && (
                <div className="small mt-1">{activity.description}</div>
              )}
            </CListGroupItem>
          ))}
        </CListGroup>
      )}
    </CCardBody>
  </CCard>
)

export default TaskActivitySection
