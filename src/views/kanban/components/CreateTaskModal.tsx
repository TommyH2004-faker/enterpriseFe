import React, { useEffect, useMemo, useState } from 'react'

import {
  CAlert,
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

export interface TaskMemberOption {
  id: string
  name: string
  email: string
}

export interface TaskLabelOption {
  id: string
  name: string
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

  const handleLabelChange = (
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
          {error && (
            <CAlert color="danger">
              {error}
            </CAlert>
          )}

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
                <option value={0}>
                  Thấp
                </option>

                <option value={1}>
                  Trung bình
                </option>

                <option value={2}>
                  Cao
                </option>

                <option value={3}>
                  Khẩn cấp
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
            <CFormLabel className="fw-semibold text-dark">
              Label
            </CFormLabel>

            <div className="border rounded p-3 bg-light">
              {safeLabels.length === 0 ? (
                <div className="text-muted small">
                  Chưa có label trong dự án.
                </div>
              ) : (
                <div
                  className="row g-2"
                  style={{
                    maxHeight: 160,
                    overflowY: 'auto',
                  }}
                >
                  {safeLabels.map(
                    (label) => (
                      <div
                        className="col-md-4"
                        key={label.id}
                      >
                        <CFormCheck
                          id={`label-${label.id}`}
                          label={label.name}
                          checked={labelIds.includes(
                            label.id,
                          )}
                          onChange={() =>
                            handleLabelChange(
                              label.id,
                            )
                          }
                        />
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
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