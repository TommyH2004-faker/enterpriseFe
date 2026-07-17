import React, { useState } from 'react'
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
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormCheck,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilPlus,
  cilOptions,
} from '@coreui/icons'

const mockEmployees = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nva@company.com', department: 'Phát triển phần mềm', role: 'Tech Lead', access: 'Admin', status: 'Active', joinDate: '2023-05-10' },
  { id: 2, name: 'Trần Thị B', email: 'ttb@company.com', department: 'Marketing', role: 'Marketing Manager', access: 'Manager', status: 'Active', joinDate: '2023-06-15' },
  { id: 3, name: 'Lê Văn C', email: 'lvc@company.com', department: 'Phát triển phần mềm', role: 'Frontend Dev', access: 'Employee', status: 'Active', joinDate: '2023-08-20' },
  { id: 4, name: 'Phạm Thị D', email: 'ptd@company.com', department: 'Nhân sự', role: 'HR Specialist', access: 'Employee', status: 'Inactive', joinDate: '2024-01-05' },
  { id: 5, name: 'Hoàng Văn E', email: 'hve@company.com', department: 'Tài chính - Kế toán', role: 'Accountant', access: 'Employee', status: 'Active', joinDate: '2024-02-12' },
]

const Employees = () => {
  const [visible, setVisible] = useState(false)

  const getAccessBadgeColor = (access) => {
    switch(access) {
      case 'Admin': return 'danger'
      case 'Manager': return 'warning'
      case 'Employee': return 'info'
      default: return 'secondary'
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý Nhân viên</h2>
        <CButton color="primary" onClick={() => setVisible(true)}>
          <CIcon icon={cilPlus} className="me-2" />
          Mời nhân viên mới
        </CButton>
      </div>

      <CCard className="mb-4">
        <CCardHeader className="bg-white pb-0 border-bottom-0 pt-3 px-4">
          <CRow className="g-3">
            <CCol md={4} lg={3}>
              <CInputGroup>
                <CInputGroupText className="bg-white">
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput placeholder="Tìm tên, email..." />
              </CInputGroup>
            </CCol>
            <CCol md={2} lg={2}>
              <CFormSelect>
                <option>Phòng ban</option>
                <option>Phát triển phần mềm</option>
                <option>Marketing</option>
              </CFormSelect>
            </CCol>
            <CCol md={2} lg={2}>
              <CFormSelect>
                <option>Trạng thái</option>
                <option>Hoạt động</option>
                <option>Khóa</option>
              </CFormSelect>
            </CCol>
            <CCol md={2} lg={2}>
              <CFormSelect>
                <option>Vai trò</option>
                <option>Admin</option>
                <option>Manager</option>
                <option>Employee</option>
              </CFormSelect>
            </CCol>
            <CCol md={2} lg={3}>
              <CFormSelect>
                <option>Sắp xếp theo: Tên (A-Z)</option>
                <option>Phòng ban</option>
                <option>Ngày tham gia</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="px-0 pb-0 pt-3">
          <div className="table-responsive">
            <CTable hover className="mb-0 border-top">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell className="ps-4" style={{ width: '40px' }}>
                    <CFormCheck id="selectAll" />
                  </CTableHeaderCell>
                  <CTableHeaderCell>Nhân viên</CTableHeaderCell>
                  <CTableHeaderCell>Phòng ban</CTableHeaderCell>
                  <CTableHeaderCell>Chức vụ</CTableHeaderCell>
                  <CTableHeaderCell>Vai trò</CTableHeaderCell>
                  <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                  <CTableHeaderCell>Ngày tham gia</CTableHeaderCell>
                  <CTableHeaderCell className="pe-4"></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {mockEmployees.map((emp) => (
                  <CTableRow key={emp.id}>
                    <CTableDataCell className="ps-4">
                      <CFormCheck id={`emp-${emp.id}`} />
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '36px', height: '36px', fontSize: '14px', flexShrink: 0 }}>
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{emp.name}</div>
                          <div className="small text-muted">{emp.email}</div>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="light" className="text-dark border">{emp.department}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{emp.role}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getAccessBadgeColor(emp.access)} shape="rounded-pill">{emp.access}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={emp.status === 'Active' ? 'success' : 'secondary'} shape="rounded-pill">
                        {emp.status === 'Active' ? 'Hoạt động' : 'Khóa'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-muted small">{emp.joinDate}</CTableDataCell>
                    <CTableDataCell className="text-end pe-4">
                      <CButton color="light" size="sm"><CIcon icon={cilOptions} /></CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
        <div className="card-footer bg-white d-flex justify-content-between align-items-center px-4 py-3 border-top">
          <span className="text-muted small">Hiển thị 1 - 5 trong 124 nhân viên</span>
          <CPagination className="mb-0" size="sm">
            <CPaginationItem disabled>Trước</CPaginationItem>
            <CPaginationItem active>1</CPaginationItem>
            <CPaginationItem>2</CPaginationItem>
            <CPaginationItem>3</CPaginationItem>
            <CPaginationItem>Sau</CPaginationItem>
          </CPagination>
        </div>
      </CCard>

      {/* Modal Thêm Nhân viên */}
      <CModal visible={visible} onClose={() => setVisible(false)} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>Mời nhân viên mới</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel>Họ và Tên <span className="text-danger">*</span></CFormLabel>
                <CFormInput placeholder="VD: Nguyễn Văn A" />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Email <span className="text-danger">*</span></CFormLabel>
                <CFormInput type="email" placeholder="VD: email@company.com" />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel>Phòng ban <span className="text-danger">*</span></CFormLabel>
                <CFormSelect>
                  <option>Chọn phòng ban</option>
                  <option>Phát triển phần mềm</option>
                  <option>Marketing</option>
                </CFormSelect>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Chức vụ <span className="text-danger">*</span></CFormLabel>
                <CFormInput placeholder="VD: Frontend Developer" />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel>Vai trò truy cập <span className="text-danger">*</span></CFormLabel>
                <div>
                  <CFormCheck inline type="radio" name="access" id="accessAdmin" label="Admin" />
                  <CFormCheck inline type="radio" name="access" id="accessManager" label="Manager" />
                  <CFormCheck inline type="radio" name="access" id="accessEmployee" label="Employee" defaultChecked />
                </div>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Trạng thái</CFormLabel>
                <div>
                  <CFormCheck inline type="radio" name="status" id="statusActive" label="Hoạt động" defaultChecked />
                  <CFormCheck inline type="radio" name="status" id="statusInactive" label="Khóa" />
                </div>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Hủy</CButton>
          <CButton color="primary">Mời nhân viên</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Employees
