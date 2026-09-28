import React from 'react'
import { CCard, CCardBody, CCol, CProgress, CRow } from '@coreui/react'
import { ProjectProgress } from 'src/types/ProjectType/project-progress'

interface ProjectProgressCardProps {
  progress: ProjectProgress | null
  loading?: boolean
}

const getNumber = (value: number | undefined, fallback = 0): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return value
}

const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({ progress, loading = false }) => {
  if (loading) {
    return (
      <CCard className="mb-4 border-0 shadow-sm">
        <CCardBody className="text-center py-5 text-body-secondary">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          Đang tải tiến độ dự án...
        </CCardBody>
      </CCard>
    )
  }

  const overallProgress = Math.min(100, Math.max(0, getNumber(progress?.overallProgress ?? progress?.progress, 0)))
  const totalTasks = progress?.totalTasks ?? progress?.totalTaskCount ?? 0
  const completedTasks = progress?.completedTasks ?? progress?.completedTaskCount ?? 0
  const inProgressTasks = progress?.inProgressTasks ?? 0
  const todoTasks = progress?.todoTasks ?? 0
  const overdueTasks = progress?.overdueTaskCount ?? 0

  return (
    <CCard className="mb-4 border-0 shadow-sm">
      <CCardBody className="p-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h5 className="mb-1 fw-bold">Tiến độ dự án</h5>
            <div className="text-body-secondary small">Tổng quan hoàn thành công việc</div>
          </div>
          <h3 className="mb-0 fw-bold text-primary">{Math.round(overallProgress)}%</h3>
        </div>

        <CProgress className="mb-4 rounded-pill bg-light" height={10}>
          <CProgress color={overallProgress === 100 ? 'success' : 'primary'} value={overallProgress} />
        </CProgress>

        <CRow className="g-3">
          <CCol xs={6} md={3}>
            <div className="bg-light bg-opacity-50 border border-light rounded-3 p-3 h-100">
              <div className="text-body-secondary small mb-1 fw-medium text-uppercase" style={{ fontSize: '11px' }}>Tổng Task</div>
              <div className="fs-4 fw-bold text-dark">{totalTasks}</div>
            </div>
          </CCol>

          <CCol xs={6} md={3}>
            <div className="bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 p-3 h-100">
              <div className="text-success small mb-1 fw-medium text-uppercase" style={{ fontSize: '11px' }}>Hoàn thành</div>
              <div className="fs-4 fw-bold text-success">{completedTasks}</div>
            </div>
          </CCol>

          <CCol xs={6} md={3}>
            <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 p-3 h-100">
              <div className="text-primary small mb-1 fw-medium text-uppercase" style={{ fontSize: '11px' }}>Đang thực hiện</div>
              <div className="fs-4 fw-bold text-primary">{inProgressTasks}</div>
            </div>
          </CCol>

          <CCol xs={6} md={3}>
            <div className="bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 p-3 h-100">
              <div className="text-danger small mb-1 fw-medium text-uppercase" style={{ fontSize: '11px' }}>Quá hạn</div>
              <div className="fs-4 fw-bold text-danger">{overdueTasks}</div>
            </div>
          </CCol>
        </CRow>

        {todoTasks > 0 && (
          <div className="mt-3 text-body-secondary small text-end fst-italic">
            * Còn {todoTasks} task đang chờ xử lý (Todo)
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ProjectProgressCard