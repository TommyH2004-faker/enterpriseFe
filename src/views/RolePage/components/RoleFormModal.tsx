import React from 'react'
import {
  CAlert,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,

  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import { cilCheck } from '@coreui/icons'
import type { Role } from 'src/types/role'
import { ROLE_MESSAGES, ROLE_VALIDATION } from '../contants/RoleConstants'
import CIcon from '@coreui/icons-react'


interface RoleFormModalProps {
  visible: boolean
  loading: boolean
  editingRole: Role | null
  form: {
    code: string
    displayName: string
    description: string
  }
  error: string | null
  onClose: () => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  onFormChange: (form: any) => void
}

/**
 * Component modal để tạo hoặc cập nhật Role
 */
const RoleFormModal: React.FC<RoleFormModalProps> = ({
  visible,
  loading,
  editingRole,
  form,
  error,
  onClose,
  onSubmit,
  onFormChange,
}) => {
  return (
    <CModal
      visible={visible}
      onClose={onClose}
      backdrop="static"
      alignment="center"
    >
      <CForm onSubmit={onSubmit}>
        <CModalHeader>
          <CModalTitle>
            {editingRole
              ? ROLE_MESSAGES.MODAL_TITLE_UPDATE
              : ROLE_MESSAGES.MODAL_TITLE_CREATE}
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          {error && (
            <CAlert color="danger" className="mb-3">
              {error}
            </CAlert>
          )}

          {/* CODE */}
          <div className="mb-3">
            <CFormLabel>
              {ROLE_MESSAGES.LABEL_CODE}
              <span className="text-danger"> *</span>
            </CFormLabel>

            <CFormInput
              value={form.code}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  code: e.target.value,
                })
              }
              placeholder={ROLE_MESSAGES.PLACEHOLDER_CODE}
              disabled={loading}
              style={{ textTransform: 'uppercase' }}
            />

            <div className="form-text">
              {ROLE_MESSAGES.HELPER_CODE}
            </div>
          </div>

          {/* DISPLAY NAME */}
          <div className="mb-3">
            <CFormLabel>
              {ROLE_MESSAGES.LABEL_NAME}
              <span className="text-danger"> *</span>
            </CFormLabel>

            <CFormInput
              value={form.displayName}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  displayName: e.target.value,
                })
              }
              placeholder={ROLE_MESSAGES.PLACEHOLDER_NAME}
              disabled={loading}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-0">
            <CFormLabel>
              {ROLE_MESSAGES.LABEL_DESCRIPTION}
              <span className="text-danger"> *</span>
            </CFormLabel>

            <CFormTextarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  description: e.target.value,
                })
              }
              placeholder={ROLE_MESSAGES.PLACEHOLDER_DESCRIPTION}
              disabled={loading}
              maxLength={ROLE_VALIDATION.DESC_MAX}
            />

            <div className="form-text text-end">
              {form.description.length}/{ROLE_VALIDATION.DESC_MAX}
            </div>
          </div>
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
            color="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                {ROLE_MESSAGES.BTN_SAVE}
              </>
            ) : (
              <>
                <CIcon icon={cilCheck} className="me-2" />
                {editingRole
                  ? ROLE_MESSAGES.BTN_UPDATE
                  : ROLE_MESSAGES.BTN_CREATE}
              </>
            )}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default RoleFormModal