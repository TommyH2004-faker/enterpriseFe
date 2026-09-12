import React from 'react'
import { CButton, CCol, CContainer, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

const Page403: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center text-center">
          <CCol md={7} lg={6}>
            <h1 className="display-3 fw-bold text-danger mb-3">403</h1>
            <h4 className="mb-3">Bạn không có quyền truy cập</h4>
            <p className="text-body-secondary mb-4">
              Tài khoản của bạn chưa được cấp quyền thực hiện thao tác hoặc truy cập trang này.
            </p>
            <CButton color="primary" onClick={() => navigate('/dashboard')}>
              Về trang tổng quan
            </CButton>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Page403
