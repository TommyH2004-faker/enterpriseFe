import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CProgress,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowLeft,
  cilBuilding,
  cilCalendar,
  cilChartPie,
  cilCheckCircle,
  cilList,
  cilPeople,
  cilTask,
  cilUser,
  cilWarning,
} from '@coreui/icons'
import { projectService } from '../../services/projectService'
import { departmentService } from '../../services/departmentService'
import {
  ProjectDetail as ProjectDetailModel,
  ProjectProgress,
  ProjectStatistics,
} from '../../types/Project'

const statusLabels: Record<string, string> = {
  Planning: 'Lên kế hoạch',
  Active: 'Đang thực hiện',
  OnHold: 'Tạm dừng',
  Completed: 'Hoàn thành',
  Cancelled: 'Đã hủy',
  Archived: 'Lưu trữ',
}

const statusColors: Record<string, string> = {
  Planning: 'info',
  Active: 'success',
  OnHold: 'warning',
  Completed: 'primary',
  Cancelled: 'danger',
  Archived: 'secondary',
}

const priorityLabels: Record<string, string> = {
  '0': 'Thấp',
  '1': 'Trung bình',
  '2': 'Cao',
  '3': 'Khẩn cấp',
  Low: 'Thấp',
  Medium: 'Trung bình',
  High: 'Cao',
  Critical: 'Khẩn cấp',
}

const priorityColors: Record<string, string> = {
  '0': 'secondary',
  '1': 'info',
  '2': 'warning',
  '3': 'danger',
  Low: 'secondary',
  Medium: 'info',
  High: 'warning',
  Critical: 'danger',
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

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectDetailModel | null>(null)
  const [progress, setProgress] = useState<ProjectProgress | null>(null)
  const [statistics, setStatistics] = useState<ProjectStatistics | null>(null)
  const [departmentFallback, setDepartmentFallback] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!projectId) return

    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const [projectResult, progressResult, statisticsResult] = await Promise.all([
          projectService.getProjectById(projectId),
          projectService.getProjectProgress(projectId).catch(() => null),
          projectService.getProjectStatistics(projectId).catch(() => null),
        ])
        setProject(projectResult)
        setProgress(progressResult)
        setStatistics(statisticsResult)

        // If department name is not included in project payload, query by departmentId
        const hasDeptName =
          projectResult?.departmentName ||
          (projectResult as any)?.DepartmentName ||
          (projectResult as any)?.department_name ||
          projectResult?.department?.name
        const deptId =
          projectResult?.departmentId ||
          (projectResult as any)?.DepartmentId ||
          (projectResult as any)?.department_id ||
          projectResult?.department?.id

        if (!hasDeptName && deptId) {
          departmentService
            .getDepartmentById(deptId)
            .then((dept) => {
              if (dept?.name) setDepartmentFallback(dept.name)
            })
            .catch(() => {})
        }
      } catch {
        setError('Không thể tải thông tin dự án. Dự án có thể không tồn tại hoặc bạn không có quyền truy cập.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [projectId])

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <div className="text-muted small mt-2">Đang tải chi tiết dự án...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="py-4">
        <CAlert color="danger" className="d-flex align-items-center justify-content-between">
          <span>{error || 'Không tìm thấy thông tin dự án.'}</span>
          <Link to="/projects">
            <CButton color="outline-danger" size="sm">
              Quay lại danh sách
            </CButton>
          </Link>
        </CAlert>
      </div>
    )
  }

  // Unified data mapping supporting both conventions
  const currentProgress =
    progress?.overallProgress ??
    progress?.progress ??
    project.progress ??
    0

  const totalTasks =
    statistics?.totalTasks ??
    statistics?.taskCount ??
    progress?.totalTasks ??
    project.taskCount ??
    0

  const completedTasks =
    progress?.completedTasks ??
    statistics?.completedTasks ??
    progress?.completedTaskCount ??
    statistics?.completedTaskCount ??
    0

  const inProgressTasks = progress?.inProgressTasks ?? 0
  const todoTasks = progress?.todoTasks ?? 0
  const overdueTasks = progress?.overdueTaskCount ?? 0

  const totalMembers =
    statistics?.totalMembers ??
    statistics?.memberCount ??
    project.members?.length ??
    project.memberCount ??
    0

  const activeMembers =
    statistics?.activeMembers ??
    statistics?.activeMemberCount ??
    0

  const totalMilestones =
    statistics?.totalMilestones ??
    progress?.totalMilestones ??
    statistics?.milestoneCount ??
    project.milestones?.length ??
    0

  const completedMilestones =
    statistics?.completedMilestones ??
    progress?.completedMilestones ??
    0

  const milestoneList = progress?.milestoneBreakdown ?? project.milestones ?? []
  const totalBoards = statistics?.totalKanbanBoards ?? project.boards?.length ?? 0

  // Multi-tier fallback for Department and Manager names
  const p = project as any
  const departmentName =
    project.departmentName ||
    p.DepartmentName ||
    p.department_name ||
    project.department?.name ||
    p.Department?.Name ||
    departmentFallback ||
    'Chưa cập nhật'

  const managerName =
    project.managerName ||
    p.ManagerName ||
    p.manager_name ||
    project.manager?.fullName ||
    p.manager?.name ||
    'Chưa phân công'

  return (
    <div className="pb-5">
      {/* Header Section */}
      <div className="mb-4">
        <Link
          to="/projects"
          className="text-decoration-none small text-muted d-inline-flex align-items-center mb-3"
        >
          <CIcon icon={cilArrowLeft} className="me-1" /> Quay lại danh sách dự án
        </Link>

        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div className="flex-grow-1" style={{ maxWidth: 800 }}>
            {/* Metadata Tags */}
            <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
              <span className="badge bg-light text-secondary border px-2 py-1 fw-semibold">
                {project.code}
              </span>
              <CBadge
                color={statusColors[project.status] || 'primary'}
                className="px-2 py-1 fw-medium"
              >
                {statusLabels[project.status] || project.status}
              </CBadge>
              {project.priority !== undefined && (
                <CBadge
                  color={priorityColors[String(project.priority)] || 'secondary'}
                  className="px-2 py-1 fw-medium"
                >
                  Ưu tiên: {priorityLabels[String(project.priority)] || project.priority}
                </CBadge>
              )}
              {project.isActive && (
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                  Đang hoạt động
                </span>
              )}
            </div>

            {/* Project Title */}
            <h1 className="h2 fw-bold text-dark mb-2">{project.name}</h1>
            <p className="text-muted mb-0" style={{ lineHeight: 1.5 }}>
              {project.description || 'Chưa có mô tả chi tiết cho dự án này.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 align-self-start">
            <Link to={`/projects/${project.id}/kanban`}>
              <CButton color="primary" className="d-flex align-items-center shadow-sm px-3 py-2 fw-semibold">
                <CIcon icon={cilTask} className="me-2" />
                Mở bảng Kanban
              </CButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Pills */}
      <div className="d-flex align-items-center gap-2 border-bottom pb-3 mb-4">
        <CButton color="primary" className="px-4 py-2 fw-semibold d-flex align-items-center">
          <CIcon icon={cilChartPie} className="me-2" />
          Tổng quan dự án
        </CButton>
        <CButton
          color="light"
          variant="outline"
          className="px-4 py-2 text-secondary fw-semibold border d-flex align-items-center"
          onClick={() => navigate(`/projects/${project.id}/kanban`)}
        >
          <CIcon icon={cilTask} className="me-2" />
          Bảng Kanban {totalBoards > 0 ? `(${totalBoards})` : ''}
        </CButton>
      </div>

      {/* Main Content Grid */}
      <CRow className="g-4 align-items-start">
        {/* Left Column: Progress, Tasks, Milestones */}
        <CCol xs={12} lg={8}>
          {/* Progress & Task Breakdown Card */}
          <CCard className="border-0 shadow-sm rounded-3 bg-white mb-4">
            <CCardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold text-dark mb-0">Tiến độ thực hiện</h5>
                <span className="h4 fw-bold text-primary mb-0">{currentProgress}%</span>
              </div>
              <CProgress
                value={currentProgress}
                color={currentProgress === 100 ? 'success' : 'primary'}
                className="rounded-pill mb-4"
                style={{ height: 10 }}
              />

              {/* 4 Task Metric Boxes */}
              <CRow className="g-3">
                <CCol xs={6} sm={3}>
                  <div
                    className="p-3 rounded-3 border bg-light bg-opacity-50 text-center d-flex flex-column justify-content-center"
                    style={{ minHeight: 90 }}
                  >
                    <div className="text-muted small fw-medium mb-1">Tổng việc</div>
                    <div className="h3 fw-bold text-dark mb-0">{totalTasks}</div>
                  </div>
                </CCol>

                <CCol xs={6} sm={3}>
                  <div
                    className="p-3 rounded-3 border bg-light bg-opacity-50 text-center d-flex flex-column justify-content-center"
                    style={{ minHeight: 90 }}
                  >
                    <div className="text-muted small fw-medium mb-1">Cần làm</div>
                    <div className="h3 fw-bold text-secondary mb-0">{todoTasks}</div>
                  </div>
                </CCol>

                <CCol xs={6} sm={3}>
                  <div
                    className="p-3 rounded-3 border bg-light bg-opacity-50 text-center d-flex flex-column justify-content-center"
                    style={{ minHeight: 90 }}
                  >
                    <div className="text-muted small fw-medium mb-1">Đang làm</div>
                    <div className="h3 fw-bold text-warning mb-0">{inProgressTasks}</div>
                  </div>
                </CCol>

                <CCol xs={6} sm={3}>
                  <div
                    className="p-3 rounded-3 border bg-light bg-opacity-50 text-center d-flex flex-column justify-content-center"
                    style={{ minHeight: 90 }}
                  >
                    <div className="text-muted small fw-medium mb-1">Hoàn thành</div>
                    <div className="h3 fw-bold text-success mb-0">{completedTasks}</div>
                  </div>
                </CCol>
              </CRow>

              {overdueTasks > 0 && (
                <div className="mt-3 p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center text-danger">
                    <CIcon icon={cilWarning} className="me-2" />
                    <span className="small fw-semibold">Công việc đã quá hạn cần hoàn tất gấp</span>
                  </div>
                  <CBadge color="danger" className="px-2 py-1 fs-6">
                    {overdueTasks} việc
                  </CBadge>
                </div>
              )}
            </CCardBody>
          </CCard>

          {/* Milestones Card */}
          <CCard className="border-0 shadow-sm rounded-3 bg-white">
            <CCardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Cột mốc dự án (Milestones)</h5>
                <span className="badge bg-light text-secondary border px-2 py-1">
                  {completedMilestones} / {totalMilestones} hoàn thành
                </span>
              </div>

              {totalMilestones > 0 ? (
                <>
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Tiến độ hoàn thành mốc</span>
                    <span className="fw-semibold text-dark">
                      {Math.round((completedMilestones / totalMilestones) * 100)}%
                    </span>
                  </div>
                  <CProgress
                    value={Math.round((completedMilestones / totalMilestones) * 100)}
                    color="success"
                    className="rounded-pill mb-3"
                    style={{ height: 8 }}
                  />
                  {milestoneList.length > 0 && (
                    <div className="list-group list-group-flush border-top">
                      {milestoneList.map((m, idx) => (
                        <div
                          key={m.id || idx}
                          className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center bg-transparent"
                        >
                          <span className="small text-dark fw-medium">
                            {m.title || m.name || `Cột mốc #${idx + 1}`}
                          </span>
                          <CBadge
                            color={m.completed || m.isCompleted ? 'success' : 'secondary'}
                            className="px-2 py-1"
                          >
                            {m.completed || m.isCompleted ? 'Hoàn thành' : 'Đang xử lý'}
                          </CBadge>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 bg-light bg-opacity-25 rounded-3 border border-dashed">
                  <div className="text-muted small mb-0">
                    Chưa có cột mốc (milestone) nào được thiết lập cho dự án này.
                  </div>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Right Column: Project Information Details */}
        <CCol xs={12} lg={4}>
          <CCard className="border-0 shadow-sm rounded-3 bg-white">
            <CCardBody className="p-4">
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">Thông tin chi tiết</h5>

              {/* Project Manager */}
              <div className="d-flex align-items-center gap-3 py-2">
                <div
                  className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 42, height: 42 }}
                >
                  <CIcon icon={cilUser} />
                </div>
                <div className="min-w-0">
                  <div className="text-muted small">Quản lý dự án</div>
                  <div className="fw-bold text-dark text-truncate" title={managerName}>
                    {managerName}
                  </div>
                </div>
              </div>

              {/* Department */}
              <div className="d-flex align-items-center gap-3 py-2">
                <div
                  className="p-2 rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 42, height: 42 }}
                >
                  <CIcon icon={cilBuilding} />
                </div>
                <div className="min-w-0">
                  <div className="text-muted small">Phòng ban</div>
                  <div className="fw-bold text-dark text-truncate" title={departmentName}>
                    {departmentName}
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="d-flex align-items-center gap-3 py-2">
                <div
                  className="p-2 rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 42, height: 42 }}
                >
                  <CIcon icon={cilPeople} />
                </div>
                <div className="min-w-0">
                  <div className="text-muted small">Thành viên tham gia</div>
                  <div className="fw-bold text-dark">
                    {totalMembers} thành viên{' '}
                    {activeMembers > 0 && (
                      <span className="text-success small fw-normal">({activeMembers} hoạt động)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Kanban Boards */}
              <div className="d-flex align-items-center gap-3 py-2">
                <div
                  className="p-2 rounded-3 bg-secondary bg-opacity-10 text-secondary d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 42, height: 42 }}
                >
                  <CIcon icon={cilTask} />
                </div>
                <div className="min-w-0">
                  <div className="text-muted small">Bảng Kanban</div>
                  <div className="fw-bold text-dark">{totalBoards} bảng quy trình</div>
                </div>
              </div>

              {/* Timeframe */}
              <div className="d-flex align-items-center gap-3 py-2">
                <div
                  className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 42, height: 42 }}
                >
                  <CIcon icon={cilCalendar} />
                </div>
                <div className="min-w-0">
                  <div className="text-muted small">Thời gian thực hiện</div>
                  <div className="fw-semibold text-dark small">
                    {formatDate(project.startDate || statistics?.startDate)} -{' '}
                    {formatDate(project.endDate || statistics?.endDate)}
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="d-flex align-items-center gap-3 py-2 border-top mt-2 pt-3">
                <div
                  className="p-2 rounded-3 bg-light text-muted d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 42, height: 42 }}
                >
                  <CIcon icon={cilList} />
                </div>
                <div className="min-w-0">
                  <div className="text-muted small">Ngày khởi tạo</div>
                  <div className="text-muted small">
                    {formatDate(project.createdAt || statistics?.createdDate)}
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

export default ProjectDetail
