import React from 'react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormSwitch,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'
import { DepartmentResponse } from '../../types/Department'
import { UpdateEmployeeRequest, PositionResponse } from '../../types/Employee'

interface Props {
  visible: boolean
  isEditing: boolean
  loading: boolean
  departments: DepartmentResponse[]
  departmentsLoading: boolean
  positions: PositionResponse[]
  positionsLoading: boolean
  positionsError: string
  formData: UpdateEmployeeRequest
  onClose: () => void
  onSave: () => void
  onChange: (field: keyof UpdateEmployeeRequest, value: string | boolean) => void
}

const EmployeeModal: React.FC<Props> = ({
  visible,
  isEditing,
  loading,
  departments,
  departmentsLoading,
  positions,
  positionsLoading,
  positionsError,
  formData,
  onClose,
  onSave,
  onChange,
}) => (
  <CModal
    visible={visible}
    onClose={onClose}
    alignment="center"
    size="lg"
  >
    <CModalHeader>
      <CModalTitle>{isEditing ? 'Sửa thông tin nhân viên' : 'Tạo nhân viên mới'}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm>
        <CRow>
          <CCol md={6} className="mb-3">
            <CFormLabel>
              Mã nhân viên <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              value={formData.employeeCode}
              placeholder="VD: EMP001"
              onChange={(event) => onChange('employeeCode', event.target.value)}
            />
          </CCol>
          <CCol md={6} className="mb-3">
            <CFormLabel>
              Họ và tên <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              value={formData.fullName}
              placeholder="VD: Nguyễn Văn A"
              readOnly={isEditing}
              disabled={isEditing}
              onChange={(event) => onChange('fullName', event.target.value)}
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol md={6} className="mb-3">
            <CFormLabel>
              Email <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              type="email"
              value={formData.email}
              placeholder="VD: email@company.com"
              onChange={(event) => onChange('email', event.target.value)}
            />
          </CCol>
          <CCol md={6} className="mb-3">
            <CFormLabel>Ngày tham gia</CFormLabel>
            <CFormInput
              type="date"
              value={formData.joinedDate ?? ''}
              onChange={(event) => onChange('joinedDate', event.target.value)}
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol md={6} className="mb-3">
            <CFormLabel>
              Phòng ban <span className="text-danger">*</span>
            </CFormLabel>
            <CFormSelect
              value={formData.departmentId}
              disabled={departmentsLoading}
              onChange={(event) => onChange('departmentId', event.target.value)}
            >
              <option value="">
                {departmentsLoading ? 'Đang tải phòng ban...' : 'Chọn phòng ban'}
              </option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name} ({department.code})
                </option>
              ))}
            </CFormSelect>
            {!departmentsLoading && !departments.length && (
              <div className="small text-danger mt-1">
                Chưa có phòng ban đang hoạt động.
              </div>
            )}
          </CCol>
          <CCol md={6} className="mb-3">
            <CFormLabel>
              Chức vụ <span className="text-danger">*</span>
            </CFormLabel>
            <CFormSelect
              value={formData.positionId}
              disabled={positionsLoading}
              onChange={(event) => onChange('positionId', event.target.value)}
            >
              <option value="">
                {positionsLoading ? 'Đang tải chức vụ...' : 'Chọn chức vụ'}
              </option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.name} ({position.code})
                </option>
              ))}
            </CFormSelect>
            {!positionsLoading && !positions.length && (
              <div className="small text-danger mt-1">
                {positionsError || 'Chưa có chức vụ đang hoạt động.'}
              </div>
            )}
          </CCol>
        </CRow>
        {isEditing && (
          <CFormSwitch
            className="mb-3"
            label={formData.isActive ? 'Tài khoản đang hoạt động' : 'Tài khoản đã khóa'}
            checked={formData.isActive}
            onChange={(event) => onChange('isActive', event.target.checked)}
          />
        )}
      </CForm>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" onClick={onClose} disabled={loading}>
        Hủy
      </CButton>
      <CButton color="primary" onClick={onSave} disabled={loading}>
        {loading && <CSpinner size="sm" className="me-2" variant="border" />}
        {isEditing ? 'Lưu thay đổi' : 'Tạo nhân viên'}
      </CButton>
    </CModalFooter>
  </CModal>
)

export default EmployeeModal
