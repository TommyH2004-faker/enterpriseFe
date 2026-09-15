import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Permission,
  PermissionForm,
} from 'src/types/permission'

export const usePermissionForm = (
  createPermission: any,
  updatePermission: any,
) => {
  const [showModal, setShowModal] =
    useState(false)

  const [editingPermission, setEditingPermission] =
    useState<Permission | null>(null)

  const [formError, setFormError] =
    useState<string | null>(null)

  const [form, setForm] =
    useState<PermissionForm>({
      id: '',
      code: '',
      module: '',
      action: '',
      displayName: '',
      description: '',
    })

  const openCreateModal = () => {
    setEditingPermission(null)
    setFormError(null)

    setForm({
      id: '',
      code: '',
      module: '',
      action: '',
      displayName: '',
      description: '',
    })

    setShowModal(true)
  }

  const openEditModal = (
    permission: Permission,
  ) => {
    setEditingPermission(permission)
    setFormError(null)

    setForm({
      id: permission.id,
      code: permission.code,
      module: permission.module,
      action: permission.action,
      displayName: permission.displayName,
      description: permission.description ?? '',
    })

    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPermission(null)
    setFormError(null)
  }

    const handleSubmit = async () => {
    try {
      setFormError(null)

      if (!form.module.trim()) {
        setFormError('Module không được để trống.')
        return
      }

      if (!form.action.trim()) {
        setFormError('Action không được để trống.')
        return
      }

      if (!form.displayName.trim()) {
        setFormError('Tên hiển thị không được để trống.')
        return
      }

      if (editingPermission) {
      await updatePermission(
        editingPermission.id,
        {
          module: form.module.trim(),
          action: form.action.trim(),
          displayName: form.displayName.trim(),
          description: form.description?.trim() ?? '',
        },
      )
      toast.success('Cập nhật permission thành công!')
    } else {
      await createPermission({
        code: form.code.trim(),
        module: form.module.trim(),
        action: form.action.trim(),
        displayName: form.displayName.trim(),
        description: form.description?.trim() ?? '',
      })
      toast.success('Tạo permission thành công!')
    }

      closeModal()
    } catch (error: any) {
      console.error(
        'Permission save error:',
        error?.response?.data,
      )

      setFormError(
        error?.response?.data?.message ??
          error?.response?.data?.title ??
          'Không thể lưu permission.',
      )
    }
  }

  return {
    showModal,
    editingPermission,
    form,
    setForm,
    formError,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
  }
}