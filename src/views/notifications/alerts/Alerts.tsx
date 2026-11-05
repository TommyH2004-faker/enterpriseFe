import React from 'react'
import { CButton, CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import toast from 'react-hot-toast'

const Alerts = () => {
  const notifications = [
    ['primary', 'Thông báo thông tin'],
    ['success', 'Thao tác thành công'],
    ['danger', 'Đã xảy ra lỗi'],
    ['warning', 'Cảnh báo'],
    ['info', 'Thông tin hệ thống'],
  ] as const

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Toast notifications</strong>
          </CCardHeader>
          <CCardBody className="d-flex flex-wrap gap-2">
            {notifications.map(([type, message]) => (
              <CButton
                key={type}
                color={type}
                onClick={() => {
                  if (type === 'success') toast.success(message)
                  else if (type === 'danger') toast.error(message)
                  else toast(message)
                }}
              >
                {message}
              </CButton>
            ))}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Alerts
