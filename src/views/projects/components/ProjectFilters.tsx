// src/views/projects/components/ProjectFilters.tsx

import React from 'react'

import {
  CCol,
  CFormSelect,
  CRow,
} from '@coreui/react'
import { ProjectFilter, ProjectOption, ProjectStatus } from 'src/types/ProjectType/project'


interface Props {
  filters: ProjectFilter

  departments: ProjectOption[]
  managers: ProjectOption[]

  onChange: (
    filters: ProjectFilter,
  ) => void
}

const ProjectFilters: React.FC<Props> = ({
  filters,
  departments,
  managers,
  onChange,
}) => {
  return (
    <CRow className="mb-3 g-2">
      <CCol md={3}>
        <CFormSelect
          value={filters.status || ''}
          onChange={(e) =>
            onChange({
              ...filters,
              page: 1,
              status:
                e.target
                  .value as ProjectStatus | '',
            })
          }
        >
          <option value="">
            Tất cả trạng thái
          </option>

          <option value="Planning">
            Planning
          </option>

          <option value="Active">
            Active
          </option>

          <option value="OnHold">
            On Hold
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Cancelled">
            Cancelled
          </option>
        </CFormSelect>
      </CCol>

      <CCol md={3}>
        <CFormSelect
          value={
            filters.departmentId || ''
          }
          onChange={(e) =>
            onChange({
              ...filters,
              page: 1,
              departmentId:
                e.target.value,
            })
          }
        >
          <option value="">
            Tất cả phòng ban
          </option>

          {departments.map(
            (department) => (
              <option
                key={department.id}
                value={department.id}
              >
                {department.name}
              </option>
            ),
          )}
        </CFormSelect>
      </CCol>

      <CCol md={3}>
        <CFormSelect
          value={
            filters.managerId || ''
          }
          onChange={(e) =>
            onChange({
              ...filters,
              page: 1,
              managerId:
                e.target.value,
            })
          }
        >
          <option value="">
            Tất cả quản lý
          </option>

          {managers.map((manager) => (
            <option
              key={manager.id}
              value={manager.id}
            >
              {manager.name}
            </option>
          ))}
        </CFormSelect>
      </CCol>

      <CCol md={3}>
        <CFormSelect
          value={`${filters.sortBy || 'CreatedAt'}:${filters.sortDirection || 'desc'}`}
          onChange={(e) => {
            const [
              sortBy,
              sortDirection,
            ] =
              e.target.value.split(':')

            onChange({
              ...filters,
              page: 1,
              sortBy,
              sortDirection:
                sortDirection as
                  | 'asc'
                  | 'desc',
            })
          }}
        >
          <option value="CreatedAt:desc">
            Mới nhất
          </option>

          <option value="Name:asc">
            Tên A → Z
          </option>

          <option value="Name:desc">
            Tên Z → A
          </option>

          <option value="EndDate:asc">
            Hạn gần nhất
          </option>
        </CFormSelect>
      </CCol>
    </CRow>
  )
}

export default ProjectFilters