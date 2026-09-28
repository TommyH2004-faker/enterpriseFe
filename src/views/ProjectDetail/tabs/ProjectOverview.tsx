// src/views/project-detail/tabs/ProjectOverview.tsx

import React from 'react'
import { CCard, CCardBody, CCol, CRow } from '@coreui/react'
import { useOutletContext } from 'react-router-dom'
import { ProjectDetail } from 'src/types/ProjectType/project'
import { ProjectProgress } from 'src/types/ProjectType/project-progress'
import { ProjectStatistics } from 'src/types/ProjectType/project-statistics'
import ProjectProgressCard from '../components/ProjectProgressCard'
// Xóa dòng import ProjectStats

interface ProjectDetailContext {
  project: ProjectDetail | null
  progress: ProjectProgress | null
  statistics: ProjectStatistics | null
  loading?: boolean
}

interface Props {
  project?: ProjectDetail
  progress?: ProjectProgress | null
  statistics?: ProjectStatistics | null
  loading?: boolean
}

const formatDate = (value?: string | null): string => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN')
}

const ProjectOverview: React.FC<Props> = (props) => {
  const context = useOutletContext<ProjectDetailContext | null>()

  const project = props.project || context?.project
  const progress = props.progress !== undefined ? props.progress : context?.progress || null
  const loading = props.loading ?? context?.loading ?? false

  if (loading) {
    return <div className="text-center py-5 text-body-secondary">Đang tải tổng quan dự án...</div>
  }

  if (!project) {
    return <div className="text-body-secondary py-3">Không có thông tin dự án.</div>
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Chỉ giữ lại duy nhất ProjectProgressCard */}
      <ProjectProgressCard progress={progress} loading={loading} />

      {/* ĐÃ XÓA <ProjectStats progress={progress} statistics={statistics} /> Ở ĐÂY */}

      <CRow className="g-4">
        <CCol xs={12} lg={12}>
          <CCard className="h-100 shadow-sm border-0">
            <CCardBody>
              <h5 className="mb-3 fw-bold">Thông tin chi tiết dự án</h5>

              <div className="mb-4">
                <div className="text-body-secondary small mb-1">Mô tả</div>
                <div className="p-3 bg-light rounded text-body">
                  {project.description?.trim() || 'Chưa có mô tả cho dự án này.'}
                </div>
              </div>

              <CRow className="g-4">
                <CCol xs={12} sm={6} md={3}>
                  <div className="text-body-secondary small mb-1">Phòng ban</div>
                  <div className="fw-semibold fs-6">
                    {project.department?.name || project.departmentName || '—'}
                  </div>
                </CCol>

                <CCol xs={12} sm={6} md={3}>
                  <div className="text-body-secondary small mb-1">Quản lý dự án</div>
                  <div className="fw-semibold fs-6">
                    {project.manager?.fullName || project.managerName || '—'}
                  </div>
                </CCol>

                <CCol xs={12} sm={6} md={3}>
                  <div className="text-body-secondary small mb-1">Ngày bắt đầu</div>
                  <div className="fw-semibold">{formatDate(project.startDate)}</div>
                </CCol>

                <CCol xs={12} sm={6} md={3}>
                  <div className="text-body-secondary small mb-1">Ngày kết thúc</div>
                  <div className="fw-semibold">{formatDate(project.endDate)}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default ProjectOverview