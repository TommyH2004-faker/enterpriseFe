import React, { useEffect, useState } from 'react'
import {
  CButton,
  CForm,
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
import { User } from 'src/types/user'


interface RoleOption {
  id: string
  code: string
  displayName: string
}

interface PermissionOption {
  id: string
  code: string
  module: string
  action: string
  displayName: string
  description: string
}

interface UserForm {
  username: string
  email: string
  fullName: string
  status: number
  roleIds: string[]
  rolePermissions: Record<string, string[]>
}

interface UserFormModalProps {
  visible: boolean
  loading?: boolean
  editingUser: User | null
  form: UserForm
  formError?: string | null
  roles?: RoleOption[]
  permissions?: PermissionOption[]
  onClose: () => void
  onSubmit: (form: UserForm) => void | Promise<void>
  onFormChange: (updates: Partial<UserForm>) => void
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  visible,
  loading = false,
  editingUser,
  form,
  formError,
  roles = [],
  permissions = [],
  onClose,
  onSubmit,
  onFormChange,
}) => {




  const handleChange = (
    field: keyof UserForm,
    value: string | number | string[] | Record<string, string[]>,
  ) => {
    onFormChange({
      [field]: value,
    } as Partial<UserForm>)
  }

  

 const removeRole = (roleId: string) => {
  const roleIds = form.roleIds.filter((id) => id !== roleId)

  const rolePermissions = { ...form.rolePermissions }
  delete rolePermissions[roleId]

  onFormChange({
    roleIds,
    rolePermissions,
  })
}

  const togglePermission = (
    roleId: string,
    permissionId: string,
  ) => {
    const current =
      form.rolePermissions[roleId] ?? []

    const exists = current.includes(permissionId)

    const next = exists
      ? current.filter((id) => id !== permissionId)
      : [...current, permissionId]

    onFormChange({
      rolePermissions: {
        ...form.rolePermissions,
        [roleId]: next,
      },
    })
  }

  const getRole = (roleId: string) =>
    roles.find((role) => role.id === roleId)

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>
          {editingUser
            ? 'Chỉnh sửa người dùng'
            : 'Thêm người dùng'}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {formError && (
          <div className="alert alert-danger">
            {formError}
          </div>
        )}

        <CForm>
          <div className="row g-3">
            <div className="col-md-6">
              <CFormLabel>Tên đăng nhập</CFormLabel>
              <CFormInput
                value={form.username}
                disabled={!!editingUser}
                onChange={(e) =>
                  handleChange('username', e.target.value)
                }
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div className="col-md-6">
              <CFormLabel>Email</CFormLabel>
              <CFormInput
                type="email"
                value={form.email}
                onChange={(e) =>
                  handleChange('email', e.target.value)
                }
                placeholder="example@gmail.com"
              />
            </div>

            <div className="col-md-8">
              <CFormLabel>Họ và tên</CFormLabel>
              <CFormInput
                value={form.fullName}
                onChange={(e) =>
                  handleChange('fullName', e.target.value)
                }
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="col-md-4">
              <CFormLabel>Trạng thái</CFormLabel>
              <CFormSelect
                value={form.status}
                onChange={(e) =>
                  handleChange(
                    'status',
                    Number(e.target.value),
                  )
                }
              >
                <option value={1}>Chờ kích hoạt</option>
                <option value={2}>Hoạt động</option>
                <option value={3}>Không hoạt động</option>
                <option value={4}>Đã khóa</option>
                <option value={5}>Đã xóa</option>
              </CFormSelect>
            </div>
          </div>

          <hr className="my-4" />

          <h6 className="fw-semibold mb-3">
            Vai trò và quyền
          </h6>

          <div className="mb-3">
        <CFormLabel>Vai trò</CFormLabel>

        <div className="border rounded p-3">
            {roles.map((role) => {
            const checked = form.roleIds.includes(role.id)

            return (
                <div key={role.id} className="mb-2">
                <label
                    className="d-flex align-items-center gap-2"
                    style={{ cursor: 'pointer' }}
                >
                    <input
                    type="checkbox"
                    className="form-check-input"
                    checked={checked}
                    onChange={(e) => {
                        const roleIds = e.target.checked
                        ? [...form.roleIds, role.id]
                        : form.roleIds.filter(
                            (id) => id !== role.id,
                            )

                        const rolePermissions = {
                        ...form.rolePermissions,
                        }

                        if (e.target.checked) {
                        rolePermissions[role.id] =
                            rolePermissions[role.id] ?? []
                        } else {
                        delete rolePermissions[role.id]
                        }

                        onFormChange({
                        roleIds,
                        rolePermissions,
                        })
                    }}
                    />

                    <span>
                    <strong>{role.displayName}</strong>
                    <span className="text-body-secondary ms-2">
                        ({role.code})
                    </span>
                    </span>
                </label>
                </div>
            )
            })}
        </div>
        </div>

          {form.roleIds.map((roleId) => {
            const role = getRole(roleId)

            return (
              <div
                key={roleId}
                className="border rounded p-3 mb-3"
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="fw-semibold">
                      {role?.displayName ?? roleId}
                    </div>

                    {role?.code && (
                      <small className="text-body-secondary">
                        {role.code}
                      </small>
                    )}
                  </div>
                </div>

                <div className="row g-2">
                  {permissions.length === 0 ? (
                    <div className="text-body-secondary">
                      Không có quyền để lựa chọn.
                    </div>
                  ) : (
                    permissions.map((permission) => {
                      const checked =
                        form.rolePermissions[roleId]?.includes(
                          permission.id,
                        ) ?? false

                      return (
                        <div
                          key={permission.id}
                          className="col-md-6"
                        >
                          <label
                            className="border rounded p-2 d-flex gap-2 align-items-start"
                            style={{
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              className="form-check-input mt-1"
                              checked={checked}
                              onChange={() =>
                                togglePermission(
                                  roleId,
                                  permission.id,
                                )
                              }
                            />

                            <span>
                              <span className="d-block fw-semibold">
                                {permission.displayName}
                              </span>

                              <small className="text-body-secondary">
                                {permission.code}
                              </small>
                            </span>
                          </label>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </CForm>
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
          color="primary"
          onClick={() => onSubmit(form)}
          disabled={loading}
        >
          {loading && (
            <CSpinner
              size="sm"
              className="me-2"
            />
          )}

          {editingUser ? 'Lưu thay đổi' : 'Tạo người dùng'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default UserFormModal