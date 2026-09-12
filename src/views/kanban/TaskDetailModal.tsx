import React, { useEffect, useState } from 'react'
import {
  CBadge,
  CButton,
  CCol,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CProgress,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilAlignLeft,
  cilCalendar,
  cilCloudUpload,
  cilCommentSquare,
  cilHistory,
  cilList,
  cilPaperclip,
  cilPlus,
  cilTask,
  cilTrash,
  cilUser,
  cilX,
} from '@coreui/icons'
import {
  KanbanColumn,
  KanbanTask,
  TaskActivityLog,
  TaskAttachment,
  TaskChecklistItem,
  TaskComment,
} from '../../types/Project'

interface TaskDetailModalProps {
  visible: boolean
  onClose: () => void
  task: KanbanTask | null
  columns: KanbanColumn[]
  projectMembers?: Array<{ id?: string; fullName: string; email?: string }>
  onUpdateTask: (updatedTask: KanbanTask) => void
  onDeleteTask?: (taskId: string) => void
}

const priorityColors: Record<string, string> = {
  Critical: 'danger',
  High: 'warning',
  Medium: 'info',
  Low: 'secondary',
  'Khẩn cấp': 'danger',
  Cao: 'warning',
  'Trung bình': 'info',
  Thấp: 'secondary',
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  visible,
  onClose,
  task,
  columns,
  projectMembers = [],
  onUpdateTask,
  onDeleteTask,
}) => {
  // Local state for editable fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [columnId, setColumnId] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [assigneeName, setAssigneeName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')

  // Sub-items
  const [checklists, setChecklists] = useState<TaskChecklistItem[]>([])
  const [newChecklistText, setNewChecklistText] = useState('')
  const [showAddChecklist, setShowAddChecklist] = useState(false)

  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [comments, setComments] = useState<TaskComment[]>([])
  const [newCommentText, setNewCommentText] = useState('')

  const [labels, setLabels] = useState<Array<{ name: string; color?: string }>>([])
  const [newLabelText, setNewLabelText] = useState('')
  const [activityLogs, setActivityLogs] = useState<TaskActivityLog[]>([])

  // Initialize or reset state when task changes
  useEffect(() => {
    if (!task) return

    setTitle(task.title || '')
    setDescription(task.description || '')
    setIsEditingDesc(false)
    setColumnId(task.columnId || columns[0]?.id || '')
    setPriority(task.priority || 'Medium')
    setAssigneeName(task.assignees?.[0]?.fullName || '')
    setStartDate(task.startDate || '')
    setDueDate(task.dueDate || '')

    // Checklists
    if (task.checklists && task.checklists.length > 0) {
      setChecklists(task.checklists)
    } else {
      setChecklists([
        { id: 'chk-1', title: 'Phân tích yêu cầu và thiết kế sơ bộ', isCompleted: true },
        { id: 'chk-2', title: 'Triển khai tính năng theo tài liệu kỹ thuật', isCompleted: false },
        { id: 'chk-3', title: 'Kiểm thử đơn vị và nghiệm thu kết quả', isCompleted: false },
      ])
    }

    // Attachments
    if (task.attachments && task.attachments.length > 0) {
      setAttachments(task.attachments)
    } else if (task.attachmentCount && task.attachmentCount > 0) {
      setAttachments([
        {
          id: 'att-1',
          fileName: 'Tai_lieu_yeu_cau_du_an.pdf',
          fileSize: '2.4 MB',
          fileType: 'PDF',
          uploadedAt: 'Hôm qua',
        },
      ])
    } else {
      setAttachments([])
    }

    // Comments
    if (task.comments && task.comments.length > 0) {
      setComments(task.comments)
    } else {
      setComments([
        {
          id: 'cmt-1',
          authorName: 'Quản lý dự án',
          content: 'Đã hoàn tất phân tích spec. Hãy cập nhật tiến độ liên tục trên bảng nhé.',
          createdAt: '2 giờ trước',
        },
      ])
    }

    // Labels
    if (task.labels && task.labels.length > 0) {
      setLabels(task.labels.map((l) => ({ name: l.name, color: l.color || 'primary' })))
    } else {
      setLabels([
        { name: 'Frontend', color: 'primary' },
        { name: 'Sprint 1', color: 'info' },
      ])
    }

    // Activity Logs
    if (task.activityLogs && task.activityLogs.length > 0) {
      setActivityLogs(task.activityLogs)
    } else {
      setActivityLogs([
        {
          id: 'log-1',
          userName: 'Hệ thống',
          action: 'Đã khởi tạo công việc vào quy trình',
          timestamp: 'Hôm nay',
        },
      ])
    }
  }, [task, columns])

  if (!task) return null

  // Calculate checklist completion percentage
  const completedCount = checklists.filter((c) => c.isCompleted).length
  const checklistPercentage =
    checklists.length > 0 ? Math.round((completedCount / checklists.length) * 100) : 0

  // Save changes to current task
  const handleSaveAll = (overrides?: Partial<KanbanTask>) => {
    const updated: KanbanTask = {
      ...task,
      title: title.trim() || task.title,
      description: description.trim(),
      columnId,
      priority,
      startDate: startDate || null,
      dueDate: dueDate || null,
      assignees: assigneeName ? [{ id: 'user-assigned', fullName: assigneeName }] : [],
      labels: labels.map((l) => ({ id: l.name, name: l.name, color: l.color || 'primary' })),
      checklists,
      attachments,
      comments,
      activityLogs,
      commentCount: comments.length,
      attachmentCount: attachments.length,
      ...overrides,
    }
    onUpdateTask(updated)
  }

  // Toggle Checklist
  const toggleChecklist = (id: string) => {
    const next = checklists.map((item) =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item,
    )
    setChecklists(next)
    handleSaveAll({ checklists: next })
  }

  // Add Checklist item
  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return
    const newItem: TaskChecklistItem = {
      id: `chk-${Date.now()}`,
      title: newChecklistText.trim(),
      isCompleted: false,
    }
    const next = [...checklists, newItem]
    setChecklists(next)
    setNewChecklistText('')
    setShowAddChecklist(false)
    handleSaveAll({ checklists: next })
  }

  // Delete Checklist item
  const deleteChecklistItem = (id: string) => {
    const next = checklists.filter((c) => c.id !== id)
    setChecklists(next)
    handleSaveAll({ checklists: next })
  }

  // Add Comment
  const handleAddComment = () => {
    if (!newCommentText.trim()) return
    const newCmt: TaskComment = {
      id: `cmt-${Date.now()}`,
      authorName: 'Bạn (Người dùng)',
      content: newCommentText.trim(),
      createdAt: 'Vừa xong',
    }
    const next = [newCmt, ...comments]
    setComments(next)
    setNewCommentText('')

    // Add activity
    const nextLogs: TaskActivityLog[] = [
      {
        id: `log-${Date.now()}`,
        userName: 'Bạn',
        action: 'Đã thêm bình luận mới',
        timestamp: 'Vừa xong',
      },
      ...activityLogs,
    ]
    setActivityLogs(nextLogs)

    handleSaveAll({ comments: next, commentCount: next.length, activityLogs: nextLogs })
  }

  // Add Label
  const handleAddLabel = () => {
    if (!newLabelText.trim()) return
    if (labels.some((l) => l.name.toLowerCase() === newLabelText.trim().toLowerCase())) return
    const next = [...labels, { name: newLabelText.trim(), color: 'info' }]
    setLabels(next)
    setNewLabelText('')
    handleSaveAll({ labels: next.map((l) => ({ id: l.name, name: l.name, color: l.color })) })
  }

  // Remove Label
  const handleRemoveLabel = (name: string) => {
    const next = labels.filter((l) => l.name !== name)
    setLabels(next)
    handleSaveAll({ labels: next.map((l) => ({ id: l.name, name: l.name, color: l.color })) })
  }

  // Simulated File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE'
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)

    const newAtt: TaskAttachment = {
      id: `att-${Date.now()}`,
      fileName: file.name,
      fileSize: `${sizeMb} MB`,
      fileType: ext,
      uploadedAt: 'Vừa xong',
    }
    const next = [...attachments, newAtt]
    setAttachments(next)

    // Activity
    const nextLogs: TaskActivityLog[] = [
      {
        id: `log-${Date.now()}`,
        userName: 'Bạn',
        action: `Đã đính kèm tệp ${file.name}`,
        timestamp: 'Vừa xong',
      },
      ...activityLogs,
    ]
    setActivityLogs(nextLogs)

    handleSaveAll({ attachments: next, attachmentCount: next.length, activityLogs: nextLogs })
  }

  // Delete Attachment
  const handleDeleteAttachment = (id: string) => {
    const next = attachments.filter((a) => a.id !== id)
    setAttachments(next)
    handleSaveAll({ attachments: next, attachmentCount: next.length })
  }

  // Column Change Handler
  const handleColumnChange = (newColId: string) => {
    setColumnId(newColId)
    const colName = columns.find((c) => c.id === newColId)?.name || newColId
    const nextLogs: TaskActivityLog[] = [
      {
        id: `log-${Date.now()}`,
        userName: 'Bạn',
        action: `Đã chuyển sang cột "${colName}"`,
        timestamp: 'Vừa xong',
      },
      ...activityLogs,
    ]
    setActivityLogs(nextLogs)
    handleSaveAll({ columnId: newColId, activityLogs: nextLogs })
  }

  const currentColumnName = columns.find((c) => c.id === columnId)?.name || 'Cần làm'

  return (
    <CModal visible={visible} onClose={onClose} size="xl" alignment="center">
      {/* Modal Header */}
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
                #{task.id.slice(-6)}
              </span>
              <span className="text-muted small">trong cột</span>
              <CBadge color="primary" shape="rounded-pill" className="px-2 py-1">
                {currentColumnName}
              </CBadge>
            </div>
          </div>
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="p-4 pt-2">
        {/* Editable Title */}
        <div className="mb-4">
          <CFormInput
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleSaveAll()}
            className="border-0 fw-bold fs-4 px-2 py-1 bg-transparent text-dark shadow-none hover-bg-light rounded"
            placeholder="Tiêu đề công việc..."
          />
        </div>

        <CRow className="g-4">
          {/* =========================================================================
              LEFT PANEL (70%): Description, Checklist, Attachments, Comments, Logs
             ========================================================================= */}
          <CCol xs={12} lg={8}>
            {/* 1. Description */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center">
                  <CIcon icon={cilAlignLeft} className="me-2 text-primary" /> Mô tả công việc
                </h6>
                {!isEditingDesc && (
                  <CButton
                    color="light"
                    size="sm"
                    className="border text-secondary py-0 px-2 small"
                    onClick={() => setIsEditingDesc(true)}
                  >
                    Chỉnh sửa
                  </CButton>
                )}
              </div>

              {isEditingDesc ? (
                <div>
                  <CFormTextarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Thêm mô tả chi tiết hơn về yêu cầu, checklist kỹ thuật, v.v..."
                    className="bg-light border-0 shadow-none mb-2"
                    autoFocus
                  />
                  <div className="d-flex gap-2">
                    <CButton
                      color="primary"
                      size="sm"
                      onClick={() => {
                        setIsEditingDesc(false)
                        handleSaveAll()
                      }}
                    >
                      Lưu mô tả
                    </CButton>
                    <CButton
                      color="light"
                      size="sm"
                      className="border"
                      onClick={() => setIsEditingDesc(false)}
                    >
                      Hủy
                    </CButton>
                  </div>
                </div>
              ) : (
                <div
                  className="p-3 rounded-3 bg-light bg-opacity-50 text-dark small cursor-pointer hover-bg-light transition-all border border-light"
                  style={{ minHeight: 70, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                  onClick={() => setIsEditingDesc(true)}
                >
                  {description || (
                    <span className="text-muted fst-italic">
                      Chưa có mô tả chi tiết. Bấm vào đây để thêm mô tả...
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 2. Checklist (Sub-tasks) */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center">
                  <CIcon icon={cilList} className="me-2 text-primary" /> Danh sách kiểm tra (Checklist)
                </h6>
                <span className="small text-muted fw-semibold">{checklistPercentage}%</span>
              </div>

              {/* Progress Bar */}
              <div className="d-flex align-items-center mb-3 gap-2">
                <CProgress
                  value={checklistPercentage}
                  color={checklistPercentage === 100 ? 'success' : 'primary'}
                  className="rounded-pill flex-grow-1"
                  style={{ height: 6 }}
                />
              </div>

              {/* Checklist Items */}
              <div className="list-group list-group-flush mb-2 border rounded-3 bg-white p-2">
                {checklists.map((item) => (
                  <div
                    key={item.id}
                    className="list-group-item d-flex align-items-center bg-transparent px-2 border-0 py-2 hover-bg-light rounded"
                  >
                    <CFormCheck
                      id={item.id}
                      checked={item.isCompleted}
                      onChange={() => toggleChecklist(item.id)}
                      className="me-2 mt-0 cursor-pointer"
                    />
                    <span
                      className={`flex-grow-1 small ${
                        item.isCompleted ? 'text-decoration-line-through text-muted' : 'text-dark'
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleChecklist(item.id)}
                    >
                      {item.title}
                    </span>
                    <CIcon
                      icon={cilTrash}
                      className="text-muted cursor-pointer hover-text-danger ms-2"
                      size="sm"
                      onClick={() => deleteChecklistItem(item.id)}
                      title="Xóa mục này"
                    />
                  </div>
                ))}
              </div>

              {/* Add item input or button */}
              {showAddChecklist ? (
                <div className="p-2 border rounded-3 bg-light">
                  <CFormInput
                    placeholder="Nhập nội dung việc cần kiểm tra..."
                    size="sm"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addChecklistItem()
                      }
                    }}
                    autoFocus
                    className="mb-2"
                  />
                  <div className="d-flex gap-2">
                    <CButton color="primary" size="sm" onClick={addChecklistItem}>
                      Thêm
                    </CButton>
                    <CButton
                      color="light"
                      size="sm"
                      className="border"
                      onClick={() => setShowAddChecklist(false)}
                    >
                      Hủy
                    </CButton>
                  </div>
                </div>
              ) : (
                <CButton
                  color="light"
                  size="sm"
                  className="border fw-medium text-secondary"
                  onClick={() => setShowAddChecklist(true)}
                >
                  <CIcon icon={cilPlus} className="me-1" size="sm" /> Thêm mục kiểm tra
                </CButton>
              )}
            </div>

            {/* 3. Attachments */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center">
                  <CIcon icon={cilPaperclip} className="me-2 text-primary" /> Tệp đính kèm ({attachments.length})
                </h6>
                <label className="btn btn-sm btn-light border text-secondary mb-0 cursor-pointer">
                  <CIcon icon={cilCloudUpload} className="me-1" size="sm" /> Tải tệp lên
                  <input type="file" className="d-none" onChange={handleFileUpload} />
                </label>
              </div>

              {attachments.length > 0 ? (
                <div className="d-flex flex-column gap-2 mb-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="d-flex align-items-center p-2 border rounded-3 bg-white shadow-none justify-content-between"
                    >
                      <div className="d-flex align-items-center min-w-0 me-2">
                        <div
                          className="bg-danger text-white rounded p-1 me-2 d-flex align-items-center justify-content-center fw-bold small flex-shrink-0"
                          style={{ width: 34, height: 34, fontSize: '11px' }}
                        >
                          {att.fileType || 'FILE'}
                        </div>
                        <div className="min-w-0">
                          <div className="fw-semibold text-dark small text-truncate">
                            {att.fileName}
                          </div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>
                            {att.fileSize} • {att.uploadedAt}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex gap-2 flex-shrink-0">
                        <CIcon
                          icon={cilTrash}
                          className="text-muted cursor-pointer hover-text-danger"
                          size="sm"
                          onClick={() => handleDeleteAttachment(att.id)}
                          title="Xóa tệp"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed rounded-3 p-3 text-center bg-light bg-opacity-25">
                  <span className="text-muted small">Chưa có tệp đính kèm nào.</span>
                </div>
              )}
            </div>

            {/* 4. Comments Feed */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3 text-dark d-flex align-items-center">
                <CIcon icon={cilCommentSquare} className="me-2 text-primary" /> Bình luận trao đổi ({comments.length})
              </h6>

              {/* Input write comment */}
              <div className="d-flex gap-3 mb-3 align-items-start">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{ width: 34, height: 34, fontSize: '12px' }}
                >
                  U
                </div>
                <div className="flex-grow-1">
                  <CFormTextarea
                    rows={2}
                    placeholder="Viết phản hồi hoặc cập nhật tiến độ công việc..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="bg-light border-0 shadow-none mb-2"
                  />
                  <CButton
                    color="primary"
                    size="sm"
                    disabled={!newCommentText.trim()}
                    onClick={handleAddComment}
                  >
                    Gửi bình luận
                  </CButton>
                </div>
              </div>

              {/* Comments list */}
              <div className="d-flex flex-column gap-3">
                {comments.map((cmt) => (
                  <div key={cmt.id} className="d-flex gap-3 align-items-start">
                    <div
                      className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                      style={{ width: 34, height: 34, fontSize: '12px' }}
                    >
                      {cmt.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong className="text-dark small">{cmt.authorName}</strong>
                        <span className="text-muted" style={{ fontSize: '11px' }}>
                          {cmt.createdAt}
                        </span>
                      </div>
                      <div className="p-3 rounded-3 bg-light text-dark small" style={{ lineHeight: 1.5 }}>
                        {cmt.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Activity Log (Lịch sử thay đổi) */}
            <div>
              <h6 className="fw-bold mb-3 text-dark d-flex align-items-center">
                <CIcon icon={cilHistory} className="me-2 text-muted" /> Lịch sử hoạt động
              </h6>
              <div className="border-start border-2 ms-2 ps-3 py-1">
                {activityLogs.map((log) => (
                  <div key={log.id} className="mb-2 position-relative">
                    <div
                      className="position-absolute bg-primary rounded-circle"
                      style={{ width: 8, height: 8, left: -20, top: 6 }}
                    />
                    <div className="text-muted small">
                      <strong className="text-dark">{log.userName}</strong> {log.action}
                      <span className="text-muted ms-2" style={{ fontSize: '11px' }}>
                        {log.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CCol>

          {/* =========================================================================
              RIGHT PANEL (30%): Status, Priority, Assignee, Dates, Labels, Actions
             ========================================================================= */}
          <CCol xs={12} lg={4}>
            <div className="bg-light bg-opacity-50 p-3 rounded-3 border border-light d-flex flex-column gap-3">
              {/* Status / Column */}
              <div>
                <label className="text-uppercase text-muted fw-bold small mb-1 d-block" style={{ fontSize: '11px' }}>
                  Cột quy trình (Status)
                </label>
                <CFormSelect
                  value={columnId}
                  onChange={(e) => handleColumnChange(e.target.value)}
                  className="bg-white border-0 shadow-sm fw-semibold text-dark"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </CFormSelect>
              </div>

              {/* Priority */}
              <div>
                <label className="text-uppercase text-muted fw-bold small mb-1 d-block" style={{ fontSize: '11px' }}>
                  Mức độ ưu tiên
                </label>
                <CFormSelect
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value)
                    handleSaveAll({ priority: e.target.value })
                  }}
                  className="bg-white border-0 shadow-sm fw-semibold text-dark"
                >
                  <option value="Low">Thấp</option>
                  <option value="Medium">Trung bình</option>
                  <option value="High">Cao</option>
                  <option value="Critical">Khẩn cấp</option>
                </CFormSelect>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-uppercase text-muted fw-bold small mb-1 d-block" style={{ fontSize: '11px' }}>
                  Người thực hiện (Assignee)
                </label>
                <div className="d-flex align-items-center gap-2 bg-white p-2 rounded-3 border shadow-none">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                    style={{ width: 28, height: 28, fontSize: '11px' }}
                  >
                    <CIcon icon={cilUser} size="sm" />
                  </div>
                  <CFormInput
                    placeholder="Nhập tên người thực hiện..."
                    size="sm"
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    onBlur={() => handleSaveAll()}
                    className="border-0 bg-transparent p-0 shadow-none small fw-semibold"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="border-top pt-3">
                <div className="mb-2">
                  <label className="text-uppercase text-muted fw-bold small mb-1 d-block" style={{ fontSize: '11px' }}>
                    <CIcon icon={cilCalendar} className="me-1" /> Ngày bắt đầu
                  </label>
                  <CFormInput
                    type="date"
                    size="sm"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      handleSaveAll({ startDate: e.target.value })
                    }}
                    className="bg-white border-0 shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-uppercase text-muted fw-bold small mb-1 d-block" style={{ fontSize: '11px' }}>
                    <CIcon icon={cilCalendar} className="me-1" /> Hạn kết thúc (Due Date)
                  </label>
                  <CFormInput
                    type="date"
                    size="sm"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value)
                      handleSaveAll({ dueDate: e.target.value })
                    }}
                    className="bg-white border-0 shadow-sm"
                  />
                </div>
              </div>

              {/* Labels */}
              <div className="border-top pt-3">
                <label className="text-uppercase text-muted fw-bold small mb-2 d-block" style={{ fontSize: '11px' }}>
                  Nhãn phân loại (Tags)
                </label>
                <div className="d-flex flex-wrap gap-1 mb-2">
                  {labels.map((l) => (
                    <CBadge
                      key={l.name}
                      color={l.color || 'primary'}
                      shape="rounded-pill"
                      className="d-inline-flex align-items-center px-2 py-1 small"
                    >
                      {l.name}
                      <CIcon
                        icon={cilX}
                        size="sm"
                        className="ms-1 cursor-pointer"
                        onClick={() => handleRemoveLabel(l.name)}
                      />
                    </CBadge>
                  ))}
                </div>
                <div className="d-flex gap-1">
                  <CFormInput
                    size="sm"
                    placeholder="Thêm nhãn..."
                    value={newLabelText}
                    onChange={(e) => setNewLabelText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddLabel()
                      }
                    }}
                    className="bg-white border-0 shadow-sm"
                  />
                  <CButton color="light" size="sm" className="border bg-white" onClick={handleAddLabel}>
                    +
                  </CButton>
                </div>
              </div>

              {/* Actions: Save & Delete */}
              <div className="border-top pt-3 d-flex flex-column gap-2 mt-auto">
                <CButton
                  color="primary"
                  className="w-100 fw-semibold shadow-sm"
                  onClick={() => {
                    handleSaveAll()
                    onClose()
                  }}
                >
                  Hoàn tất & Đóng
                </CButton>
                {onDeleteTask && (
                  <CButton
                    color="outline-danger"
                    size="sm"
                    className="w-100 fw-medium"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
                        onDeleteTask(task.id)
                      }
                    }}
                  >
                    <CIcon icon={cilTrash} className="me-1" size="sm" /> Xóa công việc
                  </CButton>
                )}
              </div>
            </div>
          </CCol>
        </CRow>
      </CModalBody>
    </CModal>
  )
}

export default TaskDetailModal
