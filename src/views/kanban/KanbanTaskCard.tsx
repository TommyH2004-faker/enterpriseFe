import React from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCalendar, cilCommentSquare, cilPaperclip, cilUser } from '@coreui/icons'
import { KanbanTask } from 'src/types/KanbanType/kanban'


interface KanbanTaskCardProps {
  task: KanbanTask
  index: number
  onClick: (task: KanbanTask) => void
}

// const priorityColor = (priority?: string) => {
//   if (priority === 'Critical' || priority === 'Khẩn cấp') return 'danger'
//   if (priority === 'High' || priority === 'Cao') return 'warning'
//   if (priority === 'Medium' || priority === 'Trung bình') return 'info'
//   if (priority === 'Low' || priority === 'Thấp') return 'secondary'
//   return 'secondary'
// }
const priorityColor = (priority: number) => {
  switch (priority) {
    case 1:
      return 'secondary'
    case 2:
      return 'info'
    case 3:
      return 'warning'
    case 4:
      return 'danger'
    default:
      return 'secondary'
  }
}

export const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({ task, index, onClick }) => {
  const assigneeName = task.assignees?.[0]?.fullName
  const initial = assigneeName ? assigneeName.charAt(0).toUpperCase() : null

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="card border-0 shadow-sm mb-2 rounded-3 bg-white cursor-pointer"
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.9 : 1,
            boxShadow: snapshot.isDragging
              ? '0 12px 24px rgba(0,0,0,0.18)'
              : '0 1px 3px rgba(0,0,0,0.08)',
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform || ''} rotate(1.5deg)`
              : provided.draggableProps.style?.transform,
            transition: 'box-shadow 0.15s ease, opacity 0.15s ease',
          }}
          onClick={() => onClick(task)}
        >
          <div className="card-body p-3">
            {/* Header: ID and Priority */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted font-monospace" style={{ fontSize: '11px' }}>
                #{task.id.slice(-6)}
              </span>
              <CBadge color={priorityColor(task.priority  )} className="px-2 py-1">
                {task.priority || 'Trung bình'}
              </CBadge>
            </div>

            {/* Title */}
            <h6
              className="fw-bold text-dark mb-1"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
              }}
            >
              {task.title}
            </h6>

            {/* Description snippet */}
            {task.description && (
              <p
                className="small text-muted mb-3"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.4,
                }}
              >
                {task.description}
              </p>
            )}

            {/* Footer Metadata */}
            <div className="d-flex justify-content-between align-items-center text-muted small pt-2 border-top mt-2">
              {/* Assignee */}
              <div className="d-flex align-items-center gap-1 text-truncate" style={{ maxWidth: 130 }}>
                {initial ? (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: 22, height: 22, fontSize: 10, flexShrink: 0 }}
                    title={assigneeName || ''}
                  >
                    {initial}
                  </div>
                ) : (
                  <CIcon icon={cilUser} size="sm" className="text-secondary" />
                )}
                <span className="small text-truncate">{assigneeName || 'Chưa giao'}</span>
              </div>

              {/* Counters */}
              <div className="d-flex align-items-center gap-2">
                {task.commentCount ? (
                  <span className="d-inline-flex align-items-center text-secondary small">
                    <CIcon icon={cilCommentSquare} className="me-1" size="sm" />
                    {task.commentCount}
                  </span>
                ) : null}

                {task.attachmentCount ? (
                  <span className="d-inline-flex align-items-center text-secondary small">
                    <CIcon icon={cilPaperclip} className="me-1" size="sm" />
                    {task.attachmentCount}
                  </span>
                ) : null}

                {task.dueDate ? (
                  <span className="d-inline-flex align-items-center text-secondary small" title="Hạn chót">
                    <CIcon icon={cilCalendar} size="sm" />
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
