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
  CBadge,
  CCardBody,
} from '@coreui/react'
import {
  cilBriefcase,
  cilPencil,
  cilPeople,
  cilTrash,
} from '@coreui/icons'
import { Position } from 'src/types/position'
import { FORM_ACTIONS, POSITION_MESSAGES } from './contants/positionConstants'
import CIcon from '@coreui/icons-react'


interface PositionTableProps {
  positions: Position[]
  loading: boolean
  onEdit: (position: Position) => void
  onDelete: (position: Position) => void
}

const PositionTable: React.FC<PositionTableProps> = ({
  positions,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <CCardBody className="p-0">
        <div className="text-center py-5">
          <CSpinner color="primary" />
          <div className="text-muted mt-2">
            {POSITION_MESSAGES.LOADING}
          </div>
        </div>
      </CCardBody>
    )
  }

  if (positions.length === 0) {
    return (
      <CCardBody className="p-0">
        <div className="text-center py-5">
          <CIcon
            icon={cilBriefcase}
            size="3xl"
            className="text-muted mb-3"
          />
          <h5 className="fw-semibold">
            {POSITION_MESSAGES.EMPTY_STATE}
          </h5>
          <div className="text-muted">
            {POSITION_MESSAGES.EMPTY_DESC}
          </div>
        </div>
      </CCardBody>
    )
  }

  return (
    <CCardBody className="p-0">
      <CTable
        hover
        responsive
        className="mb-0 align-middle"
      >
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Mã</CTableHeaderCell>
            <CTableHeaderCell>Tên chức vụ</CTableHeaderCell>
            <CTableHeaderCell>Mô tả</CTableHeaderCell>
            <CTableHeaderCell>Nhân viên</CTableHeaderCell>
            <CTableHeaderCell>Trạng thái</CTableHeaderCell>
            <CTableHeaderCell className="text-end">
              Thao tác
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {positions.map((position) => (
            <CTableRow key={position.id}>
              {/* Code */}
              <CTableDataCell>
                <span className="role-code">
                  {position.code}
                </span>
              </CTableDataCell>

              {/* Name */}
              <CTableDataCell>
                <div className="fw-semibold">
                  {position.name}
                </div>
              </CTableDataCell>

              {/* Description */}
              <CTableDataCell>
                <span className="text-muted">
                  {position.description ||
                    POSITION_MESSAGES.NO_DESCRIPTION}
                </span>
              </CTableDataCell>

              {/* Employee count */}
              <CTableDataCell>
                <div className="d-flex align-items-center gap-2">
                  <CIcon
                    icon={cilPeople}
                    className="text-muted"
                  />
                  <span>
                    {position.employeeCount || 0}
                  </span>
                </div>
              </CTableDataCell>

              {/* Status */}
              <CTableDataCell>
                <CBadge
                  color={
                    position.isActive
                      ? 'success'
                      : 'secondary'
                  }
                  shape="rounded-pill"
                >
                  {position.isActive
                    ? POSITION_MESSAGES.STATUS_ACTIVE
                    : POSITION_MESSAGES.STATUS_INACTIVE}
                </CBadge>
              </CTableDataCell>

              {/* Actions */}
              <CTableDataCell className="text-end">
                <div className="d-flex justify-content-end gap-2">
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    title={FORM_ACTIONS.EDIT}
                    onClick={() => onEdit(position)}
                  >
                    <CIcon icon={cilPencil} />
                  </CButton>

                  <CButton
                    color="danger"
                    variant="outline"
                    size="sm"
                    title={FORM_ACTIONS.DELETE}
                    onClick={() => onDelete(position)}
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

export default PositionTable