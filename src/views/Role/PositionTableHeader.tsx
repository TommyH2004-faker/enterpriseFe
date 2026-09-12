import React from 'react'
import {
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { POSITION_MESSAGES } from './contants/positionConstants'


interface PositionTableHeaderProps {
  search: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
}

const PositionTableHeader: React.FC<PositionTableHeaderProps> = ({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}) => {
  return (
    <CCardHeader className="bg-white border-0 p-4">
      <CRow className="g-3">
        {/* Search */}
        <CCol md={7}>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>

            <CFormInput
              placeholder={POSITION_MESSAGES.SEARCH_PLACEHOLDER}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </CInputGroup>
        </CCol>

        {/* Status */}
        <CCol md={5}>
          <CFormSelect
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="">
              {POSITION_MESSAGES.STATUS_ALL}
            </option>

            <option value="active">
              {POSITION_MESSAGES.STATUS_ACTIVE}
            </option>

            <option value="inactive">
              {POSITION_MESSAGES.STATUS_INACTIVE}
            </option>
          </CFormSelect>
        </CCol>
      </CRow>
    </CCardHeader>
  )
}

export default PositionTableHeader