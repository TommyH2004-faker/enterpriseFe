import React from 'react'
import {
  CButton,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import { Position } from 'src/types/position'
import { PositionFormState } from '../hooks/usePositionForm'
import { FORM_LABELS, POSITION_MESSAGES } from '../contants/positionConstants'
import ToastAlert from 'src/components/ToastAlert'


interface PositionFormModalProps {
  visible: boolean
  loading: boolean
  editingPosition: Position | null
  form: PositionFormState
  formError: string | null
  onClose: () => void
  onSubmit: () => void
  onFormChange: (updates: Partial<PositionFormState>) => void
}

const PositionFormModal: React.FC<PositionFormModalProps> = ({
  visible,
  loading,
  editingPosition,
  form,
  formError,
  onClose,
  onSubmit,
  onFormChange,
}) => {
  return (
    <CModal
      visible={visible}
      onClose={onClose}
      alignment="center"
    >
      <CModalHeader>
        <CModalTitle className="fw-bold">
          {editingPosition
            ? POSITION_MESSAGES.TITLE_EDIT
            : POSITION_MESSAGES.TITLE_CREATE}
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="p-4">
        <ToastAlert message={formError} />

        {/* Code */}
        <div className="mb-3">
          <CFormLabel className="fw-semibold">
            {FORM_LABELS.CODE}
            <span className="text-danger"> *</span>
          </CFormLabel>

          <CFormInput
            value={form.code}
            placeholder={POSITION_MESSAGES.PLACEHOLDER_CODE}
            onChange={(e) =>
              onFormChange({ code: e.target.value })
            }
          />
        </div>

        {/* Name */}
        <div className="mb-3">
          <CFormLabel className="fw-semibold">
            {FORM_LABELS.NAME}
            <span className="text-danger"> *</span>
          </CFormLabel>

          <CFormInput
            value={form.name}
            placeholder={POSITION_MESSAGES.PLACEHOLDER_NAME}
            onChange={(e) =>
              onFormChange({ name: e.target.value })
            }
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <CFormLabel className="fw-semibold">
            {FORM_LABELS.DESCRIPTION}
          </CFormLabel>

          <CFormInput
            value={form.description}
            placeholder={POSITION_MESSAGES.PLACEHOLDER_DESC}
            onChange={(e) =>
              onFormChange({ description: e.target.value })
            }
          />
        </div>

        {/* Status */}
        {editingPosition && (
          <div>
            <CFormLabel className="fw-semibold">
              {FORM_LABELS.STATUS}
            </CFormLabel>

            <CFormSelect
              value={form.isActive ? 'active' : 'inactive'}
              onChange={(e) =>
                onFormChange({
                  isActive: e.target.value === 'active',
                })
              }
            >
              <option value="active">
                {POSITION_MESSAGES.STATUS_ACTIVE}
              </option>

              <option value="inactive">
                {POSITION_MESSAGES.STATUS_INACTIVE}
              </option>
            </CFormSelect>
          </div>
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
          color="primary"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <CSpinner
                size="sm"
                className="me-2"
              />
              {POSITION_MESSAGES.BUTTON_SAVE}
            </>
          ) : editingPosition ? (
            POSITION_MESSAGES.BUTTON_EDIT
          ) : (
            POSITION_MESSAGES.BUTTON_CREATE
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default PositionFormModal