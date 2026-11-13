import React, { useMemo, useState } from 'react'
import { CBadge, CButton, CFormInput } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX } from '@coreui/icons'
import { ProjectLabelResponse, TaskLabelResponse } from 'src/types/TaskDetailType/label'

interface LabelSectionProps { 
  projectLabels: ProjectLabelResponse[]; 
  taskLabels: TaskLabelResponse[]; 
  saving: boolean; 
  onAssign: (labelId: string) => void; 
  onRemove: (labelId: string) => void; 
  onCreateProjectLabel: (name: string, color: string, desc?: string) => void; 
  onUpdateLabel: (id: string, name: string, color: string, desc?: string) => void; 
  onDeleteLabel: (id: string) => void; 
}

export const LabelSection: React.FC<LabelSectionProps> = ({ projectLabels, taskLabels, saving, onAssign, onRemove, onCreateProjectLabel }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#0d6efd')

  const activeLabels = projectLabels
  const assignedIds = useMemo(() => new Set(taskLabels.map((l) => l.labelId)), [taskLabels])

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      onCreateProjectLabel(newLabelName.trim(), newLabelColor, '')
      setNewLabelName('')
      setNewLabelColor('#0d6efd')
      setIsCreating(false)
    }
  }

  return (
    <div className="border-top pt-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="text-uppercase text-muted fw-bold small mb-0" style={{ fontSize: '11px' }}>
          Nhãn phân loại (Tags)
        </label>
        {!isCreating && (
          <span className="small text-primary cursor-pointer hover-text-dark fw-semibold" onClick={() => setIsCreating(true)}>
            + Tạo mới
          </span>
        )}
      </div>

      {/* Nhãn đã gán — danh sách dọc cuộn */}
      {taskLabels.length > 0 && (
        <div
          style={{
            maxHeight: 90,
            overflowY: 'auto',
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: 6,
            padding: '4px 6px',
            marginBottom: 8,
          }}
        >
          {taskLabels.map((label) => (
            <div
              key={label.id}
              className="d-flex align-items-center justify-content-between px-1 py-1"
              style={{ borderRadius: 4 }}
            >
              <div className="d-flex align-items-center gap-2">
                <span
                  style={{
                    width: 10, height: 10, borderRadius: '50%',
                    backgroundColor: label.color,
                    display: 'inline-block',
                    flexShrink: 0,
                    border: '1.5px solid rgba(0,0,0,0.1)',
                  }}
                />
                <span className="small fw-semibold" style={{ color: label.color }}>{label.name}</span>
              </div>
              <CIcon
                icon={cilX}
                size="sm"
                style={{ cursor: 'pointer', opacity: 0.5, flexShrink: 0 }}
                onClick={() => onRemove(label.labelId)}
              />
            </div>
          ))}
        </div>
      )}

      {isCreating ? (
        /* Form tạo nhãn mới */
        <div className="bg-white p-2 rounded-3 border shadow-sm mb-2">
          <div className="d-flex gap-2 align-items-center mb-2">
            <CFormInput
              type="color"
              size="sm"
              className="p-0 border-0 shadow-none"
              style={{ width: 30, height: 30, cursor: 'pointer' }}
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              title="Chọn màu nhãn"
            />
            {/* Preview badge */}
            <span
              className="d-inline-flex align-items-center px-2 py-1 rounded-pill small fw-semibold flex-shrink-0"
              style={{
                backgroundColor: newLabelColor,
                color: '#fff',
                fontSize: '12px',
                minWidth: 48,
                whiteSpace: 'nowrap',
              }}
            >
              {newLabelName || 'Nhãn mới'}
            </span>
            <CFormInput
              size="sm"
              placeholder="Tên nhãn mới..."
              className="border-0 bg-light flex-grow-1"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <CButton size="sm" color="light" className="border text-muted" onClick={() => setIsCreating(false)}>Hủy</CButton>
            <CButton size="sm" color="primary" disabled={saving || !newLabelName.trim()} onClick={handleCreateLabel}>Tạo nhãn</CButton>
          </div>
        </div>
      ) : (
        /* Danh sách label có sẵn — list dọc cuộn */
        <div
          style={{
            maxHeight: 130,
            overflowY: 'auto',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: 6,
            padding: '4px 0',
          }}
        >
          {activeLabels.filter((l) => !assignedIds.has(l.id)).length === 0 ? (
            <div className="text-muted small px-2 py-1">Tất cả nhãn đã được gán.</div>
          ) : (
            activeLabels
              .filter((l) => !assignedIds.has(l.id))
              .map((l) => (
                <div
                  key={l.id}
                  className="d-flex align-items-center gap-2 px-2 py-1"
                  style={{
                    cursor: 'pointer',
                    transition: 'background 0.12s',
                    borderRadius: 4,
                  }}
                  onClick={() => onAssign(l.id)}
                  title={`Gán nhãn "${l.name}"`}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#e9ecef')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span
                    style={{
                      width: 10, height: 10, borderRadius: '50%',
                      backgroundColor: l.color,
                      display: 'inline-block',
                      border: '1.5px solid rgba(0,0,0,0.1)',
                      flexShrink: 0,
                    }}
                  />
                  <span className="small fw-semibold" style={{ color: l.color }}>{l.name}</span>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  )
}