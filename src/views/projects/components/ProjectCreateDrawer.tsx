// src/views/projects/components/ProjectCreateDrawer.tsx

import React from 'react'

import {
  CButton,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from '@coreui/react'

import {
  ProjectOption,
  ProjectPriorityLabel,
} from 'src/types/ProjectType/project'

interface Props {
  visible: boolean

  code: string
  name: string
  description: string
  departmentId: string
  managerId: string
  startDate: string
  endDate: string
  priority: ProjectPriorityLabel

  departments: ProjectOption[]
  managers: ProjectOption[]

  errors: Record<string, string>

  loading?: boolean

  onClose: () => void
  onSubmit: () => void

  onCodeChange: (
    value: string,
  ) => void

  onNameChange: (
    value: string,
  ) => void

  onDescriptionChange: (
    value: string,
  ) => void

  onDepartmentChange: (
    value: string,
  ) => void

  onManagerChange: (
    value: string,
  ) => void

  onStartDateChange: (
    value: string,
  ) => void

  onEndDateChange: (
    value: string,
  ) => void

  onPriorityChange: (
    value: ProjectPriorityLabel,
  ) => void
}

const ProjectCreateDrawer: React.FC<Props> = ({
  visible,

  code,
  name,
  description,
  departmentId,
  managerId,
  startDate,
  endDate,
  priority,

  departments,
  managers,

  errors,

  loading,

  onClose,
  onSubmit,

  onCodeChange,
  onNameChange,
  onDescriptionChange,
  onDepartmentChange,
  onManagerChange,
  onStartDateChange,
  onEndDateChange,
  onPriorityChange,
}) => {
  return (
    <COffcanvas
      placement="end"
      visible={visible}
      onHide={onClose}
    >
      <COffcanvasHeader>
        <COffcanvasTitle>
          Tạo dự án
        </COffcanvasTitle>
      </COffcanvasHeader>

      <COffcanvasBody>
        <div className="mb-3">
          <CFormLabel>
            Mã dự án
          </CFormLabel>

          <CFormInput
            value={code}
            onChange={(e) =>
              onCodeChange(
                e.target.value,
              )
            }
            placeholder="VD: PJ-001"
            invalid={!!errors.code}
          />

          {errors.code && (
            <div className="text-danger small mt-1">
              {errors.code}
            </div>
          )}
        </div>

        <div className="mb-3">
          <CFormLabel>
            Tên dự án
          </CFormLabel>

          <CFormInput
            value={name}
            onChange={(e) =>
              onNameChange(
                e.target.value,
              )
            }
            invalid={!!errors.name}
          />

          {errors.name && (
            <div className="text-danger small mt-1">
              {errors.name}
            </div>
          )}
        </div>

        <div className="mb-3">
          <CFormLabel>
            Mô tả
          </CFormLabel>

          <CFormTextarea
            rows={4}
            value={description}
            onChange={(e) =>
              onDescriptionChange(
                e.target.value,
              )
            }
          />
        </div>

        <div className="mb-3">
          <CFormLabel>
            Phòng ban
          </CFormLabel>

          <CFormSelect
            value={departmentId}
            onChange={(e) =>
              onDepartmentChange(
                e.target.value,
              )
            }
            invalid={
              !!errors.departmentId
            }
          >
            <option value="">
              Chọn phòng ban
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

          {errors.departmentId && (
            <div className="text-danger small mt-1">
              {errors.departmentId}
            </div>
          )}
        </div>

        <div className="mb-3">
          <CFormLabel>
            Quản lý dự án
          </CFormLabel>

          <CFormSelect
            value={managerId}
            onChange={(e) =>
              onManagerChange(
                e.target.value,
              )
            }
            invalid={
              !!errors.managerId
            }
          >
            <option value="">
              Chọn quản lý
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

          {errors.managerId && (
            <div className="text-danger small mt-1">
              {errors.managerId}
            </div>
          )}
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <CFormLabel>
              Ngày bắt đầu
            </CFormLabel>

            <CFormInput
              type="date"
              value={startDate}
              onChange={(e) =>
                onStartDateChange(
                  e.target.value,
                )
              }
            />
          </div>

          <div className="col-md-6">
            <CFormLabel>
              Ngày kết thúc
            </CFormLabel>

            <CFormInput
              type="date"
              value={endDate}
              onChange={(e) =>
                onEndDateChange(
                  e.target.value,
                )
              }
              invalid={
                !!errors.endDate
              }
            />

            {errors.endDate && (
              <div className="text-danger small mt-1">
                {errors.endDate}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <CFormLabel>
            Độ ưu tiên
          </CFormLabel>

          <CFormSelect
            value={priority}
            onChange={(e) =>
              onPriorityChange(
                e.target
                  .value as ProjectPriorityLabel,
              )
            }
          >
            <option value="Low">
              Low
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="High">
              High
            </option>

            <option value="Critical">
              Critical
            </option>
          </CFormSelect>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <CButton
            color="light"
            onClick={onClose}
          >
            Hủy
          </CButton>

          <CButton
            color="primary"
            disabled={loading}
            onClick={onSubmit}
          >
            {loading
              ? 'Đang tạo...'
              : 'Tạo dự án'}
          </CButton>
        </div>
      </COffcanvasBody>
    </COffcanvas>
  )
}

export default ProjectCreateDrawer