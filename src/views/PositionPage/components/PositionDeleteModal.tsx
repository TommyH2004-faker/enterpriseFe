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
import { cilTrash } from '@coreui/icons'
import { Position } from 'src/types/position'
import { POSITION_MESSAGES } from '../contants/positionConstants'
import CIcon from '@coreui/icons-react'
import ToastAlert from 'src/components/ToastAlert'


interface PositionDeleteModalProps {
  visible: boolean
  loading: boolean
  selectedPosition: Position | null
  onClose: () => void
  onConfirm: () => void
}

const PositionDeleteModal: React.FC<PositionDeleteModalProps> = ({
  visible,
  loading,
  selectedPosition,
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
        <CModalTitle className="fw-bold">
          {POSITION_MESSAGES.CONFIRM_DELETE}
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="p-4">
        <p className="mb-0">
          {POSITION_MESSAGES.DELETE_CONFIRM}{' '}
          <strong>
            {selectedPosition?.name}
          </strong>
          ?
        </p>

        {selectedPosition && selectedPosition.employeeCount > 0 && (
          <ToastAlert
            message={`${POSITION_MESSAGES.DELETE_WARNING} ${selectedPosition.employeeCount} ${POSITION_MESSAGES.DELETE_WARNING_EMPLOYEES}`}
          />
        )}
      </CModalBody>

      <CModalFooter>
        <CButton
          color="secondary"
          variant="outline"
          onClick={onClose}
        >
          {POSITION_MESSAGES.CANCEL}
        </CButton>

        <CButton
          color="danger"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <CSpinner size="sm" />
          ) : (
            <>
              <CIcon
                icon={cilTrash}
                className="me-2"
              />

              {POSITION_MESSAGES.BUTTON_DELETE}
            </>
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default PositionDeleteModal