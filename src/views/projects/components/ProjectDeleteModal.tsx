// src/views/projects/components/ProjectDeleteModal.tsx

import React, { useState } from 'react'

import {
  CButton,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'

interface Props {
  visible: boolean

  projectName: string

  loading?: boolean

  onClose: () => void
  onConfirm: () => void
}

const ProjectDeleteModal: React.FC<Props> = ({
  visible,
  projectName,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const [confirmation, setConfirmation] =
    useState('')

  const canDelete =
    confirmation.trim() ===
    projectName

  const handleClose = () => {
    setConfirmation('')
    onClose()
  }

  const handleConfirm = () => {
    if (!canDelete) return

    onConfirm()
    setConfirmation('')
  }

  return (
    <CModal
      visible={visible}
      onClose={handleClose}
      alignment="center"
    >
      <CModalHeader>
        <CModalTitle>
          Xóa dự án
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        <p>
          Bạn đang chuẩn bị xóa dự án:
        </p>

        <p className="fw-semibold">
          {projectName}
        </p>

        <p className="text-danger">
          Thao tác này có thể ảnh hưởng đến
          dữ liệu liên quan.
        </p>

        <CFormInput
          value={confirmation}
          onChange={(e) =>
            setConfirmation(
              e.target.value,
            )
          }
          placeholder={`Nhập "${projectName}" để xác nhận`}
        />
      </CModalBody>

      <CModalFooter>
        <CButton
          color="light"
          onClick={handleClose}
        >
          Hủy
        </CButton>

        <CButton
          color="danger"
          disabled={
            !canDelete || loading
          }
          onClick={handleConfirm}
        >
          {loading
            ? 'Đang xóa...'
            : 'Xóa dự án'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ProjectDeleteModal