import React from 'react'
import {
  CBadge,
  CButton,
  CCardBody,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import {
  cilChevronBottom,
  cilChevronTop,
  cilCheck,
  cilInfo,
  cilPencil,
  cilPlus,
  cilTrash,
} from '@coreui/icons'
import type { Role } from 'src/types/role'
import CIcon from '@coreui/icons-react'
import { ROLE_MESSAGES, ROLE_TABLE_CONFIG } from '../contants/RoleConstants'


interface RoleTableProps {
  roles: Role[]
  loading: boolean
  pageNumber: number
  pageSize: number
  sortBy: string
  sortDescending: boolean
  onSort: (field: string) => void
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onPermissions: (role: Role) => void
  onAddClick: () => void
}

/**
 * Component hiển thị bảng danh sách Role
 */
const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  loading,
  pageNumber,
  pageSize,
  sortBy,
  sortDescending,
  onSort,
  onEdit,
  onDelete,
  onPermissions,
  onAddClick,
}) => {
  // =========================================================
  // RENDER HEADER WITH SORT ICON
  // =========================================================

  const renderSortableHeader = (field: string, label: string) => (
    <CTableHeaderCell
      role="button"
      onClick={() => onSort(field)}
    >
      <div className="d-flex align-items-center gap-1">
        {label}

        {sortBy === field && (
          <CIcon
            icon={sortDescending ? cilChevronBottom : cilChevronTop}
            size="sm"
          />
        )}
      </div>
    </CTableHeaderCell>
  )

  // =========================================================
  // RENDER
  // =========================================================

  if (loading) {
    return (
      <CCardBody
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <CSpinner color="primary" />
      </CCardBody>
    )
  }

  if (roles.length === 0) {
    return (
      <CCardBody className="text-center py-5">
        <CIcon
          icon={cilInfo}
          size="3xl"
          className="text-body-secondary mb-3"
        />

        <h5>{ROLE_MESSAGES.EMPTY_NO_ROLES}</h5>

        <p className="text-body-secondary mb-3">
          {ROLE_MESSAGES.EMPTY_NO_RESULTS}
        </p>

        <CButton color="primary" onClick={onAddClick}>
          <CIcon icon={cilPlus} className="me-2" />
          {ROLE_MESSAGES.BTN_ADD_ROLE}
        </CButton>
      </CCardBody>
    )
  }

  return (
    <CCardBody className="p-0">
      <CTable
        hover
        responsive
        align="middle"
        className="mb-0"
      >
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell style={{ width: ROLE_TABLE_CONFIG.ID_WIDTH }}>
              {ROLE_MESSAGES.TABLE_HEADER_ID}
            </CTableHeaderCell>

            {renderSortableHeader(
              'Code',
              ROLE_MESSAGES.TABLE_HEADER_CODE
            )}

            {renderSortableHeader(
              'DisplayName',
              ROLE_MESSAGES.TABLE_HEADER_NAME
            )}

            <CTableHeaderCell>
              {ROLE_MESSAGES.TABLE_HEADER_DESC}
            </CTableHeaderCell>

            <CTableHeaderCell
              className="text-center"
              style={{ width: ROLE_TABLE_CONFIG.ACTIONS_WIDTH }}
            >
              {ROLE_MESSAGES.TABLE_HEADER_ACTIONS}
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {roles.map((role, index) => (
            <CTableRow key={role.id}>
              <CTableDataCell>
                {(pageNumber - 1) * pageSize + index + 1}
              </CTableDataCell>

              <CTableDataCell>
                <CBadge
                  color="secondary"
                  className="px-2 py-1"
                >
                  {role.code}
                </CBadge>
              </CTableDataCell>

              <CTableDataCell>
                <span className="fw-semibold">
                  {role.displayName}
                </span>
              </CTableDataCell>

              <CTableDataCell>
                <span className="text-body-secondary">
                  {role.description}
                </span>
              </CTableDataCell>

              <CTableDataCell>
                <div className="d-flex justify-content-center gap-2">
                  {/* EDIT */}
                  <CButton
                    color="warning"
                    variant="outline"
                    size="sm"
                    title={ROLE_MESSAGES.TOOLTIP_EDIT}
                    onClick={() => onEdit(role)}
                  >
                    <CIcon icon={cilPencil} />
                  </CButton>

                  {/* PERMISSIONS */}
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    title={ROLE_MESSAGES.TOOLTIP_PERMISSIONS}
                    onClick={() => onPermissions(role)}
                  >
                    <CIcon icon={cilCheck} />
                  </CButton>

                  {/* DELETE */}
                  <CButton
                    color="danger"
                    variant="outline"
                    size="sm"
                    title={ROLE_MESSAGES.TOOLTIP_DELETE}
                    onClick={() => onDelete(role)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </div>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </CCardBody>
  )
}

export default RoleTable