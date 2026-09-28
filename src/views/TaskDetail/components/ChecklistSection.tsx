import React, { useState } from 'react'
import { CButton, CFormCheck, CFormInput, CProgress } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilList, cilPlus, cilTrash } from '@coreui/icons'
import { ChecklistResponse } from 'src/types/TaskDetailType/checklist'

interface ChecklistSectionProps {
  checklists: ChecklistResponse[]; saving: boolean;
  onCreateChecklist: (title: string) => void;
  onUpdateChecklist: (id: string, title: string) => void;
  onDeleteChecklist: (id: string) => void;
  onToggleChecklist: (id: string, completed: boolean) => void;
  onCreateItem: (checklistId: string, content: string, orderIndex: number) => void;
  onUpdateItem: (id: string, content: string) => void;
  onDeleteItem: (id: string) => void;
  onToggleItem: (id: string, completed: boolean) => void;
  onReorderItem: (id: string, orderIndex: number) => void;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = (props) => {
  const [newChecklistTitle, setNewChecklistTitle] = useState('')
  const [newItems, setNewItems] = useState<Record<string, string>>({})
  const [showAddChecklist, setShowAddChecklist] = useState<Record<string, boolean>>({})

  return (
    <div className="mb-4">
      <div className="d-flex flex-column gap-4">
        {props.checklists.map((checklist) => {
          const newItem = newItems[checklist.id] ?? ''
          const isShowAdd = showAddChecklist[checklist.id] || false
          const completedCount = checklist.items.filter((c) => c.isCompleted).length
          const checklistPercentage = checklist.items.length > 0 ? Math.round((completedCount / checklist.items.length) * 100) : 0

          return (
            <div key={checklist.id}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center">
                  <CIcon icon={cilList} className="me-2 text-primary" /> {checklist.title}
                </h6>
                <div className="d-flex align-items-center gap-3">
                  <span className="small text-muted fw-semibold">{checklistPercentage}%</span>
                  <CIcon icon={cilTrash} className="text-muted cursor-pointer hover-text-danger" size="sm" onClick={() => props.onDeleteChecklist(checklist.id)} />
                </div>
              </div>

              <div className="d-flex align-items-center mb-3 gap-2">
                <CProgress value={checklistPercentage} color={checklistPercentage === 100 ? 'success' : 'primary'} className="rounded-pill flex-grow-1" style={{ height: 6 }} />
              </div>

              <div className="list-group list-group-flush mb-2 border rounded-3 bg-white p-2">
                {checklist.items.slice().sort((a, b) => a.orderIndex - b.orderIndex).map((item) => (
                  <div key={item.id} className="list-group-item d-flex align-items-center bg-transparent px-2 border-0 py-2 hover-bg-light rounded">
                    <CFormCheck
                      id={item.id}
                      checked={item.isCompleted}
                      onChange={(e) => props.onToggleItem(item.id, e.target.checked)}
                      className="me-2 mt-0 cursor-pointer shadow-none"
                    />
                    <input
                      type="text"
                      className={`flex-grow-1 small border-0 bg-transparent outline-none ${item.isCompleted ? 'text-decoration-line-through text-muted' : 'text-dark'}`}
                      value={item.content}
                      onChange={(e) => props.onUpdateItem(item.id, e.target.value)}
                    />
                    <CIcon icon={cilTrash} className="text-muted cursor-pointer hover-text-danger ms-2 flex-shrink-0" size="sm" onClick={() => props.onDeleteItem(item.id)} />
                  </div>
                ))}
                {checklist.items.length === 0 && <div className="text-muted small p-2 text-center">Chưa có mục nào.</div>}
              </div>

              {isShowAdd ? (
                <div className="p-2 border rounded-3 bg-light">
                  <CFormInput size="sm" placeholder="Nhập nội dung việc cần kiểm tra..." value={newItem} onChange={(e) => setNewItems((c) => ({ ...c, [checklist.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter' && newItem.trim()) { props.onCreateItem(checklist.id, newItem.trim(), checklist.items.length); setNewItems((c) => ({ ...c, [checklist.id]: '' })); } }} className="mb-2 border-0 shadow-sm" autoFocus />
                  <div className="d-flex gap-2">
                    <CButton color="primary" size="sm" onClick={() => { if (newItem.trim()) { props.onCreateItem(checklist.id, newItem.trim(), checklist.items.length); setNewItems((c) => ({ ...c, [checklist.id]: '' })); } }}>Thêm</CButton>
                    <CButton color="light" size="sm" className="border" onClick={() => setShowAddChecklist((c) => ({ ...c, [checklist.id]: false }))}>Hủy</CButton>
                  </div>
                </div>
              ) : (
                <CButton color="light" size="sm" className="border fw-medium text-secondary" onClick={() => setShowAddChecklist((c) => ({ ...c, [checklist.id]: true }))}>
                  <CIcon icon={cilPlus} className="me-1" size="sm" /> Thêm mục kiểm tra
                </CButton>
              )}
            </div>
          )
        })}

        <div className="d-flex gap-2 mt-2 pt-3 border-top border-light">
          <CFormInput size="sm" placeholder="Tên checklist mới..." value={newChecklistTitle} onChange={(e) => setNewChecklistTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newChecklistTitle.trim()) { props.onCreateChecklist(newChecklistTitle.trim()); setNewChecklistTitle(''); } }} />
          <CButton color="secondary" variant="outline" size="sm" disabled={props.saving} className="text-nowrap" onClick={() => { if (newChecklistTitle.trim()) { props.onCreateChecklist(newChecklistTitle.trim()); setNewChecklistTitle(''); } }}>Tạo Checklist</CButton>
        </div>
      </div>
    </div>
  )
}