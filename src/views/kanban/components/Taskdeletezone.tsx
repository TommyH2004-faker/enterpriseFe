import React from 'react'
import { Droppable } from '@hello-pangea/dnd'
import CIcon from '@coreui/icons-react'
import { cilTrash } from '@coreui/icons'

export const TASK_DELETE_ZONE_ID = 'task-delete-zone'

interface TaskDeleteZoneProps {
  /** true khi đang kéo một task */
  visible: boolean
}

/**
 * Vùng thả xoá task, cố định ở giữa đáy màn hình.
 * Luôn được mount (chỉ ẩn bằng opacity) để thư viện đo được kích thước
 * ngay lúc bắt đầu kéo.
 */
export const TaskDeleteZone: React.FC<TaskDeleteZoneProps> = ({ visible }) => (
  <Droppable droppableId={TASK_DELETE_ZONE_ID}>
    {(provided, snapshot) => {
      const active = snapshot.isDraggingOver

      return (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            width: 280,
            height: 76,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 16,
            border: `2px dashed ${active ? '#e55353' : '#adb5bd'}`,
            background: active ? '#e55353' : 'rgba(255,255,255,0.95)',
            color: active ? '#fff' : '#e55353',
            boxShadow: active
              ? '0 10px 30px rgba(229,83,83,0.45)'
              : '0 6px 20px rgba(0,0,0,0.15)',
            fontWeight: 600,
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? 'auto' : 'none',
            transition: 'opacity 0.15s ease, background 0.15s ease, color 0.15s ease',
          }}
        >
          <CIcon icon={cilTrash} size="xl" />
          <span>{active ? 'Thả để xoá task' : 'Kéo vào đây để xoá'}</span>

          {/* Bắt buộc phải render placeholder, nhưng ẩn đi để không làm đổi kích thước */}
          <div style={{ display: 'none' }}>{provided.placeholder}</div>
        </div>
      )
    }}
  </Droppable>
)

export default TaskDeleteZone