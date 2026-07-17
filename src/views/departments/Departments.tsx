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
  CFormTextarea,
  CFormCheck,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilList,
  cilGrid,
  cilPlus,
  cilBuilding,
  cilOptions,
  cilTrash,
  cilLockLocked,
  cilPeople,
  cilPencil,
  cilSortAscending,
} from '@coreui/icons'
import { Department } from '../../types'

const mockDepartments: Department[] = [
  { id: 1, name: 'Kỹ thuật', manager: 'Nguyễn Văn A', employees: 15, projects: 8, status: 'Active', createdAt: '15/01/2024' },
  { id: 2, name: 'Thiết kế', manager: 'Trần Thị B', employees: 8, projects: 12, status: 'Active', createdAt: '20/02/2024' },
  { id: 3, name: 'Nhân sự (HR)', manager: 'Lê Văn C', employees: 6, projects: 2, status: 'Active', createdAt: '10/01/2024' },
  { id: 4, name: 'Tài chính - Kế toán', manager: 'Phạm Thị D', employees: 10, projects: 1, status: 'Inactive', createdAt: '05/03/2024' },
  { id: 5, name: 'Marketing', manager: 'Hoàng Văn E', employees: 7, projects: 5, status: 'Active', createdAt: '12/03/2024' },
  { id: 6, name: 'Kinh doanh', manager: 'Vũ Thị F', employees: 12, projects: 4, status: 'Active', createdAt: '18/04/2024' },
]

const deptIconColors = ['#321FDB', '#2ED8B6', '#FFC107', '#E55353', '#54A3FF', '#8A1515']

const Departments: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [visible, setVisible] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [perPage, setPerPage] = useState(10)
  const [editDept, setEditDept] = useState<Department | null>(null)

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(new Set(mockDepartments.map(d => d.id)))
    else setSelectedIds(new Set())
  }

  const handleSelect = (id: number | string) => {
    const s = new Set(selectedIds)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelectedIds(s)
  }

  const openEdit = (dept: Department) => {
    setEditDept(dept)
    setVisible(true)
  }

  const openCreate = () => {
    setEditDept(null)
    setVisible(true)
  }

  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0 fw-bold text-dark">Quản lý Phòng ban</h2>
          <p className="text-muted mb-0 small">Tổng: {mockDepartments.length} phòng ban</p>
        </div>
        <CButton color="primary" onClick={openCreate} className="d-flex align-items-center gap-2">
          <CIcon icon={cilPlus} />
          Thêm phòng ban
        </CButton>
      </div>

      <CCard className="border-0 shadow-sm rounded-3 mb-4">
        <CCardHeader className="bg-white border-bottom pt-3 pb-0 px-4">
          {/* Filter Bar */}
          <CRow className="g-3 align-items-center mb-3">
            <CCol xs={12} md={4}>
              <CInputGroup>
                <CInputGroupText className="bg-white border-end-0">
                  <CIcon icon={cilSearch} className="text-muted" />
                </CInputGroupText>
                <CFormInput placeholder="Tìm kiếm phòng ban..." className="border-start-0 ps-0" />
              </CInputGroup>
            </CCol>
            <CCol xs={8} sm={5} md={4}>
              <CInputGroup>
                <CInputGroupText className="bg-white border-end-0 text-muted">
                  <CIcon icon={cilSortAscending} />
                </CInputGroupText>
                <CFormSelect className="border-start-0">
                  <option>Tên (A-Z)</option>
                  <option>Tên (Z-A)</option>
                  <option>Số nhân viên (Cao-Thấp)</option>
                  <option>Số dự án (Cao-Thấp)</option>
                  <option>Ngày tạo (Mới-Cũ)</option>
                  <option>Ngày tạo (Cũ-Mới)</option>
                </CFormSelect>
              </CInputGroup>
            </CCol>
            <CCol xs={4} sm={3} md="auto" className="ms-md-auto">
              <div className="btn-group border rounded p-1 bg-light">
                <button className={`btn btn-sm border-0 px-3 ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-muted'}`} onClick={() => setViewMode('list')}>
                  <CIcon icon={cilList} />
                </button>
                <button className={`btn btn-sm border-0 px-3 ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-muted'}`} onClick={() => setViewMode('grid')}>
                  <CIcon icon={cilGrid} />
                </button>
              </div>
            </CCol>
          </CRow>

          {/* Batch Actions */}
          {selectedIds.size > 0 && (
            <div className="d-flex justify-content-between align-items-center px-3 py-2 bg-primary bg-opacity-10 rounded-2 mb-3 border border-primary border-opacity-25">
              <span className="text-primary fw-semibold small">{selectedIds.size} phòng ban đã chọn</span>
              <div className="d-flex gap-2">
                <CButton color="light" size="sm" variant="outline" onClick={() => setSelectedIds(new Set())} className="border">Hủy chọn</CButton>
                <CButton color="warning" size="sm" className="text-white"><CIcon icon={cilLockLocked} className="me-1" />Khóa đã chọn</CButton>
                <CButton color="danger" size="sm" className="text-white"><CIcon icon={cilTrash} className="me-1" />Xóa đã chọn</CButton>
              </div>
            </div>
          )}
        </CCardHeader>

        <CCardBody className="p-0">
          {viewMode === 'list' ? (
            <>
              <div className="table-responsive">
                <CTable hover className="mb-0 align-middle border-top" style={{ '--cui-table-striped-bg': 'rgba(248,249,250,0.8)' } as React.CSSProperties}>
                  <CTableHead>
                    <CTableRow className="bg-light">
                      <CTableHeaderCell className="ps-4" style={{ width: '48px' }}>
                        <CFormCheck onChange={handleSelectAll} checked={selectedIds.size === mockDepartments.length && mockDepartments.length > 0} />
                      </CTableHeaderCell>
                      <CTableHeaderCell>Tên phòng ban</CTableHeaderCell>
                      <CTableHeaderCell>Trưởng phòng</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Nhân viên</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Dự án</CTableHeaderCell>
                      <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                      <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
                      <CTableHeaderCell className="pe-4 text-end">Hành động</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {mockDepartments.map((dept, idx) => (
                      <CTableRow key={dept.id} style={{ height: '60px' }} className={selectedIds.has(dept.id) ? 'table-active' : ''}>
                        <CTableDataCell className="ps-4">
                          <CFormCheck checked={selectedIds.has(dept.id)} onChange={() => handleSelect(dept.id)} />
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center gap-2">
                            <div className="d-flex align-items-center justify-content-center rounded" style={{ width: '32px', height: '32px', background: `${deptIconColors[idx % deptIconColors.length]}20`, color: deptIconColors[idx % deptIconColors.length] }}>
                              <CIcon icon={cilBuilding} />
                            </div>
                            <span className="fw-semibold text-dark">{dept.name}</span>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                              {dept.manager.charAt(0)}
                            </div>
                            <span>{dept.manager}</span>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <span className="fw-semibold">{dept.employees}</span>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <span className="fw-semibold">{dept.projects}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={dept.status === 'Active' ? 'success' : 'secondary'} shape="rounded-pill" style={{ fontSize: '11px' }}>
                            {dept.status === 'Active' ? '● Hoạt động' : '● Khóa'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-muted small">{dept.createdAt}</CTableDataCell>
                        <CTableDataCell className="pe-4 text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <CButton color="light" size="sm" className="border-0 text-primary" title="Chỉnh sửa" onClick={() => openEdit(dept)}>
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton color="light" size="sm" className="border-0 text-danger" title="Xóa">
                              <CIcon icon={cilTrash} />
                            </CButton>
                            <CButton color="light" size="sm" className="border-0 text-muted" title="Thêm">
                              <CIcon icon={cilOptions} />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {/* Pagination */}
              <div className="d-flex flex-wrap justify-content-between align-items-center px-4 py-3 border-top bg-white gap-3">
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <span>Hiển thị</span>
                  <CFormSelect size="sm" style={{ width: '75px' }} value={perPage} onChange={e => setPerPage(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </CFormSelect>
                  <span>của {mockDepartments.length} phòng ban</span>
                </div>
                <CPagination size="sm" className="mb-0">
                  <CPaginationItem disabled>Previous</CPaginationItem>
                  <CPaginationItem active>1</CPaginationItem>
                  <CPaginationItem>2</CPaginationItem>
                  <CPaginationItem>3</CPaginationItem>
                  <CPaginationItem>Next</CPaginationItem>
                </CPagination>
              </div>
            </>
          ) : (
            /* Grid View */
            <div className="p-4">
              <CRow className="g-4">
                {mockDepartments.map((dept, idx) => (
                  <CCol sm={6} lg={4} xl={3} key={dept.id}>
                    <div
                      className="bg-white border rounded-3 h-100 cursor-pointer"
                      style={{ borderColor: '#E8EAED', transition: 'box-shadow 0.2s ease', maxWidth: '300px', margin: '0 auto' }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
                    >
                      <div className="p-4">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold text-dark mb-0 text-truncate pe-2" style={{ fontSize: '15px' }}>{dept.name}</h6>
                          <CBadge color={dept.status === 'Active' ? 'success' : 'secondary'} shape="rounded-pill" style={{ fontSize: '10px' }}>
                            {dept.status === 'Active' ? 'Hoạt động' : 'Khóa'}
                          </CBadge>
                        </div>

                        {/* Large Icon */}
                        <div className="text-center py-3 mb-3">
                          <div className="d-inline-flex align-items-center justify-content-center rounded-3" style={{ width: '56px', height: '56px', background: `${deptIconColors[idx % deptIconColors.length]}15`, color: deptIconColors[idx % deptIconColors.length] }}>
                            <CIcon icon={cilBuilding} style={{ width: '28px', height: '28px' }} />
                          </div>
                        </div>

                        {/* Manager */}
                        <div className="mb-3 pb-3 border-bottom">
                          <div className="text-muted mb-1" style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>Trưởng phòng</div>
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                              {dept.manager.charAt(0)}
                            </div>
                            <span className="fw-medium text-dark" style={{ fontSize: '13px' }}>{dept.manager}</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="d-flex justify-content-between text-muted mb-4" style={{ fontSize: '13px' }}>
                          <span className="d-flex align-items-center gap-1">
                            <CIcon icon={cilPeople} size="sm" />
                            {dept.employees} nhân viên
                          </span>
                          <span className="d-flex align-items-center gap-1">
                            <CIcon icon={cilOptions} size="sm" />
                            {dept.projects} dự án
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-4 pb-4 d-flex gap-2">
                        <CButton color="primary" variant="outline" size="sm" className="flex-grow-1 fw-medium">Xem chi tiết</CButton>
                        <CButton color="light" size="sm" className="flex-grow-1 fw-medium border" onClick={() => openEdit(dept)}>Chỉnh sửa</CButton>
                      </div>
                    </div>
                  </CCol>
                ))}
              </CRow>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Modal Thêm/Sửa Phòng ban */}
      <CModal visible={visible} onClose={() => setVisible(false)} alignment="center">
        <CModalHeader className="border-bottom-0 pb-0">
          <CModalTitle className="fw-bold">{editDept ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}</CModalTitle>
        </CModalHeader>
        <CModalBody className="px-4 pb-2">
          <CForm>
            <div className="mb-3">
              <CFormLabel className="fw-semibold text-dark" style={{ fontSize: '13px' }}>
                Tên phòng ban <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput placeholder="VD: Phòng Kỹ thuật" defaultValue={editDept?.name} />
            </div>
            <div className="mb-3">
              <CFormLabel className="fw-semibold text-dark" style={{ fontSize: '13px' }}>
                Trưởng phòng <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect defaultValue={editDept?.manager}>
                <option value="">Chọn nhân viên</option>
                <option>Nguyễn Văn A</option>
                <option>Trần Thị B</option>
                <option>Lê Văn C</option>
                <option>Phạm Thị D</option>
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormLabel className="fw-semibold text-dark" style={{ fontSize: '13px' }}>Mô tả</CFormLabel>
              <CFormTextarea rows={3} placeholder="Mô tả chức năng và trách nhiệm của phòng ban..." />
            </div>
            <div className="mb-1">
              <CFormLabel className="fw-semibold text-dark" style={{ fontSize: '13px' }}>Trạng thái</CFormLabel>
              <div className="d-flex gap-4">
                <CFormCheck type="radio" name="status" id="statusActive" label="Hoạt động" defaultChecked={editDept?.status !== 'Inactive'} />
                <CFormCheck type="radio" name="status" id="statusInactive" label="Khóa" defaultChecked={editDept?.status === 'Inactive'} />
              </div>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter className="border-top-0">
          <CButton color="light" onClick={() => setVisible(false)} className="fw-medium px-4">Hủy</CButton>
          <CButton color="primary" className="fw-semibold px-4">Lưu</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Departments
