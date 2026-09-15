import React from 'react'
import { CButton, CCol, CRow } from '@coreui/react'
import { cilPlus } from '@coreui/icons'
import { ROLE_MESSAGES } from '../contants/RoleConstants'
import CIcon from '@coreui/icons-react'


interface RolePageHeaderProps {
  onAddClick: () => void
}

/**
 * Component hiển thị header của trang Role
 * - Title
 * - Description
 * - Add button
 */
const RolePageHeader: React.FC<RolePageHeaderProps> = ({ onAddClick }) => {
  return (
    <CRow className="mb-4">
      <CCol>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="mb-1 fw-semibold">
              {ROLE_MESSAGES.PAGE_TITLE}
            </h3>

            <p className="text-body-secondary mb-0">
              {ROLE_MESSAGES.PAGE_DESC}
            </p>
          </div>

          <CButton
            color="primary"
            onClick={onAddClick}
          >
            <CIcon
              icon={cilPlus}
              className="me-2"
            />
            {ROLE_MESSAGES.BTN_ADD_ROLE}
          </CButton>
        </div>
      </CCol>
    </CRow>
  )
}

export default RolePageHeader