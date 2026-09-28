import React, { useMemo, useState } from 'react'
import { CBadge, CButton, CFormInput, CFormSelect } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX } from '@coreui/icons'
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

  const activeLabels = useMemo(() => projectLabels.filter((l) => l.isActive), [projectLabels])
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

      <div className="d-flex flex-wrap gap-1 mb-2">
        {taskLabels.map((label) => (
          <CBadge key={label.id} style={{ backgroundColor: label.color }} shape="rounded-pill" className="d-inline-flex align-items-center px-2 py-1 small shadow-sm">
            {label.name}
            <CIcon icon={cilX} size="sm" className="ms-1 cursor-pointer opacity-75 hover-opacity-100" onClick={() => onRemove(label.labelId)} />
          </CBadge>
        ))}
      </div>

      {isCreating ? (
        <div className="bg-white p-2 rounded-3 border shadow-sm mb-2">
          <div className="d-flex gap-2 align-items-center mb-2">
            <CFormInput type="color" size="sm" className="p-0 border-0 shadow-none" style={{ width: 30, height: 30, cursor: 'pointer' }} value={newLabelColor} onChange={(e) => setNewLabelColor(e.target.value)} />
            <CFormInput size="sm" placeholder="Tên nhãn mới..." className="border-0 bg-light flex-grow-1" value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()} />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <CButton size="sm" color="light" className="border text-muted" onClick={() => setIsCreating(false)}>Hủy</CButton>
            <CButton size="sm" color="primary" disabled={saving || !newLabelName.trim()} onClick={handleCreateLabel}>Tạo nhãn</CButton>
          </div>
        </div>
      ) : (
        <CFormSelect size="sm" className="bg-white border-0 shadow-sm text-muted small" value="" onChange={(e) => { if(e.target.value) onAssign(e.target.value) }}>
          <option value="">+ Chọn nhãn có sẵn...</option>
          {activeLabels.filter((l) => !assignedIds.has(l.id)).map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </CFormSelect>
      )}
    </div>
  )
}