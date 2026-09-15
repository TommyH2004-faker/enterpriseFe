import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CRow,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilSearch,
} from '@coreui/icons'

import PermissionTable from './components/PermissionTable'
import PermissionFormModal from './components/PermissionFormModal'

import { Permission } from 'src/types/permission'
import { usePermission } from './hooks/usePermission'
import { usePermissionForm } from './hooks/usePermissionForm'

const PermissionPage: React.FC = () => {
  const {
    permissions,
    loading,
    error,

    pageNumber,
    totalCount,
    totalPages,

    search,
    setSearch,
    setPageNumber,

    createPermission,
    updatePermission,
    deletePermission,
  } = usePermission()

  const {
    showModal,
    editingPermission,
    form,
    formError,
    setForm,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
  } = usePermissionForm(
    createPermission,
    updatePermission,
  )

  const [deleteTarget, setDeleteTarget] =
    useState<Permission | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      await deletePermission(
        deleteTarget.id,
      )

      setDeleteTarget(null)
    } catch (error: any) {
      alert(
        error?.response?.data?.message ??
          'Không thể xóa permission.',
      )
    }
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>
                    Quản lý permission
                  </strong>

                  <div className="small text-body-secondary">
                    Quản lý các quyền truy cập
                    trong hệ thống
                  </div>
                </div>

                <CButton
                  color="primary"
                  onClick={openCreateModal}
                >
                  <CIcon
                    icon={cilPlus}
                    className="me-2"
                  />
                  Thêm permission
                </CButton>
              </div>
            </CCardHeader>

            <CCardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div
                  className="position-relative"
                  style={{
                    width: '350px',
                  }}
                >
                  <CIcon
                    icon={cilSearch}
                    className="position-absolute"
                    style={{
                      left: '12px',
                      top: '10px',
                    }}
                  />

                  <CFormInput
                    value={search}
                    onChange={(e) => {
                      setSearch(
                        e.target.value,
                      )
                      setPageNumber(1)
                    }}
                    placeholder="Tìm kiếm permission..."
                    style={{
                      paddingLeft: '38px',
                    }}
                  />
                </div>

                <span className="text-body-secondary">
                  Tổng: {totalCount} permission
                </span>
              </div>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <PermissionTable
                permissions={permissions}
                loading={loading}
                pageNumber={pageNumber}
                pageSize={10}
                onEdit={openEditModal}
                onDelete={setDeleteTarget}
              />

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <CPagination>
                    <CPaginationItem
                      disabled={pageNumber === 1}
                     onClick={() => setPageNumber(pageNumber - 1)}
                    >
                      Trước
                    </CPaginationItem>

                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) =>
                        index + 1,
                    ).map((page) => (
                      <CPaginationItem
                        key={page}
                        active={
                          page === pageNumber
                        }
                        onClick={() =>
                          setPageNumber(page)
                        }
                      >
                        {page}
                      </CPaginationItem>
                    ))}

                    <CPaginationItem
                      disabled={
                        pageNumber ===
                        totalPages
                      }
                      onClick={() => setPageNumber(pageNumber + 1)}
                    >
                      Sau
                    </CPaginationItem>
                  </CPagination>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <PermissionFormModal
        visible={showModal}
        loading={loading}
        editingPermission={
          editingPermission
        }
        form={form}
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

      {deleteTarget && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor:
              'rgba(0,0,0,0.5)',
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Xóa permission
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                />
              </div>

              <div className="modal-body">
                Bạn có chắc muốn xóa permission:

                <div className="fw-semibold mt-2">
                  {deleteTarget.code}
                </div>
              </div>

              <div className="modal-footer">
                <CButton
                  color="secondary"
                  variant="outline"
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                >
                  Hủy
                </CButton>

                <CButton
                  color="danger"
                  onClick={handleDelete}
                >
                  Xóa
                </CButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PermissionPage