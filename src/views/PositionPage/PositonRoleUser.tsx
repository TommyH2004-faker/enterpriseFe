import React, { useState } from 'react'
import {
  CAlert,
  CCard,
} from '@coreui/react'


import { usePositionFilters } from './hooks/usePositionFilters'
import { usePositionForm } from './hooks/usePositionForm'
import { usePositionStatistics } from './hooks/usePositionStatistics'
import { usePosition } from './hooks/usePosition'
import PositionPageHeader from './components/PositionPageHeader'
import PositionStatistics from './components/PositionStatistics'
import PositionTableHeader from './components/PositionTableHeader'
import PositionTable from './components/PositionTable'
import PositionTableFooter from './components/PositionTableFooter'
import PositionFormModal from './components/PositionFormModal'
import PositionDeleteModal from './components/PositionDeleteModal'
import toast from 'react-hot-toast'

// Components


const PositionRoleUser = () => {
  // =========================
  // HOOKS - Data & Business Logic
  // =========================

  const {
    positions,
    loading,
    error,
    createPosition,
    updatePosition,
    deletePosition,
  } = usePosition()

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredPositions,
  } = usePositionFilters(positions)

  const stats = usePositionStatistics(positions)

  const {
    showModal,
    editingPosition,
    form,
    setForm,
    formError,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
  } = usePositionForm(
    () => {}, // onSubmitSuccess callback
    createPosition as any,
    updatePosition as any
  )

  // =========================
  // Delete Modal State
  // =========================

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<any>(null)

  const openDeleteModal = (position: any) => {
    setSelectedPosition(position)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setSelectedPosition(null)
    setShowDeleteModal(false)
  }

  const handleDelete = async () => {
    if (!selectedPosition) {
      return
    }

    try {
      await deletePosition(selectedPosition.id)
      closeDeleteModal()
    } catch {
      toast.error('Không thể xóa chức vụ. Do có nhân viên đang gắn với chức vụ này.')
    }
  }

  // =========================
  // RENDER
  // =========================

  return (
    <div className="role-user-page">
      {/* Page Header */}
      <PositionPageHeader onAddClick={openCreateModal} />

      {/* Error Alert */}
      {error && (
        <CAlert
          color="danger"
          dismissible
          className="mb-4"
        >
          {error}
        </CAlert>
      )}

      {/* Statistics Cards */}
      <PositionStatistics stats={stats} />

      {/* Data Table Card */}
      <CCard className="border-0 shadow-sm">
        
        {/* Table Header - Search & Filter */}
        <PositionTableHeader
          search={search}
          statusFilter={statusFilter}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Table Body */}
        <PositionTable
          positions={filteredPositions}
          loading={loading}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />

        {/* Table Footer */}
        {!loading && filteredPositions.length > 0 && (
          <PositionTableFooter
            filteredCount={filteredPositions.length}
            totalCount={positions.length}
            show={true}
          />
        )}

      </CCard>

      {/* Create / Update Modal */}
      <PositionFormModal
        visible={showModal}
        loading={loading}
        editingPosition={editingPosition}
        form={form}
        formError={formError}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={(updates) =>
          setForm({ ...form, ...updates })
        }
      />

      {/* Delete Confirmation Modal */}
      <PositionDeleteModal
        visible={showDeleteModal}
        loading={loading}
        selectedPosition={selectedPosition}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default PositionRoleUser