
import React, { useEffect, useRef, useState } from 'react'
import { CBadge, CButton, CCol, CFormInput, CModal, CModalBody, CModalHeader, CModalTitle, CRow, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTask } from '@coreui/icons'
import toast from 'react-hot-toast'

import { useTaskDetail } from '../hooks/useTaskDetail'
import {
  PROJECT_REALTIME_CHANGED_EVENT,
  ProjectRealtimePayload,
} from 'src/hooks/useNotificationConnection'
import { ActivitySection } from './ActivitySection'
import { AttachmentSection } from './AttachmentSection'
import { ChecklistSection } from './ChecklistSection'
import { CommentSection } from './CommentSection'
import { LabelSection } from './LabelSection'
import { TaskAssigneesSection, type TaskAssigneeOption } from './TaskAssigneesSection'
import { TaskDetailOverview } from './TaskDetailOverview'
import ToastAlert from 'src/components/ToastAlert'
import { TaskMoveSection, type TaskMoveColumn } from './TaskMoveSection'
import { UpdateTaskRequest } from 'src/types/task'

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

const EMPTY_DRAFT: UpdateTaskRequest = {
  title: '',
  description: '',
  priority: 1,
  startDate: null,
  dueDate: null,
}

const normalizePriority = (priority: string | number): number => {
  switch (String(priority).toLowerCase()) {
    case '1':
    case 'low':
      return 1
    case '2':
    case 'medium':
      return 2
    case '3':
    case 'high':
      return 3
    default:
      return 1
  }
}

const toDateOnly = (value?: string | null) => (value ? value.slice(0, 10) : '')

const sameIds = (a: string[], b: string[]) =>
  [...a].sort().join(',') === [...b].sort().join(',')

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  visible, taskId, projectId, columns, members, initialAssigneeIds, onClose, onChanged,
}) => {
  const {
    task, checklists, comments, attachments, projectLabels, taskLabels, projectMembers, activities,
    assigneeIds, assigneeInitialized, loading, actionLoading, error,
    silentRefresh,
    updateTask, updateAssignees, updateAssigneeSelection, moveTask,
    createChecklist, updateChecklist, deleteChecklist, completeChecklist,
    createChecklistItem, updateChecklistItem, deleteChecklistItem, completeChecklistItem, changeChecklistItemOrder,
    createComment, updateComment, deleteComment, uploadAttachment, deleteAttachment,
    createProjectLabel, updateLabel, deleteLabel, assignTaskLabel, removeTaskLabel,
  } = useTaskDetail({
    taskId: visible ? taskId : null,
    projectId: visible ? projectId : null,
    initialAssigneeIds,
    onChanged,
  })

  const availableMembers = React.useMemo(() => {
    if (members && members.length > 0) return members
    return (projectMembers || []).map((m: any) => ({
      id: m.id || m.userId || m.employeeId,
      name: m.name || m.fullName || m.email || 'Thành viên',
    }))
  }, [members, projectMembers])

  const [draft, setDraft] = useState<UpdateTaskRequest>(EMPTY_DRAFT)

  // Danh sách assignee đã lưu ở server (dùng để biết có thay đổi chưa lưu hay không)
  const savedAssigneeIds = useRef<string[]>([])

  // Nạp draft khi task thay đổi
  useEffect(() => {
    if (!task) return
    setDraft({
      title: task.title,
      description: task.description,
      priority: normalizePriority(task.priority),
      startDate: task.startDate,
      dueDate: task.dueDate,
    })
  }, [task])

  // Ghi nhận danh sách assignee gốc khi vừa nạp xong
  useEffect(() => {
    if (assigneeInitialized) {
      savedAssigneeIds.current = [...assigneeIds]
    }
    // Chỉ chạy khi nạp xong / đổi task, không chạy khi người dùng đang chọn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assigneeInitialized, task?.id])

  // Reset khi đóng modal
  useEffect(() => {
    if (!visible) {
      savedAssigneeIds.current = []
    }
  }, [visible])

  // Đồng bộ Realtime ngay trong cửa sổ chi tiết khi đồng nghiệp bình luận / sửa checklist / sửa task
  useEffect(() => {
    if (!visible || !taskId || !projectId) return
    let timer: number | null = null

    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent<ProjectRealtimePayload>).detail
      if (!detail || detail.projectId?.toLowerCase() !== projectId.toLowerCase()) return
      if (detail.taskId && detail.taskId.toLowerCase() !== taskId.toLowerCase()) return

      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        void silentRefresh()
      }, 200)
    }

    window.addEventListener(PROJECT_REALTIME_CHANGED_EVENT, handleRealtime)
    return () => {
      if (timer) window.clearTimeout(timer)
      window.removeEventListener(PROJECT_REALTIME_CHANGED_EVENT, handleRealtime)
    }
  }, [visible, taskId, projectId, silentRefresh])

  const isAssigneeDirty = () =>
    assigneeInitialized && !sameIds(assigneeIds, savedAssigneeIds.current)

  /** Lưu thông tin task từ một draft cụ thể (luôn dùng giá trị mới nhất, không dùng state cũ). */
  const saveTask = async (source: UpdateTaskRequest): Promise<boolean> => {
    const title = source.title?.trim() ?? ''
    if (!title) {
      toast.error('Tiêu đề không được để trống.')
      return false
    }

    if (source.startDate && source.dueDate && source.dueDate < source.startDate) {
      toast.error('Hạn kết thúc phải sau ngày bắt đầu.')
      return false
    }

    try {
      await updateTask({
        title,
        description: source.description,
        priority: source.priority ?? 1,
        startDate: source.startDate ?? null,
        dueDate: source.dueDate ?? null,
      })
      return true
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật công việc.')
      return false
    }
  }

  const handleSaveAssignees = async (): Promise<boolean> => {
    try {
      await updateAssignees()
      savedAssigneeIds.current = [...assigneeIds]
      toast.success('Đã cập nhật người thực hiện thành công')
      return true
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật người thực hiện.')
      return false
    }
  }

  /** Đổi 1 field rồi lưu ngay với draft mới nhất. */
  const patchAndSave = async (patch: Partial<UpdateTaskRequest>) => {
    const next = { ...draft, ...patch }
    setDraft(next)
    await saveTask(next)
  }

  const handleFinish = async () => {
    const taskOk = await saveTask(draft)
    if (!taskOk) return

    if (isAssigneeDirty()) {
      const assigneeOk = await handleSaveAssignees()
      if (!assigneeOk) return // lỗi thì giữ modal mở để người dùng thấy
    }

    onClose()
  }

  const currentColumnName = columns.find((c) => c.id === task?.columnId)?.name || 'Board'

  return (
    <CModal visible={visible} onClose={onClose} size="xl" alignment="center" backdrop="static">
      {task && (
        <CModalHeader className="border-bottom-0 pb-0 pt-3 px-4">
          <CModalTitle className="d-flex align-items-center w-100 gap-2">
            <div
              className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
              style={{ width: 38, height: 38 }}
            >
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
          <div className="d-flex justify-content-center py-5">
            <CSpinner color="primary" />
          </div>
        )}
        {!loading && <ToastAlert message={error} />}

        {!loading && task && (
          <>
            {/* Editable Title */}
            <div className="mb-4">
              <CFormInput
                type="text"
                value={draft.title ?? ''}
                onChange={(e) => setDraft((curr) => ({ ...curr, title: e.target.value }))}
                onBlur={() => void saveTask(draft)}
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
                  onSave={() => void saveTask(draft)}
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
                  taskId={task.id}
                  attachments={attachments}
                  saving={actionLoading}
                  onUpload={(file) => void uploadAttachment(file)}
                  onDelete={(id) => void deleteAttachment(id)}
                />

                <CommentSection
                  comments={comments}
                  saving={actionLoading}
                  onCreate={(val, parentCommentId) => void createComment(val, parentCommentId)}
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
                    <label
                      className="text-uppercase text-muted fw-bold small mb-1 d-block"
                      style={{ fontSize: '11px' }}
                    >
                      Mức độ ưu tiên
                    </label>

                    <select
                      className="form-select bg-white border-0 shadow-sm fw-semibold text-dark"
                      value={draft.priority ?? 1}
                      onChange={(e) => void patchAndSave({ priority: Number(e.target.value) })}
                    >
                      <option value={1}>Thấp</option>
                      <option value={2}>Trung bình</option>
                      <option value={3}>Cao</option>
                    </select>
                  </div>

                  <TaskAssigneesSection
                    members={availableMembers}
                    selectedIds={assigneeIds}
                    initialized={assigneeInitialized}
                    saving={actionLoading}
                    onChange={updateAssigneeSelection}
                    onSave={async () => {
                      await handleSaveAssignees()
                    }}
                  />

                  {/* Dates */}
                  <div className="border-top pt-3">
                    <div className="mb-2">
                      <label
                        className="text-uppercase text-muted fw-bold small mb-1 d-block"
                        style={{ fontSize: '11px' }}
                      >
                        Ngày bắt đầu
                      </label>
                      <CFormInput
                        type="date"
                        size="sm"
                        value={toDateOnly(draft.startDate)}
                        onChange={(e) =>
                          void patchAndSave({
                            startDate: e.target.value ? `${e.target.value}T00:00:00Z` : null,
                          })
                        }
                        className="bg-white border-0 shadow-sm"
                      />
                    </div>
                    <div>
                      <label
                        className="text-uppercase text-muted fw-bold small mb-1 d-block"
                        style={{ fontSize: '11px' }}
                      >
                        Hạn kết thúc (Due Date)
                      </label>
                      <CFormInput
                        type="date"
                        size="sm"
                        value={toDateOnly(draft.dueDate)}
                        onChange={(e) =>
                          void patchAndSave({
                            dueDate: e.target.value ? `${e.target.value}T00:00:00Z` : null,
                          })
                        }
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
                    <CButton
                      color="primary"
                      className="w-100 fw-semibold shadow-sm"
                      disabled={actionLoading}
                      onClick={() => void handleFinish()}
                    >
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