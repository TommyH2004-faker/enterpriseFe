import { useState } from 'react'
import roleService from 'src/services/roleService'
import toast from 'react-hot-toast'
import type { CreateRoleRequest, Role, UpdateRoleRequest } from 'src/types/role'
import { ROLE_MESSAGES, ROLE_VALIDATION } from '../contants/RoleConstants'


export interface RoleFormState {
  code: string
  displayName: string
  description: string
}

export interface UseRoleFormReturn {
  showModal: boolean
  editingRole: Role | null
  form: RoleFormState
  loading: boolean
  error: string | null

  // Actions
  openCreateModal: () => void
  openEditModal: (role: Role) => void
  closeModal: () => void
  setForm: (form: RoleFormState) => void
  resetForm: () => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  clearError: () => void
}

const INITIAL_FORM_STATE: RoleFormState = {
  code: '',
  displayName: '',
  description: '',
}

/**
 * Hook để quản lý form state, validation và submit
 */
export const useRoleForm = (
  onSuccess: () => Promise<void>
): UseRoleFormReturn => {
  // =========================================================
  // STATE
  // =========================================================

  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [form, setForm] = useState<RoleFormState>(INITIAL_FORM_STATE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =========================================================
  // HANDLERS
  // =========================================================

  const resetForm = () => {
    setForm(INITIAL_FORM_STATE)
    setError(null)
  }

  const openCreateModal = () => {
    setEditingRole(null)
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (role: Role) => {
    setEditingRole(role)
    setForm({
      code: role.code,
      displayName: role.displayName,
      description: role.description,
    })
    setError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    if (loading) return

    setShowModal(false)
    setEditingRole(null)
    resetForm()
  }

  const clearError = () => {
    setError(null)
  }

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = (): boolean => {
    if (!form.code.trim()) {
      setError(ROLE_MESSAGES.CODE_REQUIRED)
      return false
    }

    if (form.code.trim().length > ROLE_VALIDATION.CODE_MAX) {
      setError(ROLE_MESSAGES.CODE_MAX_LENGTH)
      return false
    }

    if (!form.displayName.trim()) {
      setError(ROLE_MESSAGES.NAME_REQUIRED)
      return false
    }

    if (form.displayName.trim().length > ROLE_VALIDATION.NAME_MAX) {
      setError(ROLE_MESSAGES.NAME_MAX_LENGTH)
      return false
    }

    if (!form.description.trim()) {
      setError(ROLE_MESSAGES.DESC_REQUIRED)
      return false
    }

    if (form.description.trim().length > ROLE_VALIDATION.DESC_MAX) {
      setError(ROLE_MESSAGES.DESC_MAX_LENGTH)
      return false
    }

    return true
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (editingRole) {
        // ===================================
        // UPDATE
        // ===================================

        const request: UpdateRoleRequest = {
          id: editingRole.id,
          code: form.code.trim(),
          displayName: form.displayName.trim(),
          description: form.description.trim(),
        }

        await roleService.update(request)
        toast.success(ROLE_MESSAGES.TOAST_UPDATE_SUCCESS)
      } else {
        // ===================================
        // CREATE
        // ===================================

        const request: CreateRoleRequest = {
          code: form.code.trim(),
          name: form.displayName.trim(),
          description: form.description.trim(),
        }

        await roleService.create(request)
        toast.success(ROLE_MESSAGES.TOAST_CREATE_SUCCESS)
      }

      await onSuccess()

        setShowModal(false)
        setEditingRole(null)
        resetForm()

    } catch (err: any) {
      console.error('Save role failed:', err)

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        ROLE_MESSAGES.TOAST_SAVE_ERROR

      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // RETURN
  // =========================================================

  return {
    showModal,
    editingRole,
    form,
    loading,
    error,

    openCreateModal,
    openEditModal,
    closeModal,
    setForm,
    resetForm,
    handleSubmit,
    clearError,
  }
}