import { FC } from 'react'
import { CSpinner } from '@coreui/react'

const DashboardLoading: FC = () => (
  <div
    className="d-flex flex-column align-items-center justify-content-center gap-2"
    style={{ minHeight: 320 }}
  >
    <CSpinner color="primary" />
    <span className="text-body-secondary">Đang tải dữ liệu Dashboard...</span>
  </div>
)

export default DashboardLoading