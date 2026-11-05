import React, { useState } from 'react'
import { CCard, CCardHeader } from '@coreui/react'

// =========================================================
// TYPES
// =========================================================

import type { Role } from 'src/types/role'

// =========================================================
// HOOKS
// =========================================================

import { useRoleData } from './hooks/useRoleData'
import { useRoleForm } from './hooks/useRoleForm'
import { useRoleDelete } from './hooks/useRoleDelete'

// =========================================================
// COMPONENTS
// =========================================================

import RolePageHeader from './components/RolePageHeader'
import RoleStatistics from './components/RoleStatistics'
import RoleTable from './components/RoleTable'
import RolePagination from './components/RolePagination'
import RoleFormModal from './components/RoleFormModal'
import RoleDeleteModal from './components/RoleDeleteModal'
import RoleSearchBar from './components/RoleSearchBar'
import RolePermissionModal from './components/RolePermissionModal'
import ToastAlert from 'src/components/ToastAlert'

/**
 * Main RolePage Component
 *
 * Chức năng:
 * - Hiển thị danh sách Role
 * - Tìm kiếm Role
 * - Phân trang
 * - Sắp xếp
 * - Tạo Role
 * - Chỉnh sửa Role
 * - Xóa Role
 * - Mở modal phân quyền cho từng Role
 */
const RolePage: React.FC = () => {
  // =========================================================
  // STATE
  // =========================================================

  /**
   * Role đang được mở để phân quyền.
   *
   * null = chưa mở modal phân quyền
   */
  const [permissionRole, setPermissionRole] =
    useState<Role | null>(null)

  // =========================================================
  // ROLE DATA HOOK
  // =========================================================

  const {
    roles,
    loading,
    error,
    pagination,
    pageNumber,
    pageSize,
    search,
    sortBy,
    sortDescending,
    totalRoles,

    setPageNumber,
    handleSearchChange,
    handleSort,
    loadRoles,
  } = useRoleData()

  // =========================================================
  // ROLE FORM HOOK
  // =========================================================

  const {
    showModal: showFormModal,
    editingRole,
    form,
    loading: formLoading,
    error: formError,

    openCreateModal,
    openEditModal,
    closeModal,
    setForm,
    handleSubmit,
  } = useRoleForm(loadRoles)

  // =========================================================
  // ROLE DELETE HOOK
  // =========================================================

  const {
    showModal: showDeleteModal,
    selectedRole,
    loading: deleteLoading,

    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
    handleDelete,
  } = useRoleDelete(
    loadRoles,
    () => {
      /**
       * Nếu xóa item cuối cùng ở page hiện tại
       * thì quay về page trước.
       */
      if (roles.length === 1 && pageNumber > 1) {
        setPageNumber(pageNumber - 1)
      }
    },
  )

  // =========================================================
  // PERMISSION
  // =========================================================

  /**
   * Mở modal phân quyền cho Role.
   *
   * Không navigate sang /permissions.
   */
  const handlePermissions = (role: Role) => {
    setPermissionRole(role)
  }

  /**
   * Đóng modal phân quyền.
   */
  const closePermissionModal = () => {
    setPermissionRole(null)
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="role-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <RolePageHeader
        onAddClick={openCreateModal}
      />

      {/* =====================================================
          ERROR ALERT
      ====================================================== */}

      <ToastAlert message={error} />

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <RoleStatistics
        totalRoles={totalRoles}
      />

      {/* =====================================================
          TABLE CARD
      ====================================================== */}

      <CCard className="border-0 shadow-sm">

        {/* ===================================================
            TABLE HEADER
        ==================================================== */}

        <CCardHeader className="bg-transparent py-3">

          <RoleSearchBar
            search={search}
            totalRoles={totalRoles}
            onSearchChange={handleSearchChange}
          />

        </CCardHeader>

        {/* ===================================================
            ROLE TABLE
        ==================================================== */}

        <RoleTable
          roles={roles}
          loading={loading}
          pageNumber={pageNumber}
          pageSize={pageSize}
          sortBy={sortBy}
          sortDescending={sortDescending}

          onSort={handleSort}

          onEdit={openEditModal}

          onDelete={openDeleteModal}

          /**
           * Quan trọng:
           *
           * Không navigate('/permissions') nữa.
           *
           * Click nút phân quyền sẽ mở
           * RolePermissionModal.
           */
          onPermissions={handlePermissions}

          onAddClick={openCreateModal}
        />

        {/* ===================================================
            PAGINATION
        ==================================================== */}

        {!loading &&
          roles.length > 0 &&
          pagination && (
            <RolePagination
              pagination={pagination}
              pageNumber={pageNumber}
              pageSize={pageSize}
              totalRoles={totalRoles}
              onPageChange={setPageNumber}
            />
          )}
      </CCard>

      {/* =====================================================
          ROLE FORM MODAL
      ====================================================== */}

      <RoleFormModal
        visible={showFormModal}
        loading={formLoading}
        editingRole={editingRole}
        form={form}
        error={formError}

        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={setForm}
      />

      {/* =====================================================
          ROLE DELETE MODAL
      ====================================================== */}

      <RoleDeleteModal
        visible={showDeleteModal}
        loading={deleteLoading}
        selectedRole={selectedRole}

        onClose={closeDeleteModal}

        onConfirm={async () => {
          await handleDelete()
        }}
      />

      {/* =====================================================
          ROLE PERMISSION MODAL
      ====================================================== */}

      <RolePermissionModal
        visible={permissionRole !== null}
        role={permissionRole}
        onClose={closePermissionModal}

        /**
         * Có thể dùng callback này sau khi backend
         * lưu permission thành công.
         *
         * Hiện tại Role list không cần reload vì
         * permission thay đổi không làm thay đổi
         * dữ liệu Role.
         */
        onSaved={() => {
          // Không cần loadRoles()
        }}
      />

    </div>
  )
}

export default RolePage