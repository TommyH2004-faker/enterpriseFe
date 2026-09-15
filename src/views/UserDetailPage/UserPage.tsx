import React, { useState } from 'react'
import { CAlert, CCard } from '@coreui/react'
import toast from 'react-hot-toast'
import { useUserFilters } from './hooks/useUserFilters'
import { useUserStatistics } from './hooks/useUserStatistics'
import { useUser } from './hooks/useUser'
import { useUserForm } from './hooks/useUserForm'
import UserPageHeader from './components/UserPageHeader'
import UserStatistics from './components/UserStatistics'
import UserTableHeader from './components/UserTableHeader'
import UserTable from './components/UserTable'
import UserTableFooter from './components/UserTableFooter'
import UserFormModal from './components/UserFormModal'
import UserDeleteModal from './components/UserDeleteModal'



const UserPage = () => {
  const {
    users,
    loading,
    error,
    createUser,
    updateUserAccess,
    deleteUser,
    getUserPermissions,
    getAllRoles,
    getAllPermissions,
  } = useUser()

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    filteredUsers,
  } = useUserFilters(users)

  const stats = useUserStatistics(users)

const {
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
} = useUserForm(
  createUser,
  updateUserAccess,
  getUserPermissions,
  getAllRoles,
  getAllPermissions,
)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const openDeleteModal = (user: any) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setSelectedUser(null)
    setShowDeleteModal(false)
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    try {
      await deleteUser(selectedUser.id)
      closeDeleteModal()
      toast.success('Xóa người dùng thành công')
    } catch {
      toast.error('Không thể xóa người dùng')
    }
  }

  return (
    <div className="user-page">
      <UserPageHeader onAddClick={openCreateModal} />

      {error && (
        <CAlert
          color="danger"
          dismissible
          className="mb-4"
        >
          {error}
        </CAlert>
      )}

      <UserStatistics stats={stats} />

      <CCard className="border-0 shadow-sm">

        <UserTableHeader
          search={search}
          statusFilter={statusFilter}
          roleFilter={roleFilter}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onRoleFilterChange={setRoleFilter}
        />

        <UserTable
          users={filteredUsers}
          loading={loading}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />

        {!loading && filteredUsers.length > 0 && (
          <UserTableFooter
            filteredCount={filteredUsers.length}
            totalCount={users.length}
            show={true}
          />
        )}

      </CCard>

      <UserFormModal
        visible={showModal}
        loading={loading || loadingAccess}
        editingUser={editingUser}
        form={form}
        roles={roles}
        permissions={permissions}
        formError={formError}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={(updates) =>
          setForm((prev) => ({
            ...prev,
            ...updates,
          }))
        }
      />

      <UserDeleteModal
        visible={showDeleteModal}
        loading={loading}
        selectedUser={selectedUser}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default UserPage