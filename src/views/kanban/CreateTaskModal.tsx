import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CForm,
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


interface CreateTaskModalProps {
  visible: boolean
  columns: KanbanColumn[]
  defaultColumnId?: string
  onClose: () => void
  onSubmit: (params: {
    title: string
    description?: string
    priority?: string
    dueDate?: string | null
    columnId?: string
  }) => void
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  columns,
  defaultColumnId,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [columnId, setColumnId] = useState('')
  const [error, setError] = useState('')

  // Default to the first column (Cần làm / To Do) whenever modal opens
  useEffect(() => {
    if (visible) {
      const firstColumn = columns[0]?.id || ''
      setColumnId(defaultColumnId || firstColumn)
      setTitle('')
      setDescription('')
      setPriority('Medium')
      setDueDate('')
      setError('')
    }
  }, [visible, defaultColumnId, columns])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề công việc.')
      return
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || null,
      columnId: columnId || columns[0]?.id,
    })
  }

  return (
    <CModal visible={visible} onClose={onClose} alignment="center" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-bold">Thêm công việc mới</CModalTitle>
      </CModalHeader>
      <form onSubmit={handleSubmit}>
        <CModalBody className="p-4">
          {error && <CAlert color="danger">{error}</CAlert>}

          <div className="mb-3">
            <CFormLabel className="fw-semibold text-dark">Thuộc cột quy trình *</CFormLabel>
            <CFormSelect
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              className="bg-light"
            >
              {columns.map((col, idx) => (
                <option key={col.id} value={col.id}>
                  {col.name} {idx === 0 ? '(Mặc định - Cần làm)' : ''}
                </option>
              ))}
            </CFormSelect>
            <div className="text-muted small mt-1">
              Công việc mới luôn mặc định xuất hiện tại cột đầu tiên của quy trình.
            </div>
          </div>

          <div className="mb-3">
            <CFormLabel className="fw-semibold text-dark">Tiêu đề công việc *</CFormLabel>
            <CFormInput
              placeholder="VD: Thiết kế giao diện trang chủ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <CFormLabel className="fw-semibold text-dark">Mô tả công việc</CFormLabel>
            <CFormTextarea
              rows={3}
              placeholder="Chi tiết yêu cầu, phạm vi và mục tiêu hoàn thành..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <CFormLabel className="fw-semibold text-dark">Mức độ ưu tiên</CFormLabel>
              <CFormSelect
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-light"
              >
                <option value="Low">Thấp</option>
                <option value="Medium">Trung bình</option>
                <option value="High">Cao</option>
                <option value="Critical">Khẩn cấp</option>
              </CFormSelect>
            </div>

            <div className="col-md-6">
              <CFormLabel className="fw-semibold text-dark">Ngày hạn chót (Due Date)</CFormLabel>
              <CFormInput
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-light"
              />
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="light" className="border px-3" onClick={onClose} type="button">
            Hủy
          </CButton>
          <CButton color="primary" className="px-4 fw-semibold" type="submit">
            Tạo công việc
          </CButton>
        </CModalFooter>
      </form>
    </CModal>
  )
}
