import React from 'react'
import {
  CCol,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow
} from '@coreui/react'
import { cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { ROLE_MESSAGES } from '../contants/RoleConstants'


interface RoleSearchBarProps {
  search: string
  totalRoles: number
  onSearchChange: (value: string) => void
}

/**
 * Component hiển thị search input và tổng số role
 */
const RoleSearchBar: React.FC<RoleSearchBarProps> = ({
  search,
  totalRoles,
  onSearchChange,
}) => {
  return (
    <CRow className="align-items-center">
      <CCol md={6} className="mb-3 mb-md-0">
        <CInputGroup>
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>

          <CFormInput
            placeholder={ROLE_MESSAGES.PLACEHOLDER_SEARCH}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </CInputGroup>
      </CCol>

      <CCol md={6} className="text-md-end">
        <span className="text-body-secondary">
          {ROLE_MESSAGES.STAT_TOTAL_COUNT.replace(
            '{count}',
            totalRoles.toString()
          )}
        </span>
      </CCol>
    </CRow>
  )
}

export default RoleSearchBar