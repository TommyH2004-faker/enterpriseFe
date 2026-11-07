import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <span className="fw-semibold">Enterprise Task Management</span>
        <span className="ms-1">&copy; {new Date().getFullYear()}</span>
      </div>
      <div className="ms-auto">
        <span>Hệ thống quản lý công việc doanh nghiệp</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)