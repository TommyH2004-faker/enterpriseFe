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
import { User } from 'src/types/user'


interface UserDeleteModalProps {
  visible: boolean
  loading?: boolean
  selectedUser: User | null
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

const UserDeleteModal: React.FC<UserDeleteModalProps> = ({
  visible,
  loading = false,
  selectedUser,
  onClose,
  onConfirm,
}) => {
  return (
    <CModal
      visible={visible}
      onClose={onClose}
      alignment="center"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>Xác nhận xóa người dùng</CModalTitle>
      </CModalHeader>

      <CModalBody>
        {selectedUser ? (
          <>
            <p className="mb-2">
              Bạn có chắc chắn muốn xóa người dùng:
            </p>

            <div className="border rounded p-3">
              <div className="fw-semibold">
                {selectedUser.fullName}
              </div>

              <div className="small text-body-secondary">
                @{selectedUser.username}
              </div>

              <div className="small text-body-secondary">
                {selectedUser.email}
              </div>
            </div>

            <p className="text-danger small mt-3 mb-0">
              Hành động này không nên thực hiện nếu người dùng
              vẫn đang được sử dụng trong hệ thống.
            </p>
          </>
        ) : (
          <p>Không có người dùng được chọn.</p>
        )}
      </CModalBody>

      <CModalFooter>
        <CButton
          color="secondary"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Hủy
        </CButton>

        <CButton
          color="danger"
          onClick={onConfirm}
          disabled={loading || !selectedUser}
        >
          {loading && (
            <CSpinner
              size="sm"
              className="me-2"
            />
          )}

          Xóa người dùng
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default UserDeleteModal