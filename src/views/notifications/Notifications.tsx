import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilWarning,
  cilCheckCircle,
  cilCommentSquare,
  cilTask,
} from '@coreui/icons'

const mockNotifications = [
  { id: 1, type: 'warning', icon: cilWarning, title: 'Task quá hạn', content: 'Công việc "Viết API Đăng nhập" đã quá hạn 2 ngày.', time: '10 phút trước', read: false },
  { id: 2, type: 'info', icon: cilCommentSquare, title: 'Bình luận mới', content: 'Nguyễn Văn A đã bình luận vào task "Thiết kế Database Schema".', time: '1 giờ trước', read: false },
  { id: 3, type: 'success', icon: cilCheckCircle, title: 'Dự án hoàn thành', content: 'Dự án "CRM Internal System" đã được đánh dấu hoàn thành.', time: 'Hôm qua', read: true },
  { id: 4, type: 'primary', icon: cilTask, title: 'Task mới được giao', content: 'Trần Thị B đã giao cho bạn task "Thiết kế UI Mockup".', time: '2 ngày trước', read: true },
]

const Notifications = () => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1 text-dark">Thông báo</h1>
          <div className="text-muted">Bell dropdown, unread count, full notification center</div>
        </div>
        <CButton color="light">
          <CIcon icon={cilCheckCircle} className="me-2" />
          Đánh dấu tất cả đã đọc
        </CButton>
      </div>

      <CRow className="g-3 mb-4">
        {[
          { label: 'Chưa đọc', value: '3', color: 'danger' },
          { label: 'Task', value: '8', color: 'primary' },
          { label: 'Comment', value: '5', color: 'info' },
          { label: 'System', value: '2', color: 'warning' },
        ].map((item) => (
          <CCol xs={12} sm={6} xl={3} key={item.label}>
            <CCard className="shadow-sm border-0">
              <CCardBody className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase text-muted small fw-semibold">{item.label}</div>
                  <div className="fw-bold text-dark" style={{ fontSize: '28px' }}>{item.value}</div>
                </div>
                <CBadge color={item.color as any} shape="rounded-pill">Live</CBadge>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CRow>
        <CCol lg={12}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <strong>Hộp thông báo</strong>
              <span className="text-muted small">10-15 items recent</span>
            </CCardHeader>
            <CCardBody className="p-0">
              <div className="list-group list-group-flush">
                {mockNotifications.map((noti) => (
                  <div key={noti.id} className={`list-group-item list-group-item-action p-4 border-bottom cursor-pointer hover-bg-light ${!noti.read ? 'bg-light bg-opacity-50' : ''}`}>
                    <div className="d-flex w-100 justify-content-between align-items-start">
                      <div className="d-flex align-items-start">
                        <div className={`bg-${noti.type} bg-opacity-10 text-${noti.type} rounded-circle d-flex align-items-center justify-content-center me-3 mt-1`} style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                          <CIcon icon={noti.icon} size="xl" />
                        </div>
                        <div>
                          <h6 className="mb-1 fw-bold d-flex align-items-center">
                            {noti.title}
                            {!noti.read && <CBadge color="danger" shape="rounded-pill" className="ms-2" style={{ fontSize: '10px' }}>Mới</CBadge>}
                          </h6>
                          <p className="mb-1 text-muted">{noti.content}</p>
                          <small className="text-muted">{noti.time}</small>
                        </div>
                      </div>
                      {!noti.read && (
                        <div className="bg-primary rounded-circle" style={{ width: '10px', height: '10px' }}></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-4">
        <CCol lg={6}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0"><strong>Notification settings</strong></CCardHeader>
            <CCardBody className="p-4">
              <div className="d-grid gap-2">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2"><span>Email task assigned</span><CBadge color="success">On</CBadge></div>
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2"><span>Browser notifications</span><CBadge color="success">On</CBadge></div>
                <div className="d-flex justify-content-between align-items-center"><span>Do not disturb</span><CBadge color="secondary">22:00-07:00</CBadge></div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={6}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0"><strong>Timeline by date</strong></CCardHeader>
            <CCardBody className="p-4">
              <div className="text-muted small mb-2">Hôm nay / Hôm qua / Tuần trước / Tháng trước</div>
              <div className="d-flex flex-wrap gap-2">
                <CBadge color="primary" shape="rounded-pill">Today</CBadge>
                <CBadge color="info" shape="rounded-pill">Unread</CBadge>
                <CBadge color="warning" shape="rounded-pill">Archive</CBadge>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Notifications
