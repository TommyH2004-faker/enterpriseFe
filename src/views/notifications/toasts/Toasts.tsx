import React, { useState } from 'react'
import {
  CButton,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster,
} from '@coreui/react'

const exampleToast = (
  <CToast autohide={true} delay={3000}>
    <CToastHeader closeButton>
      <strong className="me-auto">Thông báo</strong>
    </CToastHeader>
    <CToastBody>
      Đây là thông báo mẫu.
    </CToastBody>
  </CToast>
)

const Toasts = () => {
  const [toast, setToast] = useState<React.ReactElement | undefined>(
    undefined,
  )

  return (
    <div className="p-3">
      <CButton
        color="primary"
        onClick={() => setToast(exampleToast)}
      >
        Hiển thị thông báo
      </CButton>

      <CToaster
        push={toast}
        placement="top-end"
      />
    </div>
  )
}

export default Toasts