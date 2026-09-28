
// src/views/projects/components/ProjectCreateDrawer.tsx

import React from 'react'

import {
  CButton,
  CFormCheck,
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

import { EmployeeResponse } from 'src/types/Employee'

interface Props {
  visible: boolean

  code: string
  name: string
  description: string

  departmentId: string
  managerId: string

  // Thành viên được chọn
  memberIds: string[]

  // Tất cả nhân viên đang hoạt động
  // Có thể thuộc bất kỳ phòng ban nào
  projectMembers: EmployeeResponse[]

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

  onMemberIdsChange: (
    memberIds: string[],
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
  memberIds,
  projectMembers,
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
  onMemberIdsChange,
  onStartDateChange,
  onEndDateChange,
  onPriorityChange,
}) => {
  const handleMemberChange = (
    memberId: string,
    checked: boolean,
  ) => {
    if (checked) {
      if (!memberIds.includes(memberId)) {
        onMemberIdsChange([
          ...memberIds,
          memberId,
        ])
      }

      return
    }

    onMemberIdsChange(
      memberIds.filter(
        (id) => id !== memberId,
      ),
    )
  }

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
        {/* =========================
            MÃ DỰ ÁN
        ========================== */}
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

        {/* =========================
            TÊN DỰ ÁN
        ========================== */}
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

        {/* =========================
            MÔ TẢ
        ========================== */}
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

        {/* =========================
            PHÒNG BAN
        ========================== */}
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

        {/* =========================
            QUẢN LÝ DỰ ÁN
        ========================== */}
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
            disabled={!departmentId}
          >
            <option value="">
              {departmentId
                ? 'Chọn quản lý'
                : 'Vui lòng chọn phòng ban trước'}
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

        {/* =========================
            THÀNH VIÊN DỰ ÁN
        ========================== */}
        <div className="mb-3">
          <CFormLabel>
            Thành viên dự án
          </CFormLabel>

          {projectMembers.length === 0 ? (
            <div className="border rounded p-3 text-body-secondary small">
              Không có nhân viên đang hoạt động.
            </div>
          ) : (
            <div
              className="border rounded p-2"
              style={{
                maxHeight: '220px',
                overflowY: 'auto',
              }}
            >
              {projectMembers.map(
                (employee) => {
                  const employeeId =
                    employee.userId

                  const checked =
                    memberIds.includes(
                      employeeId,
                    )

                  return (
                    <div
                      key={employeeId}
                      className="border-bottom py-2"
                    >
                      <CFormCheck
                        id={`project-member-${employeeId}`}
                        checked={checked}
                        onChange={(e) =>
                          handleMemberChange(
                            employeeId,
                            e.target.checked,
                          )
                        }
                        label={
                          <div>
                            <div className="fw-semibold">
                              {
                                employee.fullName
                              }
                            </div>

                            <div className="text-body-secondary small">
                              {
                                employee.positionName
                              }

                              {' · '}

                              {
                                employee.departmentName
                              }
                            </div>
                          </div>
                        }
                      />
                    </div>
                  )
                },
              )}
            </div>
          )}

          {projectMembers.length > 0 && (
            <div className="text-body-secondary small mt-1">
              Đã chọn {memberIds.length}/
              {projectMembers.length} thành viên
            </div>
          )}
        </div>

        {/* =========================
            NGÀY
        ========================== */}
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

        {/* =========================
            ĐỘ ƯU TIÊN
        ========================== */}
        <div className="mb-4">
          <CFormLabel>
            Độ ưu tiên
          </CFormLabel>

          <CFormSelect
            value={priority}
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

        {/* =========================
            ACTIONS
        ========================== */}
        <div className="d-flex justify-content-end gap-2">
          <CButton
            color="light"
            onClick={onClose}
            disabled={loading}
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

