import React from 'react'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CProgress, CRow } from '@coreui/react'
import { CChart, CChartDoughnut, CChartPie } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilBell, cilBriefcase, cilBuilding, cilPeople, cilTask, cilWarning } from '@coreui/icons'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const stats = [
  { title: 'Phòng ban', value: 12, icon: cilBuilding, color: 'info', trend: '+10%', deltaUp: true },
  { title: 'Nhân viên', value: 156, icon: cilPeople, color: 'success', trend: '+5%', deltaUp: true },
  { title: 'Dự án', value: 28, icon: cilBriefcase, color: 'warning', trend: '+15%', deltaUp: true },
  { title: 'Công việc hôm nay', value: 45, icon: cilTask, color: 'primary', trend: '-3%', deltaUp: false },
  { title: 'Quá hạn', value: 8, icon: cilWarning, color: 'danger', trend: '-2%', deltaUp: false },
]

const Dashboard: React.FC = () => {
  return (
    <div className="pb-2">
      <div className="d-flex flex-column mb-4">
        <h1 className="h3 fw-bold mb-1 text-dark">Dashboard</h1>
        <div className="text-muted">Xin chào, Nguyễn Văn A</div>
      </div>

      <CRow className="g-3 mb-4">
        {stats.map((stat) => (
          <CCol sm={6} xl={4} xxl={true} key={stat.title}>
            <CCard className="h-100 shadow-sm border-0">
              <CCardBody className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className={`bg-${stat.color} bg-opacity-10 text-${stat.color} rounded d-inline-flex align-items-center justify-content-center`} style={{ width: '48px', height: '48px' }}>
                    <CIcon icon={stat.icon} size="xl" />
                  </div>
                  <CBadge color={stat.deltaUp ? 'success' : 'danger'} shape="rounded-pill" className="d-flex align-items-center gap-1">
                    <CIcon icon={stat.deltaUp ? cilArrowTop : cilArrowBottom} size="sm" />
                    {stat.trend}
                  </CBadge>
                </div>
                <div className="fw-bold text-light" style={{ fontSize: '28px' }}>{stat.value}</div>
                <div className="text-uppercase text-muted small fw-semibold" style={{ letterSpacing: '0.03em' }}>{stat.title}</div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CRow className="g-4 mb-4">
        <CCol lg={6}>
          <CCard className="h-100 shadow-sm border-0">
            <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0">
              <div className="fw-bold text-dark">Công việc theo trạng thái</div>
            </CCardHeader>
            <CCardBody className="p-4">
              <CChartDoughnut
                data={{
                  labels: ['Chưa bắt đầu', 'Đang làm', 'Đang review', 'Hoàn thành'],
                  datasets: [{ backgroundColor: ['#E8EAED', '#321FDB', '#FFC107', '#2ED8B6'], data: [30, 45, 15, 10], borderWidth: 0 }],
                }}
                options={{ plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } } }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={6}>
          <CCard className="h-100 shadow-sm border-0">
            <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0">
              <div className="fw-bold text-light">Ưu tiên công việc</div>
            </CCardHeader>
            <CCardBody className="p-4">
              <CChartPie
                data={{
                  labels: ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'],
                  datasets: [{ backgroundColor: ['#54A3FF', '#FFC107', '#E55353', '#8A1515'], data: [20, 50, 25, 5], borderWidth: 0 }],
                }}
                options={{ plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } } }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-4 mb-4">
        <CCol xs={12}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0">
              <div className="fw-bold text-dark">Tiến độ dự án - 4 tuần gần đây</div>
            </CCardHeader>
            <CCardBody className="p-4">
              <CChart
                type="bar"
                data={{
                  labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
                  datasets: [
                    { type: 'bar', label: 'Kế hoạch', backgroundColor: 'rgba(84,163,255,0.35)', borderColor: '#54A3FF', borderWidth: 1, data: [50, 75, 85, 100], borderRadius: 4 },
                    { type: 'line', label: 'Hoàn thành', borderColor: '#321FDB', backgroundColor: '#321FDB', data: [45, 60, 80, 95], tension: 0.3 },
                  ],
                }}
                options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }}
                style={{ height: '300px' }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-4">
        <CCol lg={6}>
          <CCard className="h-100 shadow-sm border-0">
            <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <div className="fw-bold text-dark">Hoạt động gần đây</div>
              <a href="#" className="text-decoration-none small fw-semibold">Xem tất cả</a>
            </CCardHeader>
            <CCardBody className="p-4">
              <div className="position-relative ps-3" style={{ borderLeft: '2px solid #E8EAED' }}>
                {[
                  { name: 'Nguyễn Văn A', action: 'tạo công việc "Design UI"', time: new Date(Date.now() - 1000 * 60 * 120), color: 'primary' },
                  { name: 'Trần Thị B', action: 'chuyển trạng thái "API Login" sang Đang làm', time: new Date(Date.now() - 1000 * 60 * 60 * 5), color: 'success' },
                  { name: 'Lê Văn C', action: 'bình luận vào "Fix bug #123"', time: new Date(Date.now() - 1000 * 60 * 60 * 24), color: 'warning' },
                ].map((activity, index) => (
                  <div key={index} className="mb-4 position-relative">
                    <div className={`position-absolute bg-${activity.color} rounded-circle border border-2 border-white`} style={{ width: '12px', height: '12px', left: '-22px', top: '4px' }} />
                    <div className="d-flex align-items-start">
                      <div className={`bg-${activity.color} bg-opacity-10 text-${activity.color} rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold`} style={{ width: '32px', height: '32px' }}>
                        {activity.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-light"><span className="fw-bold">{activity.name}</span> {activity.action}</div>
                        <div className="text-muted small mt-1">{formatDistanceToNow(activity.time, { addSuffix: true, locale: vi })}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={6}>
          <CCard className="h-100 shadow-sm border-0">
            <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                Thông báo mới <CBadge color="danger" shape="rounded-pill">3</CBadge>
              </div>
              <a href="#" className="text-decoration-none small fw-semibold">Xem tất cả thông báo</a>
            </CCardHeader>
            <CCardBody className="p-4">
              <div className="d-grid gap-3">
                {[
                  { title: 'Công việc API Backend sắp hết hạn', desc: 'Vui lòng cập nhật tiến độ trước ngày 15/11.', color: 'danger', time: '10p trước', icon: cilWarning },
                  { title: 'Deploy to Production đã hoàn thành', desc: 'Hệ thống đã được cập nhật thành công.', color: 'success', time: '1 giờ trước', icon: cilTask },
                  { title: 'Ai đó mention bạn trong bình luận', desc: 'Trần Thị B nhắc đến bạn trong dự án Mobile App V2.', color: 'info', time: '2 giờ trước', icon: cilBell },
                ].map((notification) => (
                  <div key={notification.title} className="d-flex justify-content-between align-items-start gap-3 border-bottom pb-3">
                    <div className="d-flex align-items-start gap-3">
                      <div className={`bg-${notification.color} bg-opacity-10 text-${notification.color} rounded p-2`}>
                        <CIcon icon={notification.icon} size="lg" />
                      </div>
                      <div>
                        <div className="fw-semibold text-dark">{notification.title}</div>
                        <div className="text-muted small">{notification.desc}</div>
                      </div>
                    </div>
                    <div className="text-muted small text-nowrap">{notification.time}</div>
                  </div>
                ))}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-4 mt-0">
        <CCol xs={12}>
          <CCard className="shadow-sm border-0 mt-4">
            <CCardBody className="p-4">
              <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
                <div>
                  <div className="fw-bold text-dark mb-1">Tóm tắt nhanh</div>
                  <div className="text-muted small">Phòng ban, nhân sự, dự án và khối lượng công việc đang theo dõi</div>
                </div>
                <div className="d-flex gap-3 flex-wrap">
                  <div style={{ minWidth: '180px' }}>
                    <div className="d-flex justify-content-between small mb-1"><span>Công việc tuần này</span><strong>78%</strong></div>
                    <CProgress value={78} color="primary" height={6} />
                  </div>
                  <div style={{ minWidth: '180px' }}>
                    <div className="d-flex justify-content-between small mb-1"><span>Hoàn thành đúng hạn</span><strong>92%</strong></div>
                    <CProgress value={92} color="success" height={6} />
                  </div>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Dashboard
