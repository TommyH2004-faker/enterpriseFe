
import React, { useEffect, useMemo, useRef } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CFormCheck,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCheck,
  cilSearch,
  cilX,
} from '@coreui/icons'

import type { Role } from 'src/types/role'
import type { Permission } from 'src/types/permission'

import { useRolePermission } from '../hooks/useRolePermission'
import toast from 'react-hot-toast'

interface RolePermissionModalProps {
  visible: boolean
  role: Role | null
  onClose: () => void
  onSaved?: () => void
}

const RolePermissionModal: React.FC<
  RolePermissionModalProps
> = ({
  visible,
  role,
  onClose,
  onSaved,
}) => {
  const roleId = role?.id ?? null

  const {
    permissions,
    selectedPermissionIds,
    loading,
    saving,
    error,

    search,
    setSearch,

    togglePermission,
    toggleModule,

    isModuleFullySelected,
    isModulePartiallySelected,

    selectAll,
    clearAll,

    save,
  } = useRolePermission(roleId)

  /**
   * Group permissions by module.
   */
  const groupedPermissions = useMemo(() => {
    return permissions.reduce<
      Record<string, Permission[]>
    >((groups, permission) => {
      if (!groups[permission.module]) {
        groups[permission.module] = []
      }

      groups[permission.module].push(
        permission,
      )

      return groups
    }, {})
  }, [permissions])

  const modules = Object.keys(
    groupedPermissions,
  )

  /**
   * Total selected permission count.
   */
  const selectedCount =
    selectedPermissionIds.size

  /**
   * Search result count.
   */
  const visibleCount = permissions.length

  /**
   * Checkbox refs for indeterminate state.
   */
  const moduleCheckboxRefs =
    useRef<
      Record<
        string,
        HTMLInputElement | null
      >
    >({})

  useEffect(() => {
    modules.forEach((module) => {
      const checkbox =
        moduleCheckboxRefs.current[module]

      if (checkbox) {
        checkbox.indeterminate =
          isModulePartiallySelected(module)
      }
    })
  }, [
    modules,
    isModulePartiallySelected,
  ])

  /**
   * Save changes.
   */
  const handleSave = async () => {
    const success = await save()

    if (!success) {
      return
    }
    toast.success('Cập nhật quyền thành công.')
    onSaved?.()
    onClose()
  }

  /**
   * Reset search when modal closes.
   */
  useEffect(() => {
    if (!visible) {
      setSearch('')
    }
  }, [visible, setSearch])

  if (!role) {
    return null
  }

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      alignment="center"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>
          <div className="d-flex align-items-center gap-2">
            <span>Phân quyền</span>

            <CBadge color="primary">
              {role.code}
            </CBadge>
          </div>

          <div className="small text-body-secondary mt-1">
            {role.displayName}
          </div>
        </CModalTitle>
      </CModalHeader>

      <CModalBody
        style={{
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        {error && (
          <CAlert
            color="danger"
            className="mb-3"
          >
            {error}
          </CAlert>
        )}

        {/* Toolbar */}
        <div className="d-flex flex-column flex-md-row gap-2 mb-3">
          <div className="flex-grow-1 position-relative">
            <CIcon
              icon={cilSearch}
              className="position-absolute top-50 translate-middle-y ms-3 text-body-secondary"
            />

            <CFormInput
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Tìm kiếm quyền..."
              className="ps-5"
            />
          </div>

          <div className="d-flex gap-2">
            <CButton
              color="primary"
              variant="outline"
              onClick={selectAll}
              disabled={
                loading ||
                permissions.length === 0
              }
            >
              Chọn tất cả
            </CButton>

            <CButton
              color="secondary"
              variant="outline"
              onClick={clearAll}
              disabled={
                loading ||
                selectedCount === 0
              }
            >
              Bỏ chọn
            </CButton>
          </div>
        </div>

        {/* Statistics */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="small text-body-secondary">
            Hiển thị{' '}
            <strong>{visibleCount}</strong>{' '}
            quyền
          </div>

          <div className="small">
            Đã chọn{' '}
            <strong className="text-primary">
              {selectedCount}
            </strong>{' '}
            quyền
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="d-flex justify-content-center py-5">
            <CSpinner />
          </div>
        )}

        {/* Empty */}
        {!loading &&
          permissions.length === 0 && (
            <div className="text-center py-5 text-body-secondary">
              {search
                ? 'Không tìm thấy quyền phù hợp.'
                : 'Chưa có permission nào.'}
            </div>
          )}

        {/* Permission groups */}
        {!loading &&
          modules.map((module) => {
            const modulePermissions =
              groupedPermissions[module]

            const moduleSelectedCount =
              modulePermissions.filter(
                (permission) =>
                  selectedPermissionIds.has(
                    permission.id,
                  ),
              ).length

            const fullySelected =
              isModuleFullySelected(module)

            return (
              <div
                key={module}
                className="border rounded mb-3"
              >
                {/* Module header */}
                <div className="d-flex align-items-center justify-content-between px-3 py-2 bg-body-tertiary border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <input
                      ref={(element) => {
                        moduleCheckboxRefs.current[
                          module
                        ] = element
                      }}
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={fullySelected}
                      onChange={() =>
                        toggleModule(module)
                      }
                    />

                    <span className="fw-semibold">
                      {module}
                    </span>

                    <CBadge
                      color={
                        moduleSelectedCount > 0
                          ? 'primary'
                          : 'secondary'
                      }
                    >
                      {moduleSelectedCount}/
                      {
                        modulePermissions.length
                      }
                    </CBadge>
                  </div>

                  <button
                    type="button"
                    className="btn btn-link btn-sm text-decoration-none p-0"
                    onClick={() =>
                      toggleModule(module)
                    }
                  >
                    {fullySelected
                      ? 'Bỏ chọn'
                      : 'Chọn tất cả'}
                  </button>
                </div>

                {/* Permission rows */}
                <div className="p-2">
                  {modulePermissions.map(
                    (permission) => {
                      const checked =
                        selectedPermissionIds.has(
                          permission.id,
                        )

                      return (
                        <div
                          key={permission.id}
                          className="d-flex align-items-start gap-2 px-2 py-2 rounded"
                          style={{
                            cursor: 'pointer',
                          }}
                          onClick={() =>
                            togglePermission(
                              permission.id,
                            )
                          }
                        >
                          <div className="pt-1">
                            <CFormCheck
                              checked={checked}
                              onChange={() =>
                                togglePermission(
                                  permission.id,
                                )
                              }
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            />
                          </div>

                          <div className="flex-grow-1">
                            <div className="fw-semibold">
                              {
                                permission.displayName
                              }
                            </div>

                            <div className="small text-body-secondary">
                              {
                                permission.code
                              }
                            </div>

                            {permission.description && (
                              <div className="small text-body-secondary mt-1">
                                {
                                  permission.description
                                }
                              </div>
                            )}
                          </div>

                          <div>
                            {checked && (
                              <CIcon
                                icon={cilCheck}
                                className="text-primary"
                              />
                            )}
                          </div>
                        </div>
                      )
                    },
                  )}
                </div>
              </div>
            )
          })}
      </CModalBody>

      <CModalFooter>
        <CButton
          color="secondary"
          variant="outline"
          onClick={onClose}
          disabled={saving}
        >
          <CIcon
            icon={cilX}
            className="me-1"
          />
          Hủy
        </CButton>

        <CButton
          color="primary"
          onClick={handleSave}
          disabled={loading || saving}
        >
          {saving ? (
            <>
              <CSpinner
                size="sm"
                className="me-2"
              />
              Đang lưu...
            </>
          ) : (
            <>
              <CIcon
                icon={cilCheck}
                className="me-1"
              />
              Lưu thay đổi
            </>
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default RolePermissionModal

