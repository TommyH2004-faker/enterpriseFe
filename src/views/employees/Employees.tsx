import React, { useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import EmployeeContent from './EmployeeContent'
import EmployeeModal from './EmployeeModal'
import {
  emptyEmployeeForm,
  emptyEmployeeUpdateForm,
  useEmployees,
} from './useEmployees.ts'
import {
  EmployeeResponse,
  UpdateEmployeeRequest,
} from '../../types/Employee'

const Employees: React.FC = () => {
  const api = useEmployees()
  const [visible, setVisible] = useState(false)
  const [formData, setFormData] = useState<UpdateEmployeeRequest>(emptyEmployeeUpdateForm)
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeResponse | null>(null)

  const openModal = () => {
    setEditingEmployeeId(null)
    setFormData({ ...emptyEmployeeUpdateForm })
    setVisible(true)
  }

  const editEmployee = (employee: EmployeeResponse) => {
    setEditingEmployeeId(employee.id)
    setFormData({
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      email: employee.email,
      departmentId: employee.departmentId,
      positionId: employee.positionId,
      joinedDate: employee.joinedDate ? employee.joinedDate.slice(0, 10) : null,
      isActive: employee.isActive,
    })
    setVisible(true)
  }

  const handleChange = (
    field: keyof UpdateEmployeeRequest,
    value: string | boolean,
  ) =>
    setFormData((previous) => ({
      ...previous,
      [field]: field === 'joinedDate' && !value ? null : value,
    }))

  const handleSave = async () => {
    const saved = editingEmployeeId
      ? await api.updateEmployee(editingEmployeeId, formData)
      : await api.createEmployee(formData)
    if (saved) {
      setVisible(false)
      setEditingEmployeeId(null)
      setFormData({ ...emptyEmployeeUpdateForm })
    }
  }

  const handleDelete = async () => {
    if (!deletingEmployee) return
    const deleted = await api.deleteEmployee(deletingEmployee.id)
    if (deleted) setDeletingEmployee(null)
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold text-dark">Quản lý Nhân viên</h2>
          <div className="text-muted small">
            {api.departmentsLoading && (
              <CSpinner size="sm" className="me-2" variant="border" />
            )}
            {api.employeesLoading ? 'Đang tải dữ liệu nhân viên...' : `${api.employees.length} nhân viên`}
          </div>
        </div>
        <CButton color="primary" onClick={openModal}>
          <CIcon icon={cilPlus} className="me-2" />
          Tạo nhân viên mới
        </CButton>
      </div>

      <EmployeeContent
        employees={api.employees}
        departments={api.departments}
        positions={api.positions}
        loading={api.employeesLoading}
        search={api.search}
        departmentId={api.departmentId}
        positionId={api.positionId}
        includeInactive={api.includeInactive}
        onSearchChange={api.setSearch}
        onDepartmentChange={api.setDepartmentId}
        onPositionChange={api.setPositionId}
        onIncludeInactiveChange={api.setIncludeInactive}
        onEdit={editEmployee}
        onDelete={setDeletingEmployee}
      />

      <EmployeeModal
        visible={visible}
        isEditing={Boolean(editingEmployeeId)}
        loading={api.loading}
        departments={api.departments}
        departmentsLoading={api.departmentsLoading}
        positions={api.positions}
        positionsLoading={api.positionsLoading}
        positionsError={api.positionsError}
        formData={formData}
        onClose={() => !api.loading && setVisible(false)}
        onSave={handleSave}
        onChange={handleChange}
      />

      <CModal
        visible={Boolean(deletingEmployee)}
        onClose={() => !api.loading && setDeletingEmployee(null)}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Xóa nhân viên</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc muốn xóa nhân viên <strong>{deletingEmployee?.fullName}</strong> không?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setDeletingEmployee(null)}
            disabled={api.loading}
          >
            Hủy
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={api.loading}>
            {api.loading && <CSpinner size="sm" className="me-2" variant="border" />}
            Xóa nhân viên
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Employees
