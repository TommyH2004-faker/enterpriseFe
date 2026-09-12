import React, { useEffect, useMemo, useState } from 'react'
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
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilPlus,
  cilPeople,
  cilList,
  cilCalendar,
  cilBriefcase,
  cilSettings,
} from '@coreui/icons'
import { getProjectErrorMessage, projectService } from '../../services/projectService'
import { departmentService } from '../../services/departmentService'
import { employeeService } from '../../services/employeeService'
import { DepartmentResponse } from '../../types/Department'
import { EmployeeResponse } from '../../types/Employee'
import { CreateProjectRequest, ProjectPriority, ProjectStatus, ProjectSummary } from '../../types/Project'
import { useProjects } from './useProjects'

const statusLabels: Record<string, string> = {
  Planning: 'Lên kế hoạch',
  Active: 'Đang làm',
  OnHold: 'Tạm dừng',
  Completed: 'Hoàn thành',
  Cancelled: 'Đóng',
  Archived: 'Lưu trữ',
}

const getStatusColor = (status?: ProjectStatus) => {
  switch (status) {
    case 'Active':
    case 'Đang làm':
      return 'success'
    case 'OnHold':
    case 'Tạm dừng':
      return 'warning'
    case 'Completed':
    case 'Hoàn thành':
      return 'info'
    case 'Cancelled':
    case 'Archived':
    case 'Đóng':
    case 'Lưu trữ':
      return 'secondary'
    default:
      return 'primary'
  }
}

const getProgressColor = (progress: number) => {
  if (progress < 30) return 'danger'
  if (progress < 70) return 'info'
  return 'success'
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Chưa thiết lập'
  try {
    const d = new Date(value)
    return isNaN(d.getTime()) ? value : d.toLocaleDateString('vi-VN')
  } catch {
    return value
  }
}

const emptyForm: CreateProjectRequest = {
  code: '',
  name: '',
  description: '',
  departmentId: '',
  managerId: '',
  startDate: null,
  endDate: null,
  priority: 1,
}

const Projects: React.FC = () => {
  const api = useProjects()
  const [visible, setVisible] = useState(false)
  const [viewMode, setViewMode] = useState<'Grid' | 'List' | 'Timeline'>('Grid')
  const [form, setForm] = useState<CreateProjectRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [allDepartments, setAllDepartments] = useState<DepartmentResponse[]>([])
  const [managers, setManagers] = useState<EmployeeResponse[]>([])

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [departmentResult, employeeResult] = await Promise.all([
          departmentService.getAllDepartments(1, 100, { sortBy: 'Name' }),
          employeeService.getEmployees({ includeInactive: false }),
        ])
        setAllDepartments(departmentResult.items || [])
        setManagers((employeeResult || []).filter((e) => e.isActive))
      } catch {
        // Options fallback silently
      }
    }
    void loadOptions()
  }, [])

  // Department ID lookup map
  const departmentMap = useMemo(() => {
    const map: Record<string, string> = {}
    allDepartments.forEach((d) => {
      if (d.id && d.name) map[d.id] = d.name
    })
    return map
  }, [allDepartments])

  // Manager ID lookup map
  const managerMap = useMemo(() => {
    const map: Record<string, string> = {}
    managers.forEach((m) => {
      if (m.userId && m.fullName) map[m.userId] = m.fullName
    })
    return map
  }, [managers])

  // Robust department resolver
  const getDepartmentName = (project: ProjectSummary): string => {
    const p = project as any
    const direct =
      project.departmentName ||
      p.DepartmentName ||
      p.department_name ||
      p.department?.name ||
      p.Department?.Name
    if (direct && typeof direct === 'string' && direct.trim() !== '') return direct

    const deptId =
      project.departmentId ||
      p.DepartmentId ||
      p.department_id ||
      p.department?.id ||
      p.Department?.Id
    if (deptId && departmentMap[deptId]) return departmentMap[deptId]

    return 'Chưa cập nhật'
  }

  // Robust manager resolver
  const getManagerName = (project: ProjectSummary): string => {
    const p = project as any
    const direct =
      project.managerName ||
      p.ManagerName ||
      p.manager_name ||
      project.managerName ||
      p.manager?.fullName ||
      p.manager?.name
    if (direct && typeof direct === 'string' && direct.trim() !== '') return direct

    const mgrId =
      project.managerId ||
      p.ManagerId ||
      p.manager_id ||
      p.manager?.userId ||
      p.manager?.id
    if (mgrId && managerMap[mgrId]) return managerMap[mgrId]

    return 'Chưa phân công'
  }

  const activeDepartments = useMemo(() => allDepartments.filter((d) => d.isActive), [allDepartments])
  const availableManagers = useMemo(
    () => managers.filter((m) => !form.departmentId || m.departmentId === form.departmentId),
    [managers, form.departmentId],
  )

  const updateForm = (field: keyof CreateProjectRequest, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'departmentId' ? { managerId: '' } : {}),
    }))
  }

  const submitProject = async () => {
    if (!form.name.trim() || !form.departmentId || !form.managerId) {
      setSaveError('Vui lòng nhập tên dự án, chọn phòng ban và quản lý dự án.')
      return
    }

    try {
      setSaving(true)
      setSaveError('')
      // Auto-generate code if empty
      const payload: CreateProjectRequest = {
        ...form,
        code: form.code.trim() || `PJ-${Math.floor(10 + Math.random() * 90)}`,
      }
      const created = await projectService.createProject(payload)
      const enriched: ProjectSummary = {
        ...created,
        departmentName: created.departmentName || departmentMap[created.departmentId || ''] || '',
        managerName: created.managerName || managerMap[created.managerId || ''] || '',
      }
      api.addProject(enriched)
      setVisible(false)
      setForm(emptyForm)
    } catch (err) {
      setSaveError(getProjectErrorMessage(err, 'Không thể tạo dự án. Vui lòng thử lại.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Header Section */}
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

      {/* 4 KPI Cards */}
      <CRow className="g-3 mb-4">
        {[
          { label: 'Tổng dự án', value: api.pagination.totalCount || api.projects.length, color: 'primary' },
          { label: 'Đang làm', value: api.projects.filter((p) => p.status === 'Active').length, color: 'success' },
          { label: 'Tạm dừng', value: api.projects.filter((p) => p.status === 'OnHold').length, color: 'warning' },
          { label: 'Đóng', value: api.projects.filter((p) => p.status === 'Completed' || p.status === 'Cancelled').length, color: 'secondary' },
        ].map((item) => (
          <CCol xs={12} sm={6} xl={3} key={item.label}>
            <CCard className="shadow-sm border-0 h-100 bg-white">
              <CCardBody className="p-4">
                <div
                  className={`bg-${item.color} bg-opacity-10 text-${item.color} rounded d-inline-flex align-items-center justify-content-center mb-3`}
                  style={{ width: '46px', height: '46px' }}
                >
                  <CIcon icon={cilBriefcase} />
                </div>
                <div className="fw-bold text-dark" style={{ fontSize: '28px' }}>
                  {item.value}
                </div>
                <div className="text-uppercase text-muted small fw-semibold">{item.label}</div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Tabs Switcher: List / Grid / Timeline */}
      <CCard className="mb-4 shadow-sm border-0 bg-white">
        <CCardBody className="pb-0">
          <CNav variant="tabs" className="border-bottom-0">
            {(['List', 'Grid', 'Timeline'] as const).map((item) => (
              <CNavItem key={item}>
                <CNavLink
                  active={viewMode === item}
                  className="cursor-pointer"
                  onClick={() => setViewMode(item)}
                >
                  {item}
                </CNavLink>
              </CNavItem>
            ))}
          </CNav>
        </CCardBody>
      </CCard>

      {/* Filter and Content Card */}
      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white pb-0 border-bottom-0 pt-3 px-4">
          <CRow className="g-3">
            <CCol md={4} lg={4}>
              <CInputGroup>
                <CInputGroupText className="bg-white">
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Tìm kiếm dự án..."
                  value={api.filters.search || ''}
                  onChange={(e) => api.updateFilters({ search: e.target.value })}
                />
              </CInputGroup>
            </CCol>

            <CCol md={3} lg={3}>
              <CFormSelect
                value={api.filters.status || ''}
                onChange={(e) => api.updateFilters({ status: e.target.value || undefined })}
              >
                <option value="">Trạng thái: Tất cả</option>
                <option value="Active">Đang làm</option>
                <option value="OnHold">Tạm dừng</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Cancelled">Đóng</option>
                <option value="Archived">Lưu trữ</option>
              </CFormSelect>
            </CCol>

            <CCol md={2} lg={2}>
              <CFormSelect
                value={api.filters.departmentId || ''}
                onChange={(e) => api.updateFilters({ departmentId: e.target.value || undefined })}
              >
                <option value="">Phòng ban: Tất cả</option>
                {allDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={3} lg={3}>
              <CFormSelect
                value={`${api.filters.sortBy || 'createdAt'}:${api.filters.sortDirection || 'desc'}`}
                onChange={(e) => {
                  const [sortBy, sortDirection] = e.target.value.split(':') as [string, 'asc' | 'desc']
                  api.updateFilters({ sortBy, sortDirection })
                }}
              >
                <option value="createdAt:desc">Sắp xếp theo: Mới nhất</option>
                <option value="name:asc">Tên dự án (A-Z)</option>
                <option value="endDate:asc">Ngày đến hạn gần nhất</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardHeader>

        <CCardBody className="px-4 pb-4 pt-4 bg-light bg-opacity-50">
          {/* Quick Filter Pill Badges */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <CBadge
              color={!api.filters.status ? 'primary' : 'light'}
              shape="rounded-pill"
              className={`cursor-pointer px-3 py-2 ${!api.filters.status ? '' : 'text-dark border'}`}
              onClick={() => api.updateFilters({ status: undefined })}
            >
              Tất cả
            </CBadge>
            <CBadge
              color={api.filters.status === 'Active' ? 'success' : 'light'}
              shape="rounded-pill"
              className={`cursor-pointer px-3 py-2 ${api.filters.status === 'Active' ? '' : 'text-dark border'}`}
              onClick={() => api.updateFilters({ status: api.filters.status === 'Active' ? undefined : 'Active' })}
            >
              Đang làm
            </CBadge>
            <CBadge
              color={api.filters.status === 'OnHold' ? 'warning' : 'light'}
              shape="rounded-pill"
              className={`cursor-pointer px-3 py-2 ${api.filters.status === 'OnHold' ? '' : 'text-dark border'}`}
              onClick={() => api.updateFilters({ status: api.filters.status === 'OnHold' ? undefined : 'OnHold' })}
            >
              Tạm dừng
            </CBadge>
            <CBadge
              color={api.filters.status === 'Completed' ? 'info' : 'light'}
              shape="rounded-pill"
              className={`cursor-pointer px-3 py-2 ${api.filters.status === 'Completed' ? '' : 'text-dark border'}`}
              onClick={() => api.updateFilters({ status: api.filters.status === 'Completed' ? undefined : 'Completed' })}
            >
              Hoàn thành
            </CBadge>
            <CBadge
              color={api.filters.status === 'Cancelled' ? 'secondary' : 'light'}
              shape="rounded-pill"
              className={`cursor-pointer px-3 py-2 ${api.filters.status === 'Cancelled' ? '' : 'text-dark border'}`}
              onClick={() => api.updateFilters({ status: api.filters.status === 'Cancelled' ? undefined : 'Cancelled' })}
            >
              Đóng
            </CBadge>
          </div>

          {/* Loading */}
          {api.loading && (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <div className="text-muted small mt-2">Đang tải danh sách dự án...</div>
            </div>
          )}

          {/* Empty State */}
          {!api.loading && !api.projects.length && (
            <div className="text-center py-5 bg-white rounded-3 p-4 shadow-sm">
              <div className="text-muted mb-2">
                <CIcon icon={cilBriefcase} size="3xl" />
              </div>
              <h5 className="fw-bold text-dark">Không tìm thấy dự án</h5>
              <p className="text-muted small mb-3">Hãy thử thay đổi điều kiện tìm kiếm hoặc tạo dự án mới.</p>
              <CButton color="primary" size="sm" onClick={() => setVisible(true)}>
                <CIcon icon={cilPlus} className="me-1" /> Tạo dự án mới
              </CButton>
            </div>
          )}

          {/* GRID VIEW */}
          {!api.loading && api.projects.length > 0 && viewMode === 'Grid' && (
            <CRow className="g-4">
              {api.projects.map((project) => {
                const progress = (project as any).overallProgress ?? project.progress ?? 0
                const manager = getManagerName(project)
                const department = getDepartmentName(project)
                const managerInitial = manager.charAt(0).toUpperCase()
                const memberCount =
                  project.memberCount ?? (project as any).totalMembers ?? project.memberCount ?? 0
                const taskCount = project.taskCount ?? (project as any).totalTasks ?? 0

                return (
                  <CCol sm={6} xl={4} key={project.id}>
                    <CCard className="h-100 shadow-sm border-0 bg-white">
                      <CCardBody className="d-flex flex-column p-4">
                        {/* Top: Name & Status Badge */}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="min-w-0 pe-2">
                            <span className="badge bg-light text-secondary border px-2 py-1 small mb-1">
                             Mã dự án : {project.code}
                            </span>
                          <Link 
                            to={`/project/${project.id}`}
                            className="text-decoration-none"
                            title={project.name}
                          >
                            <h5 className="mb-0 fw-bold text-dark text-truncate">
                              Tên dự án : {project.name}
                            </h5>
                          </Link>
                          </div>
                          <CBadge
                            color={getStatusColor(project.status)}
                            shape="rounded-pill"
                            className="flex-shrink-0 px-2 py-1"
                          >
                            {statusLabels[project.status] || project.status}
                          </CBadge>
                        </div>

                        {/* Department Name */}
                        <div className="text-muted small mb-3">
                          Phòng ban: <strong className="text-dark">{department}</strong>
                        </div>

                        {/* Description */}
                        <p
                          className="text-muted small mb-4 flex-grow-1"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.5,
                          }}
                        >
                          {project.description || 'Chưa có mô tả cho dự án này.'}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="d-flex justify-content-between small mb-1">
                            <span className="fw-semibold text-dark">Tiến độ</span>
                            <span className="fw-bold">{progress}%</span>
                          </div>
                          <CProgress value={progress} color={getProgressColor(progress)} height={6} />
                        </div>

                        {/* Counters: Members, Tasks, Due Date */}
                        <div className="d-flex flex-wrap gap-3 mb-4 text-muted small">
                          <div className="d-flex align-items-center" title="Số thành viên">
                            <CIcon icon={cilPeople} size="sm" className="me-1" />
                            <span>{memberCount}</span>
                          </div>
                          <div className="d-flex align-items-center" title="Số công việc">
                            <CIcon icon={cilList} size="sm" className="me-1" />
                            <span>{taskCount}</span>
                          </div>
                          <div className="d-flex align-items-center" title="Ngày đến hạn">
                            <CIcon icon={cilCalendar} size="sm" className="me-1" />
                            <span>{formatDate(project.endDate)}</span>
                          </div>
                        </div>

                        {/* Manager Avatar Row */}
                        <div className="d-flex align-items-center mb-0 pt-3 border-top mt-auto">
                          <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold"
                            style={{ width: '32px', height: '32px', fontSize: '12px' }}
                          >
                            {managerInitial}
                          </div>
                          <span className="small text-muted flex-grow-1 text-truncate">
                            Quản lý: <strong className="text-dark">{manager}</strong>
                          </span>
                        </div>
                      </CCardBody>

                      {/* Card Footer: Kanban button & Details button */}
                      <div className="card-footer bg-transparent border-top-0 d-flex justify-content-between align-items-center pb-3 px-4">
                        <Link
                          to={`/projects/${project.id}/kanban`}
                          className="text-decoration-none flex-grow-1 me-2"
                        >
                          <CButton color="primary" variant="outline" size="sm" className="w-100 fw-semibold">
                            Xem chi tiết Board
                          </CButton>
                        </Link>
                        <Link to={`/projects/${project.id}`}>
                          <CButton color="light" size="sm" className="border text-secondary" title="Chi tiết dự án">
                            <CIcon icon={cilSettings} />
                          </CButton>
                        </Link>
                      </div>
                    </CCard>
                  </CCol>
                )
              })}
            </CRow>
          )}

          {/* LIST VIEW (TABLE) */}
          {!api.loading && api.projects.length > 0 && viewMode === 'List' && (
            <div className="bg-white rounded-3 shadow-sm overflow-hidden">
              <CTable hover responsive className="mb-0 align-middle">
                <CTableHead className="bg-light">
                  <CTableRow>
                    <CTableHeaderCell>Mã dự án</CTableHeaderCell>
                    <CTableHeaderCell>Tên dự án</CTableHeaderCell>
                    <CTableHeaderCell>Phòng ban</CTableHeaderCell>
                    <CTableHeaderCell>Quản lý</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: 160 }}>Tiến độ</CTableHeaderCell>
                    <CTableHeaderCell>Ngày đến hạn</CTableHeaderCell>
                    <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Hành động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {api.projects.map((project) => {
                    const progress = (project as any).overallProgress ?? project.progress ?? 0
                    const manager = getManagerName(project)
                    const department = getDepartmentName(project)

                    return (
                      <CTableRow key={project.id}>
                        <CTableDataCell>
                          <span className="badge bg-light text-secondary border font-monospace">
                            {project.code}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <Link to={`/projects/${project.id}`} className="fw-bold text-dark text-decoration-none">
                            {project.name}
                          </Link>
                        </CTableDataCell>
                        <CTableDataCell className="text-muted small">{department}</CTableDataCell>
                        <CTableDataCell className="text-muted small">{manager}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center gap-2">
                            <div className="flex-grow-1">
                              <CProgress value={progress} color={getProgressColor(progress)} height={6} />
                            </div>
                            <span className="small fw-bold">{progress}%</span>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-muted small">{formatDate(project.endDate)}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getStatusColor(project.status)} shape="rounded-pill">
                            {statusLabels[project.status] || project.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          <div className="d-inline-flex gap-2">
                            <Link to={`/projects/${project.id}/kanban`}>
                              <CButton color="primary" size="sm" variant="outline">
                                Kanban
                              </CButton>
                            </Link>
                            <Link to={`/projects/${project.id}`}>
                              <CButton color="light" size="sm" className="border">
                                <CIcon icon={cilSettings} />
                              </CButton>
                            </Link>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </div>
          )}

          {/* TIMELINE VIEW */}
          {!api.loading && api.projects.length > 0 && viewMode === 'Timeline' && (
            <div className="bg-white rounded-3 shadow-sm p-4">
              <h6 className="fw-bold text-dark mb-3">Timeline các dự án</h6>
              <div className="d-flex flex-column gap-3">
                {api.projects.map((project) => {
                  const progress = (project as any).overallProgress ?? project.progress ?? 0
                  return (
                    <div key={project.id} className="p-3 border rounded-3 bg-light bg-opacity-50">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark">{project.name}</span>
                        <CBadge color={getStatusColor(project.status)} shape="rounded-pill">
                          {statusLabels[project.status] || project.status}
                        </CBadge>
                      </div>
                      <div className="d-flex justify-content-between text-muted small mb-2">
                        <span>Bắt đầu: {formatDate(project.startDate)}</span>
                        <span>Kết thúc: {formatDate(project.endDate)}</span>
                      </div>
                      <CProgress value={progress} color={getProgressColor(progress)} height={6} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          {!api.loading && api.pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <span className="text-muted small">
                Trang <strong>{api.pagination.page}</strong> / {api.pagination.totalPages} (Tổng{' '}
                {api.pagination.totalCount} dự án)
              </span>
              <div className="d-flex gap-2">
                <CButton
                  color="light"
                  className="border px-3 bg-white"
                  disabled={api.pagination.page <= 1}
                  onClick={() => api.updateFilters({ page: api.pagination.page - 1 })}
                >
                  Trước
                </CButton>
                <CButton
                  color="light"
                  className="border px-3 bg-white"
                  disabled={api.pagination.page >= api.pagination.totalPages}
                  onClick={() => api.updateFilters({ page: api.pagination.page + 1 })}
                >
                  Sau
                </CButton>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Modal Thêm Dự án */}
      <CModal visible={visible} onClose={() => setVisible(false)} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle className="fw-bold">Tạo dự án mới</CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          {saveError && <CAlert color="danger">{saveError}</CAlert>}
          <CForm>
            <div className="mb-3">
              <CFormLabel className="fw-semibold text-dark">
                Tên dự án <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                placeholder="Nhập tên dự án"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
              />
            </div>

            <div className="mb-3">
              <CFormLabel className="fw-semibold text-dark">Mô tả</CFormLabel>
              <CFormTextarea
                rows={3}
                placeholder="Mô tả mục tiêu và nội dung dự án..."
                value={form.description || ''}
                onChange={(e) => updateForm('description', e.target.value)}
              />
            </div>

            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel className="fw-semibold text-dark">
                  Phòng ban <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  value={form.departmentId}
                  onChange={(e) => updateForm('departmentId', e.target.value)}
                >
                  <option value="">Chọn phòng ban</option>
                  {activeDepartments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol md={6} className="mb-3">
                <CFormLabel className="fw-semibold text-dark">
                  Quản lý dự án <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  value={form.managerId}
                  disabled={!form.departmentId}
                  onChange={(e) => updateForm('managerId', e.target.value)}
                >
                  <option value="">
                    {form.departmentId ? 'Chọn quản lý' : 'Chọn phòng ban trước'}
                  </option>
                  {availableManagers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>

            <div className="mb-3">
              <CFormLabel className="fw-semibold text-dark">Ưu tiên</CFormLabel>
              <div className="d-flex gap-3 flex-wrap">
                <CFormCheck
                  inline
                  type="radio"
                  name="priority"
                  id="priorityNormal"
                  label="Thường"
                  checked={form.priority === 1}
                  onChange={() => updateForm('priority', 1 as ProjectPriority)}
                />
                <CFormCheck
                  inline
                  type="radio"
                  name="priority"
                  id="priorityHigh"
                  label="Cao"
                  checked={form.priority === 2}
                  onChange={() => updateForm('priority', 2 as ProjectPriority)}
                />
                <CFormCheck
                  inline
                  type="radio"
                  name="priority"
                  id="priorityUrgent"
                  label="Khẩn cấp"
                  checked={form.priority === 3}
                  onChange={() => updateForm('priority', 3 as ProjectPriority)}
                />
              </div>
            </div>

            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel className="fw-semibold text-dark">Ngày bắt đầu</CFormLabel>
                <CFormInput
                  type="date"
                  value={form.startDate || ''}
                  onChange={(e) => updateForm('startDate', e.target.value || null)}
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel className="fw-semibold text-dark">Ngày kết thúc</CFormLabel>
                <CFormInput
                  type="date"
                  value={form.endDate || ''}
                  onChange={(e) => updateForm('endDate', e.target.value || null)}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Hủy
          </CButton>
          <CButton
            color="primary"
            className="px-4 fw-semibold"
            disabled={saving}
            onClick={() => void submitProject()}
          >
            {saving ? <CSpinner size="sm" /> : 'Tạo dự án'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Projects
