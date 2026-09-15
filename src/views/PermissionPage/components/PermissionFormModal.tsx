import React from 'react'
import {
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

import {
  Permission,
  PermissionForm,
} from 'src/types/permission'

interface PermissionFormModalProps {
  visible: boolean
  loading?: boolean
  editingPermission: Permission | null
  form: PermissionForm
  formError?: string | null

  onClose: () => void
  onSubmit: () => void | Promise<void>
  onFormChange: (
    updates: Partial<PermissionForm>,
  ) => void
}

const PermissionFormModal: React.FC<
  PermissionFormModalProps
> = ({
  visible,
  loading = false,
  editingPermission,
  form,
  formError,
  onClose,
  onSubmit,
  onFormChange,
}) => {
  const isEditing = !!editingPermission

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>
          {isEditing
            ? 'Chỉnh sửa permission'
            : 'Thêm permission'}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {/* =====================================================
            ERROR
        ====================================================== */}

        {formError && (
          <div className="alert alert-danger">
            {formError}
          </div>
        )}

        <CForm>
          {/* ===================================================
              CODE
          ==================================================== */}

          <div className="mb-3">
            <CFormLabel>Code</CFormLabel>

            <CFormInput
              value={form.code}
              disabled={isEditing}
              onChange={(e) =>
                onFormChange({
                  code: e.target.value,
                })
              }
              placeholder="VD: EMPLOYEE.CREATE"
            />

            {isEditing && (
              <small className="text-body-secondary">
                Permission code không thể thay đổi.
              </small>
            )}
          </div>

          {/* ===================================================
              MODULE + ACTION
          ==================================================== */}

          <div className="row">
            <div className="col-md-6 mb-3">
              <CFormLabel>Module</CFormLabel>

              <CFormInput
                value={form.module}
                onChange={(e) =>
                  onFormChange({
                    module: e.target.value,
                  })
                }
                placeholder="VD: EMPLOYEE"
              />
            </div>

            <div className="col-md-6 mb-3">
              <CFormLabel>Action</CFormLabel>

              <CFormInput
                value={form.action}
                onChange={(e) =>
                  onFormChange({
                    action: e.target.value,
                  })
                }
                placeholder="VD: CREATE"
              />
            </div>
          </div>

          {/* ===================================================
              DISPLAY NAME
          ==================================================== */}

          <div className="mb-3">
            <CFormLabel>Tên hiển thị</CFormLabel>

            <CFormInput
              value={form.displayName}
              onChange={(e) =>
                onFormChange({
                  displayName: e.target.value,
                })
              }
              placeholder="Create Employee"
            />
          </div>

          {/* ===================================================
              DESCRIPTION
          ==================================================== */}

          <div className="mb-3">
            <CFormLabel>Mô tả</CFormLabel>

            <CFormTextarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                onFormChange({
                  description: e.target.value,
                })
              }
              placeholder="Mô tả permission..."
            />
          </div>
        </CForm>
      </CModalBody>

      {/* =====================================================
          FOOTER
      ====================================================== */}

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
          color="primary"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading && (
            <CSpinner
              size="sm"
              className="me-2"
            />
          )}

          {isEditing
            ? 'Lưu thay đổi'
            : 'Tạo permission'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default PermissionFormModal