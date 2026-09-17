// src/views/projects/components/ProjectEditDrawer.tsx

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
import { ProjectPriority, ProjectPriorityLabel } from 'src/types/ProjectType/project'


interface Props {
  visible: boolean

  projectCode: string

  name: string
  description: string
  startDate: string
  endDate: string
  priority: ProjectPriorityLabel

  errors: Record<string, string>

  loading?: boolean

  onClose: () => void
  onSubmit: () => void

  onNameChange: (
    value: string,
  ) => void

  onDescriptionChange: (
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

const ProjectEditDrawer: React.FC<Props> = ({
  visible,

  projectCode,

  name,
  description,
  startDate,
  endDate,
  priority,

  errors,

  loading,

  onClose,
  onSubmit,

  onNameChange,
  onDescriptionChange,
  onStartDateChange,
  onEndDateChange,
  onPriorityChange,
}) => {
  return (
    <COffcanvas placement="end" 
    visible={visible} 
    onHide={onClose} >
    <COffcanvasHeader>
        <COffcanvasTitle>
        Chỉnh sửa dự án
        </COffcanvasTitle>
    </COffcanvasHeader>

    <COffcanvasBody>
        <div className="mb-3">
        <CFormLabel>
            Mã dự án
        </CFormLabel>

          <CFormInput
            value={projectCode}
            disabled
          />

          <div className="small text-body-secondary mt-1">
            Mã dự án không thể thay đổi
            trong chỉnh sửa thông tin.
          </div>
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
            rows={5}
            value={description}
            onChange={(e) =>
              onDescriptionChange(
                e.target.value,
              )
            }
          />
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
            value={String(priority)}
            onChange={(e) =>
              onPriorityChange(
                e.target.value as ProjectPriorityLabel,
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
              ? 'Đang lưu...'
              : 'Lưu thay đổi'}
          </CButton>
        </div>
      </COffcanvasBody>
    </COffcanvas>
  )
}

export default ProjectEditDrawer