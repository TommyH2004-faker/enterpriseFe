import React from 'react'
import {
  CButton,
  CCol,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'

interface Props {
  onAddClick: () => void
}

const UserPageHeader = ({
  onAddClick,
}: Props) => {
  return (
    <CRow className="align-items-center mb-4">
      <CCol>
        <h3 className="mb-1">
          Quản lý người dùng
        </h3>

        <div className="text-body-secondary">
          Quản lý tài khoản, trạng thái,
          vai trò và quyền truy cập
        </div>
      </CCol>

      <CCol xs="auto">
        <CButton
          color="primary"
          onClick={onAddClick}
        >
          <CIcon
            icon={cilPlus}
            className="me-2"
          />
          Thêm người dùng
        </CButton>
      </CCol>
    </CRow>
  )
}

export default UserPageHeader