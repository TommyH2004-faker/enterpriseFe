import React from 'react'
import {
  CButton,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPencil,
  cilTrash,
} from '@coreui/icons'

import { Permission } from 'src/types/permission'

interface PermissionTableProps {
  permissions: Permission[]
  loading: boolean
   pageNumber: number
  pageSize: number
  onEdit: (permission: Permission) => void
  onDelete: (permission: Permission) => void
}

const PermissionTable: React.FC<PermissionTableProps> = ({
  permissions,
  loading,
    pageNumber,
    pageSize,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner />
      </div>
    )
  }

  return (
    <CTable hover responsive align="middle">
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>#</CTableHeaderCell>
          <CTableHeaderCell>Code</CTableHeaderCell>
          <CTableHeaderCell>Module</CTableHeaderCell>
          <CTableHeaderCell>Action</CTableHeaderCell>
          <CTableHeaderCell>Tên hiển thị</CTableHeaderCell>
          <CTableHeaderCell>Mô tả</CTableHeaderCell>
          <CTableHeaderCell className="text-end">
            Thao tác
          </CTableHeaderCell>
        </CTableRow>
      </CTableHead>

      <CTableBody>
        {permissions.length === 0 ? (
          <CTableRow>
            <CTableDataCell
              colSpan={7}
              className="text-center py-4 text-body-secondary"
            >
              Không có permission nào.
            </CTableDataCell>
          </CTableRow>
        ) : (
          permissions.map((permission, index) => (
            <CTableRow key={permission.id}>
              <CTableDataCell>{(pageNumber - 1) * pageSize + index + 1}</CTableDataCell>

              <CTableDataCell>
                <code>{permission.code}</code>
              </CTableDataCell>

              <CTableDataCell>
                <span className="badge bg-secondary">
                  {permission.module}
                </span>
              </CTableDataCell>

              <CTableDataCell>
                {permission.action}
              </CTableDataCell>

              <CTableDataCell>
                {permission.displayName}
              </CTableDataCell>

              <CTableDataCell>
                {permission.description || '-'}
              </CTableDataCell>

              <CTableDataCell className="text-end">
                <CButton
                  color="primary"
                  variant="ghost"
                  size="sm"
                  className="me-1"
                  onClick={() => onEdit(permission)}
                >
                  <CIcon icon={cilPencil} />
                </CButton>

                <CButton
                  color="danger"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(permission)}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))
        )}
      </CTableBody>
    </CTable>
  )
}

export default PermissionTable