import React from 'react'
import { Droppable } from '@hello-pangea/dnd'
import { CBadge, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import { KanbanColumn, KanbanTask } from '../../types/Project'
import { KanbanTaskCard } from './KanbanTaskCard'

interface KanbanColumnViewProps {
  column: KanbanColumn
  tasks: KanbanTask[]
  onTaskClick: (task: KanbanTask) => void
  onAddTask: (columnId: string) => void
}

const columnDotColors: Record<string, string> = {
  'col-todo': '#6c757d',
  'col-in-progress': '#f59e0b',
  'col-review': '#0ea5e9',
  'col-done': '#10b981',
}

export const KanbanColumnView: React.FC<KanbanColumnViewProps> = ({
  column,
  tasks,
  onTaskClick,
  onAddTask,
}) => {
  const dotColor = column.color || columnDotColors[column.id] || '#4f46e5'

  return (
    <div
      className="rounded-3 p-2 bg-light d-flex flex-column"
      style={{
        width: 300,
        flexShrink: 0,
        backgroundColor: '#f1f3f5',
        border: '1px solid #e9ecef',
      }}
    >
      {/* Column Header */}
      <div className="d-flex justify-content-between align-items-center px-2 py-2 mb-1">
        <div className="d-flex align-items-center gap-2">
          <span
            className="rounded-circle"
            style={{ width: 10, height: 10, backgroundColor: dotColor }}
          />
          <strong className="text-dark small fw-bold">{column.name}</strong>
        </div>
        <CBadge color="secondary" className="px-2 py-1 bg-white text-secondary border">
          {tasks.length}
        </CBadge>
      </div>

      {/* Droppable Task Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="p-1 flex-grow-1"
            style={{
              minHeight: 220,
              backgroundColor: snapshot.isDraggingOver ? 'rgba(50,31,219,0.06)' : 'transparent',
              borderRadius: 8,
              transition: 'background-color 0.15s ease',
            }}
          >
            {tasks.map((task, index) => (
              <KanbanTaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={onTaskClick}
              />
            ))}
            {provided.placeholder}

            {/* Quick Add Task Button under the column */}
            <CButton
              color="light"
              size="sm"
              className="w-100 mt-2 text-secondary bg-white border-0 shadow-none d-flex align-items-center justify-content-center py-2 fw-medium"
              onClick={() => onAddTask(column.id)}
            >
              <CIcon icon={cilPlus} className="me-1" size="sm" /> Thêm công việc
            </CButton>
          </div>
        )}
      </Droppable>
    </div>
  )
}
