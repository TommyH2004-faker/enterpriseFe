import React from 'react'
import {
  CAlert,
  CBadge,
  CButton,

  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import { cilTrash } from '@coreui/icons'
import type { Role } from 'src/types/role'
import { ROLE_MESSAGES } from '../contants/RoleConstants'
import CIcon from '@coreui/icons-react'


interface RoleDeleteModalProps {
  visible: boolean
  loading: boolean
  selectedRole: Role | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

/**
 * Component modal để xác nhận xóa Role
 */
const RoleDeleteModal: React.FC<RoleDeleteModalProps> = ({
  visible,
  loading,
  selectedRole,
  onClose,
  onConfirm,
}) => {
  return (
    <CModal
      visible={visible}
      onClose={onClose}
      alignment="center"
    >
      <CModalHeader>
        <CModalTitle>
          {ROLE_MESSAGES.MODAL_TITLE_DELETE}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        <p className="mb-3">
          {ROLE_MESSAGES.DELETE_CONFIRM_MSG}
        </p>

        {selectedRole && (
          <div className="border rounded p-3 bg-body-tertiary">
            <div className="mb-2">
              <span className="text-body-secondary">
                {ROLE_MESSAGES.DELETE_LABEL_CODE}
              </span>{' '}
              <CBadge color="secondary">
                {selectedRole.code}
              </CBadge>
            </div>

            <div className="mb-2">
              <span className="text-body-secondary">
                {ROLE_MESSAGES.DELETE_LABEL_NAME}
              </span>{' '}
              <strong>{selectedRole.displayName}</strong>
            </div>

            <div>
              <span className="text-body-secondary">
                {ROLE_MESSAGES.DELETE_LABEL_DESC}
              </span>{' '}
              {selectedRole.description}
            </div>
          </div>
        )}

        <CAlert color="warning" className="mt-3 mb-0">
          <strong>Lưu ý:</strong>{' '}
          {ROLE_MESSAGES.DELETE_WARNING}
        </CAlert>
      </CModalBody>

      <CModalFooter>
        <CButton
          color="secondary"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {ROLE_MESSAGES.BTN_CANCEL}
        </CButton>

        <CButton
          color="danger"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <CSpinner size="sm" className="me-2" />
              {ROLE_MESSAGES.BTN_DELETE_LOADING}
            </>
          ) : (
            <>
              <CIcon icon={cilTrash} className="me-2" />
              {ROLE_MESSAGES.BTN_DELETE_CONFIRM}
            </>
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default RoleDeleteModal