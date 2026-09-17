import React from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CProgress,
  CRow,
} from '@coreui/react'
import { ProjectProgress } from 'src/types/ProjectType/project-progress'



interface ProjectProgressCardProps {
  progress: ProjectProgress | null
  loading?: boolean
}

const getNumber = (
  value: number | undefined,
  fallback = 0,
): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }

  return value
}

const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({
  progress,
  loading = false,
}) => {
  if (loading) {
    return (
      <CCard className="mb-4">
        <CCardBody>
          <div className="text-medium-emphasis">
            Đang tải tiến độ dự án...
          </div>
        </CCardBody>
      </CCard>
    )
  }

  const overallProgress = Math.min(
    100,
    Math.max(
      0,
      getNumber(
        progress?.overallProgress ?? progress?.progress,
        0,
      ),
    ),
  )

  const totalTasks =
    progress?.totalTasks ??
    progress?.totalTaskCount ??
    0

  const completedTasks =
    progress?.completedTasks ??
    progress?.completedTaskCount ??
    0

  const inProgressTasks = progress?.inProgressTasks ?? 0

  const todoTasks = progress?.todoTasks ?? 0

  const overdueTasks = progress?.overdueTaskCount ?? 0

  return (
    <CCard className="mb-4">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-1">Tiến độ dự án</h5>
            <small className="text-medium-emphasis">
              Tổng quan tiến độ công việc
            </small>
          </div>

          <strong>{Math.round(overallProgress)}%</strong>
        </div>

        <CProgress
          value={overallProgress}
          height={8}
          className="mb-4"
        />

        <CRow className="g-3">
          <CCol xs={6} md={3}>
            <div className="border rounded p-3 h-100">
              <div className="text-medium-emphasis small">
                Tổng task
              </div>
              <div className="fs-4 fw-semibold">
                {totalTasks}
              </div>
            </div>
          </CCol>

          <CCol xs={6} md={3}>
            <div className="border rounded p-3 h-100">
              <div className="text-medium-emphasis small">
                Hoàn thành
              </div>
              <div className="fs-4 fw-semibold">
                {completedTasks}
              </div>
            </div>
          </CCol>

          <CCol xs={6} md={3}>
            <div className="border rounded p-3 h-100">
              <div className="text-medium-emphasis small">
                Đang thực hiện
              </div>
              <div className="fs-4 fw-semibold">
                {inProgressTasks}
              </div>
            </div>
          </CCol>

          <CCol xs={6} md={3}>
            <div className="border rounded p-3 h-100">
              <div className="text-medium-emphasis small">
                Quá hạn
              </div>
              <div className="fs-4 fw-semibold">
                {overdueTasks}
              </div>
            </div>
          </CCol>
        </CRow>

        <div className="mt-3 text-medium-emphasis small">
          {todoTasks} task đang chờ xử lý
        </div>
      </CCardBody>
    </CCard>
  )
}

export default ProjectProgressCard