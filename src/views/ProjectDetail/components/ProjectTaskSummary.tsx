import React from 'react'
import { CCard, CCardBody } from '@coreui/react'
import { ProjectProgress } from 'src/types/ProjectType/project-progress'

interface Props {
  progress: ProjectProgress | null
}

const ProjectTaskSummary: React.FC<Props> = ({ progress }) => {
  const todo = progress?.todoTasks ?? 0
  const inProgress = progress?.inProgressTasks ?? 0
  const completed = progress?.completedTasks ?? progress?.completedTaskCount ?? 0
  const total = todo + inProgress + completed

  return (
    <CCard className="border-0 shadow-sm h-100">
      <CCardBody>
        <h6 className="mb-4 fw-bold text-dark">Phân bổ công việc</h6>

        <div className="d-flex flex-column gap-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="bg-secondary rounded-circle" style={{ width: 10, height: 10 }}></span>
              <span className="text-body-secondary small fw-medium">Cần làm (Todo)</span>
            </div>
            <strong className="fs-6">{todo}</strong>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="bg-primary rounded-circle" style={{ width: 10, height: 10 }}></span>
              <span className="text-body-secondary small fw-medium">Đang xử lý (In Progress)</span>
            </div>
            <strong className="fs-6">{inProgress}</strong>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="bg-success rounded-circle" style={{ width: 10, height: 10 }}></span>
              <span className="text-body-secondary small fw-medium">Đã hoàn thành</span>
            </div>
            <strong className="fs-6">{completed}</strong>
          </div>
        </div>

        <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
          <span className="text-dark small fw-bold text-uppercase">Tổng cộng</span>
          <strong className="fs-5">{total}</strong>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default ProjectTaskSummary