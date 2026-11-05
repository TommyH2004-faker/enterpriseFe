import React, { useEffect, useMemo, useState } from 'react'

import {
  CButton,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'

import { KanbanColumn } from 'src/types/KanbanType/kanban'
import { ProjectMemberResponse, projectService } from 'src/services/projectService'
import ToastAlert from 'src/components/ToastAlert'

export interface TaskMemberOption {
  id: string
  name: string
  email: string
}

export interface TaskLabelOption {
  id: string
  name: string
  color?: string
}

interface CreateTaskModalProps {
  visible: boolean

  columns: KanbanColumn[]
  defaultColumnId?: string

  projectId: string
  boardId: string

  members?: TaskMemberOption[]
  labels?: TaskLabelOption[]

  onClose: () => void

  /** Callback tạo label mới từ bên ngoài (KanbanBoard gọi API rồi refresh) */
  onCreateLabel?: (name: string, color: string) => Promise<void>

  onSubmit: (params: {
    projectId: string
    boardId: string
    columnId: string

    title: string
    description: string

    taskType: number
    priority: number

    startDate?: string | null
    dueDate?: string | null

    storyPoint: number
    estimateHour: number

    assigneeIds: string[]
    labelIds: string[]
  }) => void
}

export const CreateTaskModal: React.FC<
  CreateTaskModalProps
> = ({
  visible,
  columns = [],
  defaultColumnId,
  projectId,
  boardId,
  members = [],
  labels = [],
  onClose,
  onCreateLabel,
  onSubmit,
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [priority, setPriority] = useState(1)
  const [taskType, setTaskType] = useState(1)

  const [columnId, setColumnId] = useState('')
  
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')

  const [storyPoint, setStoryPoint] = useState(0)
  const [estimateHour, setEstimateHour] = useState(0)

  const [assigneeIds, setAssigneeIds] =
    useState<string[]>([])

  const [labelIds, setLabelIds] =
    useState<string[]>([])

  const [error, setError] = useState('')

  // --- Label creation inline state ---
  const [isCreatingLabel, setIsCreatingLabel] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#0d6efd')
  const [labelCreating, setLabelCreating] = useState(false)

  const safeColumns = Array.isArray(columns)
    ? columns
    : []

  const safeMembers = Array.isArray(members)
    ? members
    : []

  const safeLabels = Array.isArray(labels)
    ? labels
    : []

  const today = useMemo(
    () => new Date().toISOString().split('T')[0],
    [],
  )

  useEffect(() => {
    if (!visible) return

    const firstColumn =
      safeColumns[0]?.id || ''

    setColumnId(
      defaultColumnId || firstColumn,
    )

    setTitle('')
    setDescription('')

    setPriority(1)
    setTaskType(1)

    setStartDate('')
    setDueDate('')

    setStoryPoint(0)
    setEstimateHour(0)

    setAssigneeIds([])
    setLabelIds([])

    setError('')
    setIsCreatingLabel(false)
    setNewLabelName('')
    setNewLabelColor('#0d6efd')
  }, [
    visible,
    defaultColumnId,
    columns,
  ])
 
  const handleAssigneeChange = (
    memberId: string,
  ) => {
    setAssigneeIds((current) =>
      current.includes(memberId)
        ? current.filter(
            (id) => id !== memberId,
          )
        : [...current, memberId],
    )
  }

  const handleLabelToggle = (
    labelId: string,
  ) => {
    setLabelIds((current) =>
      current.includes(labelId)
        ? current.filter(
            (id) => id !== labelId,
          )
        : [...current, labelId],
    )
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || !onCreateLabel) return
    setLabelCreating(true)
    try {
      await onCreateLabel(newLabelName.trim(), newLabelColor)
      setNewLabelName('')
      setNewLabelColor('#0d6efd')
      setIsCreatingLabel(false)
    } finally {
      setLabelCreating(false)
    }
  }

  const handleSubmit = (
    e: React.FormEvent,
  ) => {
    e.preventDefault()

    setError('')

    if (!projectId) {
      setError(
        'Không xác định được dự án.',
      )
      return
    }

    if (!boardId) {
      setError(
        'Không xác định được Kanban Board.',
      )
      return
    }

    if (!columnId) {
      setError(
        'Vui lòng chọn cột Kanban.',
      )
      return
    }

    if (!title.trim()) {
      setError(
        'Vui lòng nhập tiêu đề công việc.',
      )
      return
    }

    if (storyPoint < 0) {
      setError(
        'Story Point không được nhỏ hơn 0.',
      )
      return
    }

    if (estimateHour < 0) {
      setError(
        'Giờ ước lượng không được nhỏ hơn 0.',
      )
      return
    }

    if (
      startDate &&
      dueDate &&
      dueDate < startDate
    ) {
      setError(
        'Hạn hoàn thành không được trước ngày bắt đầu.',
      )
      return
    }

    if (dueDate && dueDate < today) {
      setError(
        'Hạn hoàn thành không được ở trong quá khứ.',
      )
      return
    }

    if (
      startDate &&
      startDate < today
    ) {
      setError(
        'Ngày bắt đầu không được ở trong quá khứ.',
      )
      return
    }
    
    onSubmit({
      projectId,
      boardId,
      columnId,

      title: title.trim(),

      description:
        description.trim(),

      taskType,
      priority,

      startDate: startDate || null,
      dueDate: dueDate || null,

      storyPoint,
      estimateHour,

      assigneeIds,
      labelIds,
    })
  }

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      alignment="center"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle className="fw-bold">
          Thêm công việc mới
        </CModalTitle>
      </CModalHeader>

      <form onSubmit={handleSubmit}>
        <CModalBody className="p-4">
          <ToastAlert message={error} />

          {/* ========================= */}
          {/* COLUMN */}
          {/* ========================= */}

          <div className="mb-3">
            <CFormLabel className="fw-semibold text-dark">
              Thuộc cột quy trình *
            </CFormLabel>

            <CFormSelect
              value={columnId}
              onChange={(e) =>
                setColumnId(
                  e.target.value,
                )
              }
              className="bg-light"
              disabled={
                safeColumns.length === 0
              }
            >
              {safeColumns.length === 0 ? (
                <option value="">
                  Chưa có cột Kanban
                </option>
              ) : (
                safeColumns.map(
                  (col, idx) => (
                    <option
                      key={col.id}
                      value={col.id}
                    >
                      {col.name}{' '}
                      {idx === 0
                        ? '(Mặc định - Cần làm)'
                        : ''}
                    </option>
                  ),
                )
              )}
            </CFormSelect>

            <div className="text-muted small mt-1">
              Trạng thái công việc sẽ được
              xác định tự động theo cột Kanban.
            </div>
          </div>

          {/* ========================= */}
          {/* TITLE */}
          {/* ========================= */}

          <div className="mb-3">
            <CFormLabel className="fw-semibold text-dark">
              Tiêu đề công việc *
            </CFormLabel>

            <CFormInput
              placeholder="VD: Thiết kế giao diện trang chủ..."
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value,
                )
              }
              autoFocus
            />
          </div>

          {/* ========================= */}
          {/* DESCRIPTION */}
          {/* ========================= */}

          <div className="mb-3">
            <CFormLabel className="fw-semibold text-dark">
              Mô tả công việc
            </CFormLabel>

            <CFormTextarea
              rows={3}
              placeholder="Chi tiết yêu cầu, phạm vi và mục tiêu hoàn thành..."
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value,
                )
              }
            />
          </div>

          {/* ========================= */}
          {/* TYPE + PRIORITY */}
          {/* ========================= */}

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <CFormLabel className="fw-semibold text-dark">
                Loại công việc
              </CFormLabel>

              <CFormSelect
                value={taskType}
                onChange={(e) =>
                  setTaskType(
                    Number(
                      e.target.value,
                    ),
                  )
                }
                className="bg-light"
              >
                <option value={1}>
                  Task
                </option>

                <option value={2}>
                  Bug
                </option>

                <option value={3}>
                  Story
                </option>
              </CFormSelect>
            </div>

            <div className="col-md-6">
              <CFormLabel className="fw-semibold text-dark">
                Mức độ ưu tiên
              </CFormLabel>

              <CFormSelect
                value={priority}
                onChange={(e) =>
                  setPriority(
                    Number(
                      e.target.value,
                    ),
                  )
                }
                className="bg-light"
              >
                 <option value={1}>
                  Thấp
                </option>

                <option value={2}>
                  Trung bình
                </option>
                <option value={3}>
                  Cao
                </option>
              </CFormSelect>
            </div>
          </div>

          {/* ========================= */}
          {/* DATE */}
          {/* ========================= */}

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <CFormLabel className="fw-semibold text-dark">
                Ngày bắt đầu
              </CFormLabel>

              <CFormInput
                type="date"
                value={startDate}
                min={today}
                onChange={(e) =>
                  setStartDate(
                    e.target.value,
                  )
                }
                className="bg-light"
              />
            </div>

            <div className="col-md-6">
              <CFormLabel className="fw-semibold text-dark">
                Hạn hoàn thành
              </CFormLabel>

              <CFormInput
                type="date"
                value={dueDate}
                min={
                  startDate || today
                }
                onChange={(e) =>
                  setDueDate(
                    e.target.value,
                  )
                }
                className="bg-light"
              />
            </div>
          </div>

          {/* ========================= */}
          {/* STORY POINT + ESTIMATE */}
          {/* ========================= */}

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <CFormLabel className="fw-semibold text-dark">
                Story Point
              </CFormLabel>

              <CFormInput
                type="number"
                min={0}
                step={1}
                value={storyPoint}
                onChange={(e) =>
                  setStoryPoint(
                    Math.max(
                      0,
                      Number(
                        e.target.value,
                      ),
                    ),
                  )
                }
                className="bg-light"
              />
            </div>

            <div className="col-md-6">
              <CFormLabel className="fw-semibold text-dark">
                Giờ ước lượng
              </CFormLabel>

              <CFormInput
                type="number"
                min={0}
                step={0.5}
                value={estimateHour}
                onChange={(e) =>
                  setEstimateHour(
                    Math.max(
                      0,
                      Number(
                        e.target.value,
                      ),
                    ),
                  )
                }
                className="bg-light"
              />
            </div>
          </div>

          {/* ========================= */}
          {/* ASSIGNEES */}
          {/* ========================= */}

          <div className="mb-3">
            <CFormLabel className="fw-semibold text-dark">
              Giao cho
            </CFormLabel>

            <div className="border rounded p-3 bg-light">
              {safeMembers.length === 0 ? (
                <div className="text-muted small">
                  Chưa có thành viên trong dự án.
                </div>
              ) : (
                <div
                  className="row g-2"
                  style={{
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}
                >
                  {safeMembers.map(
                    (member) => (
                      <div
                        className="col-md-6"
                        key={member.id}
                      >
                        <CFormCheck
                          id={`assignee-${member.id}`}
                          label={
                            <span>
                              <span className="fw-semibold">
                                {
                                  member.name
                                }
                              </span>

                              <span className="text-muted small ms-1">
                                (
                                {
                                  member.email
                                }
                                )
                              </span>
                            </span>
                          }
                          checked={assigneeIds.includes(
                            member.id,
                          )}
                          onChange={() =>
                            handleAssigneeChange(
                              member.id,
                            )
                          }
                        />
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            <div className="text-muted small mt-1">
              Có thể giao một công việc cho
              nhiều thành viên.
            </div>
          </div>

          {/* ========================= */}
          {/* LABELS */}
          {/* ========================= */}

          <div className="mb-2">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <CFormLabel className="fw-semibold text-dark mb-0">
                Label
              </CFormLabel>
              {onCreateLabel && !isCreatingLabel && (
                <span
                  className="small text-primary fw-semibold"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsCreatingLabel(true)}
                >
                  + Tạo nhãn mới
                </span>
              )}
            </div>

            {/* Nhãn đã chọn — danh sách dọc cuộn */}
            {labelIds.length > 0 && (
              <div
                style={{
                  maxHeight: 90,
                  overflowY: 'auto',
                  background: '#f0f4ff',
                  border: '1px solid #d0d9f0',
                  borderRadius: 6,
                  padding: '4px 0',
                  marginBottom: 8,
                }}
              >
                {labelIds.map((id) => {
                  const label = safeLabels.find((l) => l.id === id)
                  if (!label) return null
                  const color = label.color || '#0d6efd'
                  return (
                    <div
                      key={id}
                      className="d-flex align-items-center justify-content-between px-2 py-1"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span
                          style={{
                            width: 10, height: 10, borderRadius: '50%',
                            backgroundColor: color,
                            display: 'inline-block',
                            flexShrink: 0,
                            border: '1.5px solid rgba(0,0,0,0.1)',
                          }}
                        />
                        <span className="small fw-semibold" style={{ color }}>{label.name}</span>
                      </div>
                      <span
                        style={{ cursor: 'pointer', opacity: 0.5, fontSize: '16px', lineHeight: 1, flexShrink: 0 }}
                        onClick={() => handleLabelToggle(id)}
                        title="Bỏ chọn"
                      >
                        ×
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Form tạo label mới inline */}
            {isCreatingLabel ? (
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
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleCreateLabel() } }}
                  />
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <CButton
                    size="sm" color="light" className="border text-muted" type="button"
                    onClick={() => { setIsCreatingLabel(false); setNewLabelName(''); setNewLabelColor('#0d6efd') }}
                  >
                    Hủy
                  </CButton>
                  <CButton
                    size="sm" color="primary" type="button"
                    disabled={labelCreating || !newLabelName.trim()}
                    onClick={() => void handleCreateLabel()}
                  >
                    Tạo nhãn
                  </CButton>
                </div>
              </div>
            ) : (
              /* Danh sách label — list dọc cuộn */
              <div
                style={{
                  maxHeight: 160,
                  overflowY: 'auto',
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: 6,
                  padding: '4px 0',
                }}
              >
                {safeLabels.length === 0 ? (
                  <div className="text-muted small px-3 py-1">
                    Chưa có label trong dự án.{' '}
                    {onCreateLabel && (
                      <span
                        className="text-primary fw-semibold"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setIsCreatingLabel(true)}
                      >
                        Tạo ngay
                      </span>
                    )}
                  </div>
                ) : (
                  safeLabels.map((label) => {
                    const isSelected = labelIds.includes(label.id)
                    const color = label.color || '#0d6efd'
                    return (
                      <div
                        key={label.id}
                        className="d-flex align-items-center justify-content-between px-3 py-1"
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? `${color}18` : 'transparent',
                          transition: 'background 0.12s',
                        }}
                        onClick={() => handleLabelToggle(label.id)}
                        title={isSelected ? 'Bỏ chọn nhãn này' : 'Chọn nhãn này'}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#e9ecef' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? `${color}18` : 'transparent' }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span
                            style={{
                              width: 10, height: 10, borderRadius: '50%',
                              backgroundColor: color,
                              display: 'inline-block',
                              flexShrink: 0,
                              border: '1.5px solid rgba(0,0,0,0.1)',
                            }}
                          />
                          <span className="small fw-semibold" style={{ color }}>{label.name}</span>
                        </div>
                        {isSelected && (
                          <span style={{ color, fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>✓</span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </CModalBody>

        <CModalFooter>
          <CButton
            color="light"
            className="border px-3"
            onClick={onClose}
            type="button"
          >
            Hủy
          </CButton>

          <CButton
            color="primary"
            className="px-4 fw-semibold"
            type="submit"
            disabled={
              safeColumns.length === 0
            }
          >
            Tạo công việc
          </CButton>
        </CModalFooter>
      </form>
    </CModal>
  )
}

  export default CreateTaskModal