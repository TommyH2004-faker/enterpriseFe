
import React from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilCommentSquare,
  cilPaperclip,
  cilUser,
} from '@coreui/icons'
import { KanbanTask } from 'src/types/KanbanType/kanban'

interface KanbanTaskCardProps {
  task: KanbanTask
  index: number
  members?: Array<{
    id: string
    name: string
    email?: string
    [key: string]: any
  }>
  onClick: (task: KanbanTask) => void
}

/**
 * Backend hiện tại:
 *
 * Low    = 1
 * Medium = 2
 * High   = 3
 *
 * API Kanban đang trả:
 *
 * "Low"
 * "Medium"
 * "High"
 */
const normalizePriority = (priority: string | number): string => {
  switch (String(priority).toLowerCase().trim()) {
    case '1':
    case 'low':
      return 'low'

    case '2':
    case 'medium':
      return 'medium'

    case '3':
    case 'high':
      return 'high'

    default:
      return 'low'
  }
}

const priorityColor = (priority: string | number) => {
  switch (normalizePriority(priority)) {
    case 'low':
      return 'secondary'

    case 'medium':
      return 'info'

    case 'high':
      return 'warning'

    default:
      return 'secondary'
  }
}

const priorityLabel = (priority: string | number) => {
  switch (normalizePriority(priority)) {
    case 'low':
      return 'Thấp'

    case 'medium':
      return 'Trung bình'

    case 'high':
      return 'Cao'

    default:
      return 'Thấp'
  }
}

export const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
  task,
  index,
  members = [],
  onClick,
}) => {
  

  // 1. Kiểm tra trực tiếp string name
  let assigneeName: string | null =
    (task as any)?.assigneeName ||
    (typeof (task as any)?.assignee === 'string'
      ? (task as any).assignee
      : null) ||
    null

  // 2. Kiểm tra mảng assignees object
  if (
    !assigneeName &&
    Array.isArray(task.assignees) &&
    task.assignees.length > 0
  ) {
    const first = task.assignees[0] as any

    assigneeName =
      first.fullName ||
      first.name ||
      first.userName ||
      first.email ||
      null
  }

  // 3. Tra cứu theo assigneeIds / employeeIds
  if (!assigneeName && members && members.length > 0) {
    const rawIds =
      (task as any)?.assigneeIds ||
      (task as any)?.employeeIds ||
      (Array.isArray(task.assignees)
        ? task.assignees.map(
            (a: any) => a?.id || a?.userId,
          )
        : [])

    if (Array.isArray(rawIds) && rawIds.length > 0) {
      const firstId = String(rawIds[0]).toLowerCase()

      const found = members.find(
        (m) =>
          String(m.id).toLowerCase() === firstId ||
          String(m.userId || '').toLowerCase() === firstId ||
          String(m.employeeId || '').toLowerCase() === firstId,
      )

      if (found) {
        assigneeName =
          found.name ||
          (found as any).fullName ||
          null
      }
    }
  }

  const totalAssignees =
    Array.isArray(task.assignees) && task.assignees.length > 0
      ? task.assignees.length
      : Array.isArray((task as any)?.assigneeIds)
        ? (task as any).assigneeIds.length
        : 0

  const extraCount =
    totalAssignees > 1
      ? ` +${totalAssignees - 1}`
      : ''

  const displayLabel =
    assigneeName
      ? `${assigneeName}${extraCount}`
      : 'Chưa giao'

  const initial = assigneeName
    ? assigneeName.trim().charAt(0).toUpperCase()
    : null

  return (
    <Draggable
      draggableId={task.id}
      index={index}
    >
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
              ? `${
                  provided.draggableProps.style?.transform || ''
                } rotate(1.5deg)`
              : provided.draggableProps.style?.transform,
            transition:
              'box-shadow 0.15s ease, opacity 0.15s ease',
          }}
          onClick={() => onClick(task)}
        >
          <div className="card-body p-3">

            {/* Header: ID and Priority */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span
                className="small text-muted font-monospace"
                style={{ fontSize: '11px' }}
              >
                #{task.id ? task.id.slice(-6).toUpperCase() : ''}
              </span>

              <CBadge
                color={priorityColor(task.priority)}
                className="px-2 py-1"
              >
                {priorityLabel(task.priority)}
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
              Tên công việc :{task.title}
            </h6>

            {/* Description */}
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
                Mô tả : {task.description}
              </p>
            )}
            {/* Người tạo task */}
            <div className="d-flex align-items-center gap-2 mt-2">
              <span className="text-muted small">
                Người tạo:
              </span>

              <span className="text-dark small fw-semibold">
                {task.reporterName || 'Không xác định'}
              </span>
            </div>
            {/* Footer Metadata */}
            <div className="d-flex justify-content-between align-items-center text-muted small pt-2 border-top mt-2">

              {/* Assignee */}
              <div
                className="d-flex align-items-center gap-1 text-truncate"
                style={{ maxWidth: 140 }}
              >
                {initial ? (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: 22,
                      height: 22,
                      fontSize: 10,
                      flexShrink: 0,
                    }}
                    title={displayLabel}
                  >
                    {initial}
                  </div>
                ) : (
                  <CIcon
                    icon={cilUser}
                    size="sm"
                    className="text-secondary"
                  />
                )}

                <span className="small text-truncate fw-medium text-dark">
                  {displayLabel}
                </span>
              </div>

              {/* Counters */}
              <div className="d-flex align-items-center gap-2">

                {task.commentCount ? (
                  <span className="d-inline-flex align-items-center text-secondary small">
                    <CIcon
                      icon={cilCommentSquare}
                      className="me-1"
                      size="sm"
                    />
                    {task.commentCount}
                  </span>
                ) : null}

                {task.attachmentCount ? (
                  <span className="d-inline-flex align-items-center text-secondary small">
                    <CIcon
                      icon={cilPaperclip}
                      className="me-1"
                      size="sm"
                    />
                    {task.attachmentCount}
                  </span>
                ) : null}

                {task.dueDate ? (
                  <span
                    className="d-inline-flex align-items-center text-secondary small"
                    title="Hạn chót"
                  >
                    <CIcon
                      icon={cilCalendar}
                      size="sm"
                    />
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


