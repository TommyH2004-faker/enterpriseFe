import React, { useMemo } from 'react'
import { CButton, CDropdown, CDropdownMenu, CDropdownToggle, CFormCheck } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilX } from '@coreui/icons'
export interface TaskAssigneeOption { id: string; name: string }

interface TaskAssigneesSectionProps { members: TaskAssigneeOption[]; selectedIds: string[]; initialized: boolean; saving: boolean; onChange: (ids: string[]) => void; onSave: () => void; }

export const TaskAssigneesSection: React.FC<TaskAssigneesSectionProps> = ({ members, selectedIds, initialized, saving, onChange, onSave }) => {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  
  const toggle = (id: string, checked: boolean) => { 
    const next = new Set(selectedSet); 
    if (checked) next.add(id); else next.delete(id); 
    onChange(Array.from(next)); 
  }

  const removeAssignee = (idToRemove: string) => {
    const next = selectedIds.filter(id => id !== idToRemove);
    onChange(next);
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label className="text-uppercase text-muted fw-bold small d-block mb-0" style={{ fontSize: '11px' }}>Người thực hiện (Assignee)</label>
        {selectedIds.length > 0 && (
          <CButton color="primary" variant="ghost" size="sm" className="py-0 px-1 text-decoration-none" disabled={saving} onClick={onSave}>
            Lưu
          </CButton>
        )}
      </div>
      
      <div className="d-flex align-items-center gap-2 bg-white p-2 rounded-3 border shadow-none flex-wrap">
        {selectedIds.map((id) => {
          const member = members.find((item) => item.id === id)
          return (
            <div key={id} className="position-relative d-inline-block">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: 32, height: 32, fontSize: '12px' }} title={member?.name ?? id}>
                {(member?.name ?? id).slice(0, 1).toUpperCase()}
              </div>
              {/* Icon xóa trực tiếp trên Avatar */}
              <div className="position-absolute bg-danger text-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer shadow-sm hover-opacity-75" style={{ width: 14, height: 14, top: -2, right: -2 }} onClick={() => removeAssignee(id)}>
                <CIcon icon={cilX} style={{ width: 8, height: 8 }} />
              </div>
            </div>
          )
        })}

        <CDropdown placement="bottom-start" className="flex-grow-1">
          <CDropdownToggle color="light" variant="ghost" caret={false} className="border-0 bg-transparent p-0 shadow-none small fw-semibold text-start text-muted d-flex align-items-center gap-2 w-100 outline-none">
            {selectedIds.length === 0 && <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: 32, height: 32, fontSize: '12px' }}><CIcon icon={cilUser} size="sm" /></div>}
            <span className="ms-1">{selectedIds.length === 0 ? "Chọn người thực hiện..." : "+ Thêm"}</span>
          </CDropdownToggle>
          <CDropdownMenu className="p-3 shadow-sm border-0" style={{ width: 260, maxHeight: 300, overflowY: 'auto' }}>
            <div className="fw-bold mb-2 small text-muted">Chọn thành viên</div>
            {members.map((member) => (
              <CFormCheck key={member.id} id={`assignee-${member.id}`} label={member.name} checked={selectedSet.has(member.id)} onChange={(e) => toggle(member.id, e.target.checked)} className="mb-2" />
            ))}
            {members.length > 0 && <div className="mt-3 text-end"><CButton size="sm" color="primary" onClick={onSave}>Lưu Assignee</CButton></div>}
          </CDropdownMenu>
        </CDropdown>
      </div>
    </div>
  )
}