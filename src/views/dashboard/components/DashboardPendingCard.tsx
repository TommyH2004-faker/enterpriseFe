import React from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import CIcon from '@coreui/icons-react'

interface Props {
  title: string
  icon: string | string[]
}

/** Khung giữ chỗ cho khu vực chưa có API backend. Không hiển thị dữ liệu mẫu. */
const DashboardPendingCard: React.FC<Props> = ({ title, icon }) => (
  <CCard className="h-100 shadow-sm border-0">
    <CCardHeader className="border-bottom-0 pt-4 px-4 pb-0 bg-transparent">
      <div className="fw-bold">{title}</div>
    </CCardHeader>
    <CCardBody className="p-4">
      <div
        className="d-flex flex-column align-items-center justify-content-center text-center text-muted gap-2"
        style={{ minHeight: 200 }}
      >
        <CIcon icon={icon} size="xl" />
        <div className="fw-semibold">Chưa có dữ liệu</div>
        <div className="small">Mục này sẽ hiển thị khi backend cung cấp API tương ứng.</div>
      </div>
    </CCardBody>
  </CCard>
)

export default DashboardPendingCard