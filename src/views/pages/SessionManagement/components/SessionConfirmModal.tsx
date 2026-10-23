import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'

export type SessionConfirmAction =
  | {
      type: 'single'
      sessionId: string
      username: string
    }
  | {
      type: 'userAll'
      userId: string
      username: string
    }
  | {
      type: 'all'
    }

interface SessionConfirmModalProps {
  action: SessionConfirmAction | null
  loading: boolean
  onClose: () => void
  onConfirm: () => void
}

const SessionConfirmModal = ({
  action,
  loading,
  onClose,
  onConfirm,
}: SessionConfirmModalProps) => {
  const isAll = action?.type === 'all'

  return (
    <CModal
      visible={action !== null}
      onClose={() => {
        if (!loading) onClose()
      }}
      alignment="center"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>
          {isAll
            ? 'Đăng xuất tất cả session trên hệ thống?'
            : 'Đăng xuất session?'}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {action && (
          <>
            <p className="mb-2">
              {action.type === 'single' ? (
                <>
                  Bạn có chắc chắn muốn thu hồi session của người dùng{' '}
                  <strong>{action.username}</strong> không?
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn thu hồi{' '}
                  <strong>
                    tất cả session đang hoạt động trên toàn hệ thống
                  </strong>
                  không?
                </>
              )}
            </p>

            <p className="text-body-secondary mb-0">
              {action.type === 'single'
                ? 'Người dùng cần đăng nhập lại trên thiết bị này. Các session khác vẫn giữ nguyên.'
                : 'Thao tác này ảnh hưởng đến tất cả tài khoản có session đang hoạt động. Người dùng có thể cần đăng nhập lại trên các thiết bị.'}
            </p>
          </>
        )}
      </CModalBody>

      <CModalFooter>
        <CButton
          color="secondary"
          variant="outline"
          disabled={loading}
          onClick={onClose}
        >
          Hủy
        </CButton>

        <CButton
          color="danger"
          disabled={!action || loading}
          onClick={onConfirm}
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận đăng xuất'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default SessionConfirmModal