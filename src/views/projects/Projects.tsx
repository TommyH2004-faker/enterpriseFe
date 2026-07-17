import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormSelect,
  CBadge,
  CProgress,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormTextarea,
  CFormCheck,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilPlus,
  cilOptions,
  cilPeople,
  cilList,
  cilCalendar,
} from '@coreui/icons'

const mockProjects = [
  { id: 1, name: 'Website e-Commerce', status: 'Đang làm', description: 'Phát triển hệ thống bán hàng trực tuyến mới với Next.js và .NET API.', progress: 65, members: 8, tasks: 42, dueDate: '30/12/2024', manager: 'Nguyễn Văn A' },
  { id: 2, name: 'Mobile App V2', status: 'Đang làm', description: 'Nâng cấp ứng dụng di động với Flutter, thêm tính năng thanh toán.', progress: 30, members: 5, tasks: 24, dueDate: '15/11/2024', manager: 'Trần Thị B' },
  { id: 3, name: 'CRM Internal System', status: 'Lưu trữ', description: 'Hệ thống quản lý khách hàng nội bộ.', progress: 100, members: 12, tasks: 89, dueDate: '01/01/2024', manager: 'Lê Văn C' },
  { id: 4, name: 'Marketing Campaign Q4', status: 'Đóng', description: 'Chiến dịch quảng cáo cuối năm trên các nền tảng social media.', progress: 10, members: 4, tasks: 15, dueDate: '31/12/2024', manager: 'Trần Thị B' },
]

const Projects = () => {
  const [visible, setVisible] = useState(false)

  const getStatusColor = (status) => {
    switch(status) {
      case 'Đang làm': return 'success'
      case 'Đóng': return 'secondary'
      case 'Lưu trữ': return 'warning'
      default: return 'primary'
    }
  }

  const getProgressColor = (progress) => {
    if (progress < 30) return 'danger'
    if (progress < 70) return 'info'
    return 'success'
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1 text-dark">Quản lý Dự án</h1>
          <div className="text-muted">List, grid, timeline, progress, manager và due date</div>
        </div>
        <CButton color="primary" onClick={() => setVisible(true)}>
          <CIcon icon={cilPlus} className="me-2" />
          Tạo dự án mới
        </CButton>
      </div>

      <CRow className="g-3 mb-4">
        {[
          { label: 'Tổng dự án', value: '28', color: 'primary' },
          { label: 'Đang làm', value: '14', color: 'success' },
          { label: 'Tạm dừng', value: '3', color: 'warning' },
          { label: 'Đóng', value: '11', color: 'secondary' },
        ].map((item) => (
          <CCol xs={12} sm={6} xl={3} key={item.label}>
            <CCard className="shadow-sm border-0 h-100">
              <CCardBody className="p-4">
                <div className={`bg-${item.color} bg-opacity-10 text-${item.color} rounded d-inline-flex align-items-center justify-content-center mb-3`} style={{ width: '46px', height: '46px' }}>
                  <CIcon icon={cilBriefcase} />
                </div>
                <div className="fw-bold text-dark" style={{ fontSize: '28px' }}>{item.value}</div>
                <div className="text-uppercase text-muted small fw-semibold">{item.label}</div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CCard className="mb-4 shadow-sm border-0">
        <CCardBody className="pb-0">
          <CNav variant="tabs" className="border-bottom-0">
            {['List', 'Grid', 'Timeline'].map((item, index) => (
              <CNavItem key={item}>
                <CNavLink active={index === 1}>{item}</CNavLink>
              </CNavItem>
            ))}
          </CNav>
        </CCardBody>
      </CCard>

      <CCard className="mb-4">
        <CCardHeader className="bg-white pb-0 border-bottom-0 pt-3 px-4">
          <CRow className="g-3">
            <CCol md={4} lg={4}>
              <CInputGroup>
                <CInputGroupText className="bg-white">
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput placeholder="Tìm kiếm dự án..." />
              </CInputGroup>
            </CCol>
            <CCol md={3} lg={3}>
              <CFormSelect>
                <option>Trạng thái</option>
                <option>Đang làm</option>
                <option>Đóng</option>
                <option>Lưu trữ</option>
              </CFormSelect>
            </CCol>
            <CCol md={2} lg={2}>
              <CFormSelect>
                <option>Quản lý</option>
                <option>Nguyễn Văn A</option>
                <option>Trần Thị B</option>
              </CFormSelect>
            </CCol>
            <CCol md={3} lg={3}>
              <CFormSelect>
                <option>Sắp xếp theo: Mới nhất</option>
                <option>Tiến độ (Giảm dần)</option>
                <option>Ngày đến hạn</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="px-4 pb-4 pt-4 bg-light bg-opacity-50">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <CBadge color="success" shape="rounded-pill">Đang làm</CBadge>
            <CBadge color="warning" shape="rounded-pill">Tạm dừng</CBadge>
            <CBadge color="secondary" shape="rounded-pill">Đóng</CBadge>
            <CBadge color="info" shape="rounded-pill">Timeline</CBadge>
          </div>
          <CRow className="g-4">
            {mockProjects.map((project) => (
              <CCol sm={6} xl={4} key={project.id}>
                <CCard className="h-100 shadow-sm border-0">
                  <CCardBody className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="mb-0 fw-bold text-dark text-truncate pe-2" title={project.name}>{project.name}</h5>
                      <CBadge color={getStatusColor(project.status)} shape="rounded-pill" className="flex-shrink-0">
                        {project.status}
                      </CBadge>
                    </div>
                    
                    <p className="text-muted small mb-4 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </p>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold text-dark">Tiến độ</span>
                        <span className="fw-bold">{project.progress}%</span>
                      </div>
                      <CProgress value={project.progress} color={getProgressColor(project.progress)} height={6} />
                    </div>

                    <div className="d-flex flex-wrap gap-3 mb-4 text-muted small">
                      <div className="d-flex align-items-center" title="Số thành viên">
                        <CIcon icon={cilPeople} size="sm" className="me-1" />
                        <span>{project.members}</span>
                      </div>
                      <div className="d-flex align-items-center" title="Số công việc">
                        <CIcon icon={cilList} size="sm" className="me-1" />
                        <span>{project.tasks}</span>
                      </div>
                      <div className="d-flex align-items-center" title="Ngày đến hạn">
                        <CIcon icon={cilCalendar} size="sm" className="me-1" />
                        <span className={project.status === 'Đang làm' && project.progress < 100 ? '' : ''}>{project.dueDate}</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center mb-0 pt-3 border-top mt-auto">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                        {project.manager.charAt(0)}
                      </div>
                      <span className="small text-muted flex-grow-1">
                        Quản lý: <strong className="text-dark">{project.manager}</strong>
                      </span>
                    </div>
                    <div className="mt-3">
                      <CProgress value={project.progress} color={getProgressColor(project.progress)} height={6} />
                    </div>
                  </CCardBody>
                  <div className="card-footer bg-transparent border-top-0 d-flex justify-content-between align-items-center pb-3 px-3">
                    <Link to={`/kanban?project=${project.id}`} className="text-decoration-none">
                      <CButton color="primary" variant="outline" size="sm" className="w-100">Xem chi tiết Board</CButton>
                    </Link>
                    <CButton color="light" size="sm" className="ms-2"><CIcon icon={cilOptions} /></CButton>
                  </div>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </CCardBody>
      </CCard>

      {/* Modal Thêm Dự án */}
      <CModal visible={visible} onClose={() => setVisible(false)} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>Tạo dự án mới</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel>Tên dự án <span className="text-danger">*</span></CFormLabel>
              <CFormInput placeholder="Nhập tên dự án" />
            </div>
            <div className="mb-3">
              <CFormLabel>Mô tả</CFormLabel>
              <CFormTextarea rows={3} placeholder="Mô tả mục tiêu và nội dung dự án..." />
            </div>
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel>Quản lý dự án <span className="text-danger">*</span></CFormLabel>
                <CFormSelect>
                  <option>Chọn quản lý</option>
                  <option>Nguyễn Văn A</option>
                  <option>Trần Thị B</option>
                </CFormSelect>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Trạng thái</CFormLabel>
                <div>
                  <CFormCheck inline type="radio" name="status" id="statusActive" label="Đang làm" defaultChecked />
                  <CFormCheck inline type="radio" name="status" id="statusClosed" label="Đóng" />
                  <CFormCheck inline type="radio" name="status" id="statusArchive" label="Lưu trữ" />
                </div>
              </CCol>
            </CRow>
            <div className="mb-3">
              <CFormLabel>Ưu tiên</CFormLabel>
              <div className="d-flex gap-3 flex-wrap">
                <CFormCheck inline type="radio" name="priority" id="priorityNormal" label="Thường" defaultChecked />
                <CFormCheck inline type="radio" name="priority" id="priorityHigh" label="Cao" />
                <CFormCheck inline type="radio" name="priority" id="priorityUrgent" label="Khẩn cấp" />
              </div>
            </div>
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel>Ngày bắt đầu</CFormLabel>
                <CFormInput type="date" />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Ngày kết thúc</CFormLabel>
                <CFormInput type="date" />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Hủy</CButton>
          <CButton color="primary">Tạo dự án</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Projects
