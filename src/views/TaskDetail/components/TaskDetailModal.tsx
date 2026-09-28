import React, { useEffect, useState } from 'react'
import { CAlert, CBadge, CButton, CCol, CFormInput, CModal, CModalBody, CModalHeader, CModalTitle, CRow, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTask, cilTrash } from '@coreui/icons'

import { useTaskDetail } from '../hooks/useTaskDetail'
import { ActivitySection } from './ActivitySection'
import { AttachmentSection } from './AttachmentSection'
import { ChecklistSection } from './ChecklistSection'
import { CommentSection } from './CommentSection'
import { LabelSection } from './LabelSection'
import { TaskAssigneesSection, type TaskAssigneeOption } from './TaskAssigneesSection'
import { TaskDetailOverview } from './TaskDetailOverview'
import { TaskMoveSection, type TaskMoveColumn } from './TaskMoveSection'
import { UpdateTaskRequest } from 'src/types/TaskDetailType/task'

export interface TaskDetailModalProps {
  visible: boolean
  taskId: string | null
  projectId: string
  columns: TaskMoveColumn[]
  members: TaskAssigneeOption[]
  initialAssigneeIds?: string[]
  onClose: () => void
  onChanged?: () => void | Promise<void>
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  visible, taskId, projectId, columns, members, initialAssigneeIds, onClose, onChanged,
}) => {
  const {
    task, checklists, comments, attachments, projectLabels, taskLabels, activities,
    assigneeIds, assigneeInitialized, loading, actionLoading, error,
    updateTask, updateAssignees, updateAssigneeSelection, moveTask,
    createChecklist, updateChecklist, deleteChecklist, completeChecklist,
    createChecklistItem, updateChecklistItem, deleteChecklistItem, completeChecklistItem, changeChecklistItemOrder,
    createComment, updateComment, deleteComment, uploadAttachment, deleteAttachment,
    createProjectLabel, updateLabel, deleteLabel, assignTaskLabel, removeTaskLabel,
  } = useTaskDetail({ taskId: visible ? taskId : null, projectId: visible ? projectId : null, initialAssigneeIds, onChanged })

  const [draft, setDraft] = useState<UpdateTaskRequest>({ title: '', description: '', priority: 1, startDate: null, dueDate: null })

  useEffect(() => {
    if (task) {
      setDraft({ title: task.title, description: task.description, priority: task.priority, startDate: task.startDate, dueDate: task.dueDate })
    }
  }, [task])

  const handleSaveTask = async () => {
    await updateTask({
      title: draft.title?.trim() ?? '',
      description: draft.description,
      priority: draft.priority ?? 1,
      startDate: draft.startDate ?? null,
      dueDate: draft.dueDate ?? null,
    })
  }

  const currentColumnName = columns.find((c) => c.id === task?.columnId)?.name || 'Board'

  return (
    <CModal visible={visible} onClose={onClose} size="xl" alignment="center" backdrop="static">
      {task && (
        <CModalHeader className="border-bottom-0 pb-0 pt-3 px-4">
          <CModalTitle className="d-flex align-items-center w-100 gap-2">
            <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
              <CIcon icon={cilTask} />
            </div>
            <div className="flex-grow-1 min-w-0">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-light text-secondary border font-monospace small">
                  #{task.id ? task.id.slice(0, 6).toUpperCase() : 'N/A'}
                </span>
                <span className="text-muted small">trong cột</span>
                <CBadge color="primary" shape="rounded-pill" className="px-2 py-1">
                  {currentColumnName}
                </CBadge>
              </div>
            </div>
          </CModalTitle>
        </CModalHeader>
      )}

      <CModalBody className="p-4 pt-2">
        {loading && (
          <div className="d-flex justify-content-center py-5"><CSpinner color="primary" /></div>
        )}
        {!loading && error && <CAlert color="danger" className="mb-4">{error}</CAlert>}

        {!loading && task && (
          <>
            {/* Editable Title */}
            <div className="mb-4">
              <CFormInput
                type="text"
                value={draft.title ?? ''}
                onChange={(e) => setDraft(curr => ({ ...curr, title: e.target.value }))}
                onBlur={() => void handleSaveTask()}
                className="border-0 fw-bold fs-4 px-2 py-1 bg-transparent text-dark shadow-none hover-bg-light rounded"
                placeholder="Tiêu đề công việc..."
              />
            </div>

            <CRow className="g-4">
              {/* LEFT PANEL */}
              <CCol xs={12} lg={8}>
                <TaskDetailOverview
                  task={task}
                  draft={draft}
                  onDraftChange={(patch) => setDraft((curr) => ({ ...curr, ...patch }))}
                  onSave={() => void handleSaveTask()}
                />
                
                <ChecklistSection
                  checklists={checklists}
                  saving={actionLoading}
                  onCreateChecklist={(val) => void createChecklist(val)}
                  onUpdateChecklist={(id, val) => void updateChecklist(id, val)}
                  onDeleteChecklist={(id) => void deleteChecklist(id)}
                  onToggleChecklist={(id, checked) => void completeChecklist(id, checked)}
                  onCreateItem={(cid, content, order) => void createChecklistItem(cid, content, order)}
                  onUpdateItem={(id, content) => void updateChecklistItem(id, content)}
                  onDeleteItem={(id) => void deleteChecklistItem(id)}
                  onToggleItem={(id, checked) => void completeChecklistItem(id, checked)}
                  onReorderItem={(id, order) => void changeChecklistItemOrder(id, order)}
                />

                <AttachmentSection
                  attachments={attachments}
                  saving={actionLoading}
                  onUpload={(file) => void uploadAttachment(file)}
                  onDelete={(id) => void deleteAttachment(id)}
                />

                <CommentSection
                  comments={comments}
                  saving={actionLoading}
                  onCreate={(val) => void createComment(val)}
                  onUpdate={(id, val) => void updateComment(id, val)}
                  onDelete={(id) => void deleteComment(id)}
                />

                <ActivitySection activities={activities} />
              </CCol>

              {/* RIGHT PANEL */}
              <CCol xs={12} lg={4}>
                <div className="bg-light bg-opacity-50 p-3 rounded-3 border border-light d-flex flex-column gap-3">
                  
                  <TaskMoveSection
                    columns={columns}
                    currentColumnId={task.columnId}
                    currentPosition={task.position}
                    saving={actionLoading}
                    onMove={(colId, pos) => void moveTask(colId, pos)}
                  />

                  {/* Priority */}
                  <div>
                    <label className="text-uppercase text-muted fw-bold small mb-1 d-block" style={{ fontSize: '11px' }}>
                      Mức độ ưu tiên
                    </label>
                    <select
                      className="form-select bg-white border-0 shadow-sm fw-semibold text-dark"
                      value={draft.priority ?? 1}
                      onChange={(e) => {
                        const newPriority = Number(e.target.value);
                        setDraft(curr => ({ ...curr, priority: newPriority }));
                        updateTask({ ...draft, priority: newPriority });
                      }}
                    >
                      <option value={1}>Thấp</option>
                      <option value={2}>Trung bình</option>
                      <option value={3}>Cao</option>
                      <option value={4}>Khẩn cấp</option>
                    </select>
                  </div>

                  <TaskAssigneesSection
                    members={members}
                    selectedIds={assigneeIds}
                    initialized={assigneeInitialized}
                    saving={actionLoading}
                    onChange={updateAssigneeSelection}
                    onSave={() => void updateAssignees()}
                  />

                  {/* Dates */}
                  <div className="border-top pt-3">
                    <div className="mb-2">
                      <label className="text-uppercase text-muted fw-bold small mb-1 d-block" style={{ fontSize: '11px' }}>
                        Ngày bắt đầu
                      </label>
                      <CFormInput
                        type="date"
                        size="sm"
                        value={draft.startDate?.slice(0, 10) ?? ''}
                        onChange={(e) => {
                          const newDate = e.target.value ? `${e.target.value}T00:00:00Z` : null;
                          setDraft(curr => ({ ...curr, startDate: newDate }));
                          updateTask({ ...draft, startDate: newDate });
                        }}
                        className="bg-white border-0 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-uppercase text-muted fw-bold small mb-1 d-block" style={{ fontSize: '11px' }}>
                        Hạn kết thúc (Due Date)
                      </label>
                      <CFormInput
                        type="date"
                        size="sm"
                        value={draft.dueDate?.slice(0, 10) ?? ''}
                        onChange={(e) => {
                          const newDate = e.target.value ? `${e.target.value}T00:00:00Z` : null;
                          setDraft(curr => ({ ...curr, dueDate: newDate }));
                          updateTask({ ...draft, dueDate: newDate });
                        }}
                        className="bg-white border-0 shadow-sm"
                      />
                    </div>
                  </div>

                  <LabelSection
                    projectLabels={projectLabels}
                    taskLabels={taskLabels}
                    saving={actionLoading}
                    onAssign={(labelId) => void assignTaskLabel(labelId)}
                    onRemove={(labelId) => void removeTaskLabel(labelId)}
                    onCreateProjectLabel={(name, color, desc) => void createProjectLabel(name, color, desc)}
                    onUpdateLabel={(id, name, color, desc) => void updateLabel(id, name, color, desc)}
                    onDeleteLabel={(id) => void deleteLabel(id)}
                  />

                  {/* Actions */}
                  <div className="border-top pt-3 d-flex flex-column gap-2 mt-auto">
                    <CButton color="primary" className="w-100 fw-semibold shadow-sm" disabled={actionLoading} onClick={() => { handleSaveTask(); onClose(); }}>
                      {actionLoading ? <CSpinner size="sm" /> : 'Hoàn tất & Đóng'}
                    </CButton>
                  </div>

                </div>
              </CCol>
            </CRow>
          </>
        )}
      </CModalBody>
    </CModal>
  )
}

export default TaskDetailModal