import { useState } from 'react'
import roleService from 'src/services/roleService'
import toast from 'react-hot-toast'
import type { Role } from 'src/types/role'
import { ROLE_MESSAGES } from '../contants/RoleConstants'


export interface UseRoleDeleteReturn {
  showModal: boolean
  selectedRole: Role | null
  loading: boolean

  // Actions
  openModal: (role: Role) => void
  closeModal: () => void
  handleDelete: () => Promise<boolean>
}

/**
 * Hook để quản lý delete modal state và logic
 */
export const useRoleDelete = (
  onSuccess: () => Promise<void>,
  onNavigatePreviousPage?: () => void
): UseRoleDeleteReturn => {
  // =========================================================
  // STATE
  // =========================================================

  const [showModal, setShowModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)

  // =========================================================
  // HANDLERS
  // =========================================================

  const openModal = (role: Role) => {
    setSelectedRole(role)
    setShowModal(true)
  }

  const closeModal = () => {
    if (loading) return

    setSelectedRole(null)
    setShowModal(false)
  }

  const handleDelete = async (): Promise<boolean> => {
    if (!selectedRole) {
      return false
    }

    try {
      setLoading(true)

      await roleService.delete(selectedRole.id)

      toast.success(ROLE_MESSAGES.TOAST_DELETE_SUCCESS)

      setSelectedRole(null)
      setShowModal(false)

      // Call callback to handle pagination if needed
      if (onNavigatePreviousPage) {
        onNavigatePreviousPage()
      }

      await onSuccess()
      return true
    } catch (err: any) {
      console.error('Delete role failed:', err)

      const message =
        err?.response?.data?.message ||
        ROLE_MESSAGES.TOAST_DELETE_ERROR

      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // RETURN
  // =========================================================

  return {
    showModal,
    selectedRole,
    loading,

    openModal,
    closeModal,
    handleDelete,
  }
}