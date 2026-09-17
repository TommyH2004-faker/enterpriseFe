import React from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
} from '@coreui/react'



import ProjectProgressCard from './ProjectProgressCard'
import {  ProjectProgress } from 'src/types/ProjectType/project-progress'
import { ProjectStatistics } from 'src/types/ProjectType/project-statistics'
import { ProjectDetail } from 'src/types/ProjectType/project'

interface ProjectOverviewProps {
  project: ProjectDetail
  progress: ProjectProgress | null
  statistics: ProjectStatistics | null
  loading?: boolean
}

const formatDate = (
  value?: string | null,
): string => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('vi-VN')
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  progress,
  statistics,
  loading = false,
}) => {
  const totalMembers =
    statistics?.totalMembers ??
    statistics?.memberCount ??
    project.memberCount ??
    project.memebers?.length ??
    0

  const totalTasks =
    statistics?.totalTasks ??
    statistics?.taskCount ??
    progress?.totalTasks ??
    progress?.totalTaskCount ??
    project.taskCount ??
    0

  const completedTasks =
    statistics?.completedTasks ??
    statistics?.completedTaskCount ??
    progress?.completedTasks ??
    progress?.completedTaskCount ??
    0

  const totalMilestones =
    statistics?.totalMilestones ??
    statistics?.milestoneCount ??
    progress?.totalMilestones ??
    project.milestones?.length ??
    0

  const completedMilestones =
    statistics?.completedMilestones ??
    progress?.completedMilestones ??
    0

  return (
    <div>
      <ProjectProgressCard
        progress={progress}
        loading={loading}
      />

      <CRow className="g-4">
        <CCol xs={12} lg={8}>
          <CCard className="h-100">
            <CCardBody>
              <h5 className="mb-3">
                Thông tin dự án
              </h5>

              <div className="mb-4">
                <div className="text-medium-emphasis small mb-1">
                  Mô tả
                </div>

                <div>
                  {project.description?.trim() ||
                    'Chưa có mô tả cho dự án.'}
                </div>
              </div>

              <CRow className="g-3">
                <CCol xs={12} md={6}>
                  <div className="text-medium-emphasis small">
                    Phòng ban
                  </div>

                  <div className="fw-semibold">
                    {project.department?.name ??
                      project.department.name ??
                      '—'}
                  </div>
                </CCol>

                <CCol xs={12} md={6}>
                  <div className="text-medium-emphasis small">
                    Quản lý dự án
                  </div>

                  <div className="fw-semibold">
                    {project.manager?.fullName ??
                      project.manager.fullName ??
                      '—'}
                  </div>
                </CCol>

                <CCol xs={12} md={6}>
                  <div className="text-medium-emphasis small">
                    Ngày bắt đầu
                  </div>

                  <div className="fw-semibold">
                    {formatDate(project.startDate)}
                  </div>
                </CCol>

                <CCol xs={12} md={6}>
                  <div className="text-medium-emphasis small">
                    Ngày kết thúc
                  </div>

                  <div className="fw-semibold">
                    {formatDate(project.endDate)}
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} lg={4}>
          <CCard className="h-100">
            <CCardBody>
              <h5 className="mb-3">
                Thống kê
              </h5>

              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-medium-emphasis">
                  Thành viên
                </span>

                <strong>{totalMembers}</strong>
              </div>

              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-medium-emphasis">
                  Tổng task
                </span>

                <strong>{totalTasks}</strong>
              </div>

              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-medium-emphasis">
                  Task hoàn thành
                </span>

                <strong>{completedTasks}</strong>
              </div>

              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-medium-emphasis">
                  Milestones
                </span>

                <strong>{totalMilestones}</strong>
              </div>

              <div className="d-flex justify-content-between py-2">
                <span className="text-medium-emphasis">
                  Milestones hoàn thành
                </span>

                <strong>{completedMilestones}</strong>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default ProjectOverview