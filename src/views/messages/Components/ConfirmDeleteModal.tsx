
import React from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'

interface ConfirmDeleteModalProps {
  visible: boolean
  name?: string
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void | Promise<unknown>
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  name = 'cuộc trò chuyện này',
  loading = false,
  onCancel,
  onConfirm,
}) => {
  return (
    <CModal
      visible={visible}
      onClose={onCancel}
      alignment="center"
      backdrop={loading ? 'static' : true}
      keyboard={!loading}
    >
      <CModalHeader>
        <CModalTitle>Ẩn cuộc trò chuyện</CModalTitle>
      </CModalHeader>

      <CModalBody>
        <p>
          Bạn có chắc chắn muốn ẩn cuộc trò chuyện{' '}
          <strong>{name}</strong> không?
        </p>

        <p className="text-body-secondary mb-0">
          Cuộc trò chuyện sẽ bị ẩn khỏi danh sách của bạn.
          Tin nhắn và dữ liệu của những thành viên khác
          sẽ không bị xóa.
        </p>
      </CModalBody>

      <CModalFooter>
        <CButton
          color="secondary"
          variant="outline"
          disabled={loading}
          onClick={onCancel}
        >
          Hủy
        </CButton>

        <CButton
          color="danger"
          disabled={loading}
          onClick={() => {
            void onConfirm()
          }}
        >
          {loading && (
            <CSpinner size="sm" className="me-2" />
          )}

          {loading ? 'Đang xử lý...' : 'Xác nhận ẩn'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ConfirmDeleteModal

