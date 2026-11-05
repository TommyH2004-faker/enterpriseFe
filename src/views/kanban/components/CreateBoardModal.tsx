import React, { useState } from 'react'
import {
  CButton,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import ToastAlert from 'src/components/ToastAlert'

interface CreateBoardModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (name: string, description: string) => Promise<void>
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [boardName, setBoardName] = useState('')
  const [boardDescription, setBoardDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!boardName.trim()) {
      setError('Vui lòng nhập tên bảng Kanban.')
      return
    }

    try {
      setLoading(true)
      setError('')
      await onSubmit(boardName.trim(), boardDescription.trim())
      setBoardName('')
      setBoardDescription('')
    } catch (err: any) {
      setError(err?.message || 'Không thể tạo board. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} alignment="center">
      <CModalHeader>
        <CModalTitle className="fw-bold">Tạo Kanban board mới</CModalTitle>
      </CModalHeader>
      <form onSubmit={handleSubmit}>
        <CModalBody className="p-4">
          <ToastAlert message={error} />

          <div className="mb-3">
            <CFormLabel className="fw-semibold text-dark">Tên board *</CFormLabel>
            <CFormInput
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="VD: Sprint 1, Quy trình kỹ thuật..."
              autoFocus
            />
          </div>

          <div>
            <CFormLabel className="fw-semibold text-dark">Mô tả</CFormLabel>
            <CFormInput
              value={boardDescription}
              onChange={(e) => setBoardDescription(e.target.value)}
              placeholder="Mô tả luồng công việc của board..."
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="light" className="border px-3" onClick={onClose} type="button">
            Hủy
          </CButton>
          <CButton color="primary" className="px-4 fw-semibold" type="submit" disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Tạo board'}
          </CButton>
        </CModalFooter>
      </form>
    </CModal>
  )
}
