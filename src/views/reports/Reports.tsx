import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormSelect,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CProgress,
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import {
  cilPrint,
  cilCloudDownload,
  cilFile,
} from '@coreui/icons'

const Reports = () => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1 text-dark">Báo cáo</h1>
          <div className="text-muted">Tiến độ dự án, hiệu suất nhân viên, theo phòng ban và xuất báo cáo</div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <CButton color="secondary" variant="outline">
            <CIcon icon={cilPrint} className="me-2" />
            In
          </CButton>
          <CButton color="primary" variant="outline">
            <CIcon icon={cilCloudDownload} className="me-2" />
            Export Excel
          </CButton>
          <CButton color="danger" variant="outline">
            <CIcon icon={cilFile} className="me-2" />
            Export PDF
          </CButton>
        </div>
      </div>

      <CCard className="mb-4 shadow-sm border-0">
        <CCardBody className="pb-0">
          <CNav variant="tabs" className="border-bottom-0">
            {['Tiến độ dự án', 'Hiệu suất nhân viên', 'Công việc theo thời gian', 'Theo phòng ban', 'Tùy chỉnh'].map((item, index) => (
              <CNavItem key={item}>
                <CNavLink active={index === 0}>{item}</CNavLink>
              </CNavItem>
            ))}
          </CNav>
        </CCardBody>
      </CCard>

      {/* Filters */}
      <CCard className="mb-4">
        <CCardBody>
          <CRow className="g-3">
            <CCol md={3}>
              <CFormInput type="date" label="Từ ngày" />
            </CCol>
            <CCol md={3}>
              <CFormInput type="date" label="Đến ngày" />
            </CCol>
            <CCol md={2}>
              <label className="form-label">Phòng ban</label>
              <CFormSelect>
                <option>Tất cả</option>
                <option>Phát triển phần mềm</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <label className="form-label">Dự án</label>
              <CFormSelect>
                <option>Tất cả</option>
                <option>Website e-Commerce</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <label className="form-label">Nhân viên</label>
              <CFormSelect>
                <option>Tất cả</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      <CRow className="g-3 mb-4">
        {[
          { label: 'Báo cáo có thể xuất', value: '3', color: 'primary' },
          { label: 'On track', value: '18', color: 'success' },
          { label: 'At risk', value: '4', color: 'warning' },
          { label: 'Behind', value: '2', color: 'danger' },
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

      {/* Công việc theo thời gian */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <strong>Công việc theo thời gian</strong>
            </CCardHeader>
            <CCardBody>
              <CChartLine
                style={{ height: '300px' }}
                data={{
                  labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7'],
                  datasets: [
                    {
                      label: 'Công việc tạo mới',
                      backgroundColor: 'transparent',
                      borderColor: '#321FDB',
                      pointBackgroundColor: '#321FDB',
                      data: [40, 20, 12, 39, 10, 40, 39, 80, 40],
                    },
                    {
                      label: 'Công việc hoàn thành',
                      backgroundColor: 'transparent',
                      borderColor: '#2ED8B6',
                      pointBackgroundColor: '#2ED8B6',
                      data: [35, 18, 10, 30, 8, 35, 30, 75, 35],
                    },
                  ],
                }}
                options={{ maintainAspectRatio: false }}
              />
              <div className="d-flex flex-wrap gap-3 mt-3 text-muted small">
                <span>Updated: 5 phút trước</span>
                <span>Source: Tasks + Projects</span>
                <span>Range: 7 months</span>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        {/* Tiến độ dự án */}
        <CCol xl={6} className="mb-4">
          <CCard className="h-100">
            <CCardHeader>
              <strong>Tiến độ Dự án</strong>
            </CCardHeader>
            <CCardBody className="p-0">
              <CTable hover responsive className="mb-0">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Dự án</CTableHeaderCell>
                    <CTableHeaderCell>Hoàn thành / Tổng</CTableHeaderCell>
                    <CTableHeaderCell>Tiến độ</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {[
                    { name: 'Website e-Commerce', total: 42, completed: 27, progress: 65, status: 'success' },
                    { name: 'Mobile App V2', total: 24, completed: 8, progress: 30, status: 'danger' },
                    { name: 'CRM Internal System', total: 89, completed: 89, progress: 100, status: 'success' },
                    { name: 'Marketing Campaign', total: 15, completed: 2, progress: 10, status: 'info' },
                  ].map((item, idx) => (
                    <CTableRow key={idx}>
                      <CTableDataCell>
                        <div className="fw-bold">{item.name}</div>
                      </CTableDataCell>
                      <CTableDataCell>{item.completed} / {item.total}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <span className="me-2 fw-bold">{item.progress}%</span>
                          <CProgress value={item.progress} color={item.status} className="flex-grow-1" height={6} />
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Hiệu suất nhân viên */}
        <CCol xl={6} className="mb-4">
          <CCard className="h-100">
            <CCardHeader>
              <strong>Hiệu suất Nhân viên</strong>
            </CCardHeader>
            <CCardBody className="p-0">
              <CTable hover responsive className="mb-0">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Nhân viên</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Tỷ lệ hoàn thành</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Quá hạn</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Đánh giá</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {[
                    { name: 'Nguyễn Văn A', rate: 95, overdue: 0, status: 'Xuất sắc' },
                    { name: 'Trần Thị B', rate: 82, overdue: 2, status: 'Tốt' },
                    { name: 'Lê Văn C', rate: 100, overdue: 0, status: 'Xuất sắc' },
                    { name: 'Phạm Thị D', rate: 45, overdue: 5, status: 'Cần chú ý' },
                  ].map((item, idx) => (
                    <CTableRow key={idx}>
                      <CTableDataCell>
                        <div className="fw-bold">{item.name}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CBadge color={item.rate >= 80 ? 'success' : (item.rate >= 50 ? 'warning' : 'danger')}>
                          {item.rate}%
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {item.overdue > 0 ? (
                          <span className="text-danger fw-bold">{item.overdue}</span>
                        ) : (
                          <span className="text-success">0</span>
                        )}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CBadge color="light" className="text-dark border">{item.status}</CBadge>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-4 mt-0">
        <CCol lg={4}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0"><strong>Phòng ban</strong></CCardHeader>
            <CCardBody className="p-4">
              <div className="d-grid gap-3">
                <div className="d-flex justify-content-between align-items-center"><div>Kỹ thuật</div><CBadge color="success">86%</CBadge></div>
                <div className="d-flex justify-content-between align-items-center"><div>Marketing</div><CBadge color="warning">72%</CBadge></div>
                <div className="d-flex justify-content-between align-items-center"><div>Nhân sự</div><CBadge color="info">64%</CBadge></div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={8}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardHeader className="bg-white border-bottom-0 pt-4 px-4 pb-0"><strong>Báo cáo tùy chỉnh</strong></CCardHeader>
            <CCardBody className="p-4">
              <div className="text-muted small mb-3">Chọn chỉ số, nhóm dữ liệu và kiểu hiển thị để build report theo nhu cầu.</div>
              <div className="d-flex flex-wrap gap-2">
                <CBadge color="primary" shape="rounded-pill">By Project</CBadge>
                <CBadge color="secondary" shape="rounded-pill">By Department</CBadge>
                <CBadge color="info" shape="rounded-pill">By Employee</CBadge>
                <CBadge color="warning" shape="rounded-pill">Table / Chart / Both</CBadge>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Reports
