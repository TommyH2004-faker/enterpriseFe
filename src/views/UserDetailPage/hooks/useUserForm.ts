import { useState } from 'react'

export const useUserForm = (
  createUser: any,
  updateUserAccess: any,
  getUserPermissions: any,
  getAllRoles: any,
  getAllPermissions: any,
) => {
  const [showModal, setShowModal] = useState(false)

  const [editingUser, setEditingUser] = useState<any>(null)

  const [roles, setRoles] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])

  const [loadingAccess, setLoadingAccess] = useState(false)

  const [formError, setFormError] = useState<string | null>(null)

  const [form, setForm] = useState({
    username: '',
    email: '',
    fullName: '',
    status: 2,
    roleIds: [] as string[],
    rolePermissions: {} as Record<string, string[]>,
  })

  // =========================
  // CREATE
  // =========================
  const openCreateModal = async () => {
    setEditingUser(null)
    setFormError(null)
    setLoadingAccess(true)
    setShowModal(true)

    try {
      const [allRoles, allPermissions] = await Promise.all([
        getAllRoles(),
        getAllPermissions(),
      ])

      setRoles(
        allRoles.map((role: any) => ({
          id: role.id,
          code: role.code,
          displayName: role.displayName,
          description: role.description,
        })),
      )

      setPermissions(
        allPermissions.map((permission: any) => ({
          id: permission.id,
          code: permission.code,
          module: permission.module,
          action: permission.action,
          displayName: permission.displayName,
          description: permission.description,
        })),
      )

      setForm({
        username: '',
        email: '',
        fullName: '',
        status: 2,
        roleIds: [],
        rolePermissions: {},
      })
    } catch {
      setFormError(
        'Không thể tải danh sách role và permission.',
      )
    } finally {
      setLoadingAccess(false)
    }
  }

  // =========================
  // EDIT
  // =========================
  const openEditModal = async (user: any) => {
    setEditingUser(user)
    setFormError(null)
    setLoadingAccess(true)
    setShowModal(true)

    try {
      // Lấy song song:
      // 1. Quyền hiện tại của user
      // 2. Toàn bộ role hệ thống
      // 3. Toàn bộ permission hệ thống
      const [data, allRoles, allPermissions] =
        await Promise.all([
          getUserPermissions(user.id),
          getAllRoles(),
          getAllPermissions(),
        ])

      // =========================
      // TẤT CẢ ROLE
      // =========================
      const mappedRoles = allRoles.map(
        (role: any) => ({
          id: role.id,
          code: role.code,
          displayName: role.displayName,
          description: role.description,
        }),
      )

      // =========================
      // TẤT CẢ PERMISSION
      // =========================
      const mappedPermissions =
        allPermissions.map(
          (permission: any) => ({
            id: permission.id,
            code: permission.code,
            module: permission.module,
            action: permission.action,
            displayName: permission.displayName,
            description: permission.description,
          }),
        )

      // =========================
      // ROLE USER ĐANG CÓ
      // =========================
      const roleIds =
        data.roles?.map(
          (role: any) => role.roleId,
        ) ?? []

      // =========================
      // PERMISSION USER ĐANG CÓ
      // THEO TỪNG ROLE
      // =========================
      const rolePermissions: Record<
        string,
        string[]
      > = {}

      data.roles?.forEach((role: any) => {
        rolePermissions[role.roleId] =
          role.permissions?.map(
            (permission: any) =>
              permission.id,
          ) ?? []
      })

      // =========================
      // SET OPTIONS
      // =========================
      setRoles(mappedRoles)
      setPermissions(mappedPermissions)

      // =========================
      // SET FORM USER
      // =========================
      setForm({
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        status: data.status,
        roleIds,
        rolePermissions,
      })
    } catch {
      setFormError(
        'Không thể tải thông tin quyền người dùng.',
      )
    } finally {
      setLoadingAccess(false)
    }
  }

  // =========================
  // CLOSE
  // =========================
  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
  }

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    try {
      setFormError(null)

      if (!form.username.trim()) {
        setFormError(
          'Username không được để trống.',
        )
        return
      }

      if (!form.email.trim()) {
        setFormError(
          'Email không được để trống.',
        )
        return
      }

      if (!form.fullName.trim()) {
        setFormError(
          'Họ tên không được để trống.',
        )
        return
      }

      if (editingUser) {
        await updateUserAccess(
          editingUser.id,
          form,
        )
      } else {
        await createUser(form)
      }

      closeModal()
    } catch (error: any) {
      setFormError(
        error?.response?.data?.message ??
          'Không thể lưu người dùng.',
      )
    }
  }

  return {
    showModal,
    editingUser,
    form,
    setForm,
    formError,

    openCreateModal,
    openEditModal,
    closeModal,

    handleSubmit,

    roles,
    permissions,

    loadingAccess,

    getUserPermissions,
    getAllRoles,
    getAllPermissions,
  }
}