import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CFormCheck,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { cilLockLocked, cilUser, cilBell, cilMonitor, cilHistory, cilShieldAlt, cilSun, cilMoon } from '@coreui/icons'
import toast from 'react-hot-toast'

interface LoginEntry {
  id: number
  time: string
  ip: string
  browser: string
  device: string
  location: string
  status: 'Thành công' | 'Thất bại'
}

const mockLoginHistory: LoginEntry[] = [
  { id: 1, time: '17/07/2024 10:45', ip: '192.168.1.10', browser: 'Chrome 126', device: 'Windows 11', location: 'Hà Nội, VN', status: 'Thành công' },
  { id: 2, time: '16/07/2024 08:30', ip: '192.168.1.10', browser: 'Chrome 126', device: 'Windows 11', location: 'Hà Nội, VN', status: 'Thành công' },
  { id: 3, time: '15/07/2024 23:10', ip: '14.161.23.12', browser: 'Safari 17', device: 'iPhone 15', location: 'TP.HCM, VN', status: 'Thất bại' },
  { id: 4, time: '14/07/2024 16:20', ip: '192.168.1.10', browser: 'Firefox 128', device: 'MacOS', location: 'Hà Nội, VN', status: 'Thành công' },
]

const Settings: React.FC = () => {
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const handleSavePassword = () => {
    toast.success('Mật khẩu đã được cập nhật thành công!')
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Cài đặt Hệ thống</h1>
        <p className="text-muted small mb-0">Quản lý tài khoản, thông báo, giao diện và bảo mật</p>
      </div>

      <CCard className="shadow-sm border-0 mb-4">
        <CCardBody className="pb-0">
          <CNav variant="tabs" className="border-bottom-0">
            {['Hồ sơ', 'Mật khẩu', 'Thông báo', 'Giao diện', 'Bảo mật'].map((item, index) => (
              <CNavItem key={item}><CNavLink active={index === 0}>{item}</CNavLink></CNavItem>
            ))}
          </CNav>
        </CCardBody>
      </CCard>

      <CRow className="g-4">
        {/* Profile Settings */}
        <CCol lg={12}>
          <CCard className="border-0 shadow-sm rounded-3">
            <CCardHeader className="bg-white border-bottom-0 px-4 pt-4 pb-0">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <div className="bg-primary bg-opacity-10 text-primary rounded p-1"><CIcon icon={cilUser} /></div>
                Tài khoản cá nhân
              </h5>
            </CCardHeader>
            <CCardBody className="p-4">
              <CForm>
                <CRow className="g-3 align-items-center mb-4">
                  <CCol xs="auto">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '80px', height: '80px', fontSize: '28px' }}>
                      A
                    </div>
                  </CCol>
                  <CCol>
                    <div className="d-flex flex-column gap-2">
                      <CButton color="primary" variant="outline" size="sm" style={{ width: 'fit-content' }}>Tải ảnh lên</CButton>
                      <div className="text-muted" style={{ fontSize: '12px' }}>JPG, GIF hoặc PNG. Dung lượng tối đa 1MB.</div>
                    </div>
                  </CCol>
                </CRow>

                <CRow className="g-3 mb-4">
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold text-dark" style={{ fontSize: '13px' }}>Họ và tên</CFormLabel>
                    <CFormInput defaultValue="Nguyễn Văn A" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold text-dark" style={{ fontSize: '13px' }}>Email</CFormLabel>
                    <CFormInput type="email" defaultValue="nva@company.com" readOnly className="bg-light" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold text-dark" style={{ fontSize: '13px' }}>Phòng ban</CFormLabel>
                    <CFormInput defaultValue="Kỹ thuật" readOnly className="bg-light" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold text-dark" style={{ fontSize: '13px' }}>Chức vụ</CFormLabel>
                    <CFormInput defaultValue="Lập trình viên Senior" />
                  </CCol>
                </CRow>
                <CButton color="primary" className="fw-semibold px-4">Lưu thay đổi</CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Change Password */}
        <CCol lg={6}>
          <CCard className="h-100 border-0 shadow-sm rounded-3">
            <CCardHeader className="bg-white border-bottom-0 px-4 pt-4 pb-0">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <div className="bg-danger bg-opacity-10 text-danger rounded p-1"><CIcon icon={cilLockLocked} /></div>
                Đổi mật khẩu
              </h5>
            </CCardHeader>
            <CCardBody className="p-4">
              <CForm>
                <div className="mb-3">
                  <CFormLabel className="fw-semibold text-dark" style={{ fontSize: '13px' }}>
                    Mật khẩu hiện tại <span className="text-danger">*</span>
                  </CFormLabel>
                  <div className="position-relative">
                    <CFormInput type={showCurrentPw ? 'text' : 'password'} placeholder="Nhập mật khẩu hiện tại" style={{ paddingRight: '40px' }} />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="position-absolute border-0 bg-transparent text-muted" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                      <FontAwesomeIcon
                        icon={showCurrentPw ? faEye : faEyeSlash}
                        style={{ width: '18px', height: '18px' }}
                      />
                    </button>
                  </div>
                  <div className="text-muted mt-1" style={{ fontSize: '11px' }}>Nhập mật khẩu hiện tại để xác nhận danh tính</div>
                </div>
                <div className="mb-3">
                  <CFormLabel className="fw-semibold text-dark" style={{ fontSize: '13px' }}>
                    Mật khẩu mới <span className="text-danger">*</span>
                  </CFormLabel>
                  <div className="position-relative">
                    <CFormInput type={showNewPw ? 'text' : 'password'} placeholder="Tối thiểu 8 ký tự" style={{ paddingRight: '40px' }} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="position-absolute border-0 bg-transparent text-muted" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                      <FontAwesomeIcon
                        icon={showNewPw ? faEye : faEyeSlash}
                        style={{ width: '18px', height: '18px' }}
                      />
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <CFormLabel className="fw-semibold text-dark" style={{ fontSize: '13px' }}>
                    Xác nhận mật khẩu mới <span className="text-danger">*</span>
                  </CFormLabel>
                  <div className="position-relative">
                    <CFormInput type={showConfirmPw ? 'text' : 'password'} placeholder="Nhập lại mật khẩu mới" style={{ paddingRight: '40px' }} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="position-absolute border-0 bg-transparent text-muted" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                      <FontAwesomeIcon
                        icon={showConfirmPw ? faEye : faEyeSlash}
                        style={{ width: '18px', height: '18px' }}
                      />
                    </button>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <CButton color="primary" className="fw-semibold px-4" onClick={handleSavePassword}>Cập nhật</CButton>
                  <CButton color="light" className="px-4">Hủy</CButton>
                </div>
                <div className="mt-4 pt-3 border-top">
                  <div className="fw-semibold text-dark mb-2" style={{ fontSize: '13px' }}>Lịch sử đăng nhập gần đây</div>
                  <div className="text-muted small">17/07/2026 10:45 • Chrome • Windows 11 • Hà Nội</div>
                  <div className="text-muted small">16/07/2026 08:30 • Safari • iPhone • TP.HCM</div>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Notification & Interface Settings */}
        <CCol lg={6}>
          <CCard className="border-0 shadow-sm rounded-3 mb-4">
            <CCardHeader className="bg-white border-bottom-0 px-4 pt-4 pb-0">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <div className="bg-warning bg-opacity-10 text-warning rounded p-1"><CIcon icon={cilBell} /></div>
                Thông báo
              </h5>
            </CCardHeader>
            <CCardBody className="p-4">
              <CForm>
                {[
                  { id: 'emailNoti', label: 'Nhận thông báo qua Email', desc: 'Gửi email khi có công việc mới.', defaultChecked: true },
                  { id: 'pushNoti', label: 'Thông báo trình duyệt (Push)', desc: 'Hiển thị thông báo ngay cả khi thu nhỏ.', defaultChecked: true },
                  { id: 'soundNoti', label: 'Âm thanh thông báo', desc: 'Phát âm thanh khi có tin nhắn mới.', defaultChecked: false },
                ].map(item => (
                  <div key={item.id} className="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom">
                    <div className="flex-grow-1 me-3">
                      <div className="fw-medium text-dark" style={{ fontSize: '14px' }}>{item.label}</div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>{item.desc}</div>
                    </div>
                    <CFormCheck type="checkbox" className="form-switch" id={item.id} defaultChecked={item.defaultChecked} />
                  </div>
                ))}
                <CButton color="primary" variant="outline" size="sm" className="fw-medium mt-1">Lưu tùy chọn</CButton>
              </CForm>
            </CCardBody>
          </CCard>

          <CCard className="border-0 shadow-sm rounded-3">
            <CCardHeader className="bg-white border-bottom-0 px-4 pt-4 pb-0">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <div className="bg-info bg-opacity-10 text-info rounded p-1"><CIcon icon={cilMonitor} /></div>
                Giao diện & Ngôn ngữ
              </h5>
            </CCardHeader>
            <CCardBody className="p-4">
              <CForm>
                <div className="mb-4">
                  <CFormLabel className="fw-semibold text-dark mb-2 d-block" style={{ fontSize: '13px' }}>Chế độ hiển thị (Theme)</CFormLabel>
                  <div className="d-flex gap-3 flex-wrap">
                    {[
                      { id: 'light', icon: cilSun, desc: 'Light Mode' },
                      { id: 'dark', icon: cilMoon, desc: 'Dark Mode' },
                      { id: 'auto', icon: cilMonitor, desc: 'Auto' },
                    ].map(t => (
                      <label key={t.id} className="border rounded-2 p-3 cursor-pointer text-center" style={{ minWidth: '80px', transition: 'all 0.15s ease' }}>
                        <CFormCheck type="radio" name="theme" id={t.id} className="d-none" />
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}><CIcon icon={t.icon} /></div>
                        <div style={{ fontSize: '11px', fontWeight: 500 }}>{t.desc}</div>
                      </label>
                    ))}
                  </div>
                </div>
                <CButton color="primary" variant="outline" size="sm" className="fw-medium">Lưu tùy chọn</CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Login History */}
        <CCol xs={12}>
          <CCard className="border-0 shadow-sm rounded-3">
            <CCardHeader className="bg-white px-4 pt-4 pb-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <div className="bg-secondary bg-opacity-10 text-secondary rounded p-1"><CIcon icon={cilHistory} /></div>
                Lịch sử đăng nhập
              </h5>
              <div className="d-flex gap-2">
                <CFormInput type="date" size="sm" style={{ width: '140px' }} />
                <span className="text-muted align-self-center">→</span>
                <CFormInput type="date" size="sm" style={{ width: '140px' }} />
              </div>
            </CCardHeader>
            <CCardBody className="p-0">
              <div className="table-responsive">
                <CTable hover className="mb-0 align-middle border-top">
                  <CTableHead className="bg-light">
                    <CTableRow>
                      <CTableHeaderCell className="ps-4">Thời gian</CTableHeaderCell>
                      <CTableHeaderCell>Địa chỉ IP</CTableHeaderCell>
                      <CTableHeaderCell>Trình duyệt</CTableHeaderCell>
                      <CTableHeaderCell>Thiết bị</CTableHeaderCell>
                      <CTableHeaderCell>Vị trí</CTableHeaderCell>
                      <CTableHeaderCell className="pe-4 text-end">Trạng thái</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {mockLoginHistory.map(entry => (
                      <CTableRow key={entry.id} style={{ height: '52px' }}>
                        <CTableDataCell className="ps-4 small fw-medium text-dark">{entry.time}</CTableDataCell>
                        <CTableDataCell className="small text-muted font-monospace">{entry.ip}</CTableDataCell>
                        <CTableDataCell className="small">{entry.browser}</CTableDataCell>
                        <CTableDataCell className="small">{entry.device}</CTableDataCell>
                        <CTableDataCell className="small text-muted">{entry.location}</CTableDataCell>
                        <CTableDataCell className="pe-4 text-end">
                          <span className={`badge rounded-pill bg-${entry.status === 'Thành công' ? 'success' : 'danger'} bg-opacity-10 text-${entry.status === 'Thành công' ? 'success' : 'danger'} fw-semibold px-3 py-1`} style={{ fontSize: '11px' }}>
                            {entry.status === 'Thành công' ? '✓' : '✗'} {entry.status}
                          </span>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Settings
