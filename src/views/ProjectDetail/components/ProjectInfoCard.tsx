// src/views/project-detail/components/overview/ProjectInfoCard.tsx

import React from 'react'

import {
  CCard,
  CCardBody,
  CCol,
  CRow,
} from '@coreui/react'
import { ProjectDetail } from 'src/types/ProjectType/project'


interface Props {
  project: ProjectDetail
}

const formatDate = (
  value?: string | null,
) => {
  if (!value) return '-'

  return new Date(value).toLocaleDateString(
    'vi-VN',
  )
}

const ProjectInfoCard: React.FC<Props> = ({
  project,
}) => {
  return (
    <CCard>
      <CCardBody>
        <h6 className="mb-3">
          Thông tin dự án
        </h6>

        <CRow className="g-3">
          <CCol md={6}>
            <div className="small text-body-secondary">
              Phòng ban
            </div>

            <div className="fw-semibold">
              {project.department?.name ||
                project.departmentName ||
                '-'}
            </div>
          </CCol>

          <CCol md={6}>
            <div className="small text-body-secondary">
              Quản lý
            </div>

            <div className="fw-semibold">
              {project.manager?.fullName ||
                project.managerName ||
                '-'}
            </div>
          </CCol>

          <CCol md={6}>
            <div className="small text-body-secondary">
              Ngày bắt đầu
            </div>

            <div>
              {formatDate(
                project.startDate,
              )}
            </div>
          </CCol>

          <CCol md={6}>
            <div className="small text-body-secondary">
              Ngày kết thúc
            </div>

            <div>
              {formatDate(
                project.endDate,
              )}
            </div>
          </CCol>

          <CCol md={6}>
            <div className="small text-body-secondary">
              Thành viên
            </div>

            <div>
              {project.memberCount ??
                0}
            </div>
          </CCol>

          <CCol md={6}>
            <div className="small text-body-secondary">
              Task
            </div>

            <div>
              {project.taskCount ??
                0}
            </div>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default ProjectInfoCard