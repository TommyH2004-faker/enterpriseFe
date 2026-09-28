import React, { useState } from 'react'
import { CButton, CFormTextarea, CRow, CCol, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilAlignLeft } from '@coreui/icons'
import { TaskDetailResponse, UpdateTaskRequest } from 'src/types/TaskDetailType/task'

interface TaskDetailOverviewProps {
  task: TaskDetailResponse
  draft: UpdateTaskRequest
  onDraftChange: (patch: Partial<UpdateTaskRequest>) => void
  onSave: () => void
}

const getTaskTypeDisplay = (typeCode: number) => {
  const types: Record<number, { label: string; color: string }> = {
    1: { label: 'Task', color: 'primary' },
    2: { label: 'Bug', color: 'danger' },
    3: { label: 'Feature', color: 'success' },
    4: { label: 'Improvement', color: 'info' },
    5: { label: 'Epic', color: 'secondary' },
    6: { label: 'Story', color: 'warning' },
    7: { label: 'Spike', color: 'dark' }
  }
  return types[typeCode] || { label: 'Unknown', color: 'light' }
}

export const TaskDetailOverview: React.FC<TaskDetailOverviewProps> = ({ task, draft, onDraftChange, onSave }) => {
  const [isEditingDesc, setIsEditingDesc] = useState(false)

  const taskTypeDisplay = getTaskTypeDisplay(task.taskType)

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="fw-bold mb-0 text-dark d-flex align-items-center">
          <CIcon icon={cilAlignLeft} className="me-2 text-primary" /> Mô tả công việc
        </h6>
        {!isEditingDesc && (
          <CButton color="light" size="sm" className="border text-secondary py-0 px-2 small" onClick={() => setIsEditingDesc(true)}>
            Chỉnh sửa
          </CButton>
        )}
      </div>

      {isEditingDesc ? (
        <div>
          <CFormTextarea
            rows={4}
            value={draft.description ?? ''}
            onChange={(e) => onDraftChange({ description: e.target.value })}
            placeholder="Thêm mô tả chi tiết hơn về yêu cầu, checklist kỹ thuật, v.v..."
            className="bg-light border-0 shadow-none mb-2"
            autoFocus
          />
          <div className="d-flex gap-2">
            <CButton color="primary" size="sm" onClick={() => { setIsEditingDesc(false); onSave(); }}>
              Lưu mô tả
            </CButton>
            <CButton color="light" size="sm" className="border" onClick={() => { setIsEditingDesc(false); onDraftChange({ description: task.description }) }}>
              Hủy
            </CButton>
          </div>
        </div>
      ) : (
        <div
          className="p-3 rounded-3 bg-light bg-opacity-50 text-dark small cursor-pointer hover-bg-light transition-all border border-light mb-3"
          style={{ minHeight: 70, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
          onClick={() => setIsEditingDesc(true)}
        >
          {draft.description ? draft.description : (
            <span className="text-muted fst-italic">
              Chưa có mô tả chi tiết. Bấm vào đây để thêm mô tả...
            </span>
          )}
        </div>
      )}

      {/* Phụ trợ từ Real API */}
      <CRow className="g-2 pt-2 border-top border-light mt-1">
        <CCol xs={4}>
          <div className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '10px' }}>Loại Task</div>
          <CBadge color={taskTypeDisplay.color} shape="rounded-pill" className="small px-2 py-1">
            {taskTypeDisplay.label}
          </CBadge>
        </CCol>
        <CCol xs={4}>
          <div className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '10px' }}>Tiến độ</div>
          <div className="small fw-semibold">{task.progress}%</div>
        </CCol>
        <CCol xs={4}>
          <div className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '10px' }}>Estimate / Điểm</div>
          <div className="small fw-semibold">{task.estimateHour}h / {task.storyPoint} sp</div>
        </CCol>
      </CRow>
    </div>
  )
}