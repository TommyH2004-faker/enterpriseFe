import React, { useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilPlus, cilUserFollow } from '@coreui/icons'
import EmployeeContent from './EmployeeContent'
import EmployeeModal from './EmployeeModal'
import {
  emptyEmployeeUpdateForm,
  useEmployees,
} from './useEmployees.ts'
import {
  EmployeeResponse,
  PendingAccountResponse,
  UpdateEmployeeRequest,
} from '../../types/Employee'

const suggestNextEmployeeCode = (employees: EmployeeResponse[]): string => {
  const maxNum = employees.reduce((max, emp) => {
    const match = emp.employeeCode.match(/(\d+)$/)
    if (!match) return max
    const num = parseInt(match[1], 10)
    return Number.isNaN(num) ? max : Math.max(max, num)
  }, 0)
  return `EMP${String(maxNum + 1).padStart(3, '0')}`
}

const Employees: React.FC = () => {
  const api = useEmployees()
  const [visible, setVisible] = useState(false)
  const [formData, setFormData] = useState<UpdateEmployeeRequest>(emptyEmployeeUpdateForm)
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeResponse | null>(null)

  const openModal = () => {
    setEditingEmployeeId(null)
    setFormData({
      ...emptyEmployeeUpdateForm,
      employeeCode: suggestNextEmployeeCode(api.employees),
      joinedDate: new Date().toISOString().slice(0, 10),
    })
    setVisible(true)
  }

  const openOnboardModal = (account: PendingAccountResponse) => {
    setEditingEmployeeId(null)
    setFormData({
      ...emptyEmployeeUpdateForm,
      employeeCode: suggestNextEmployeeCode(api.employees),
      fullName: account.fullName || account.username,
      email: account.email,
      joinedDate: new Date().toISOString().slice(0, 10),
    })
    setVisible(true)
  }

  const handleSelectPendingAccount = (account: PendingAccountResponse) => {
    setFormData((previous) => ({
      ...previous,
      employeeCode: previous.employeeCode.trim() || suggestNextEmployeeCode(api.employees),
      fullName: account.fullName || account.username,
      email: account.email,
      joinedDate: previous.joinedDate || new Date().toISOString().slice(0, 10),
    }))
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

      {api.pendingAccounts.length > 0 && (
        <CCard className="mb-4 border-primary shadow-sm">
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="fw-bold text-primary d-flex align-items-center">
                <CIcon icon={cilUserFollow} className="me-2" />
                Tài khoản đã tự đăng ký đang chờ duyệt vào Phòng ban ({api.pendingAccounts.length})
              </div>
              <span className="small text-muted">
                Bấm &ldquo;Duyệt &amp; Gán phòng ban&rdquo; để cấp hồ sơ nhân sự và đưa vào tổ chức
              </span>
            </div>
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Họ và tên</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Xác thực Email</th>
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {api.pendingAccounts.map((acc) => (
                    <tr key={acc.userId}>
                      <td className="fw-semibold">{acc.fullName || acc.username}</td>
                      <td>
                        <code>{acc.username}</code>
                      </td>
                      <td>{acc.email}</td>
                      <td>
                        <CBadge color={acc.isEmailVerified ? 'success' : 'warning'}>
                          {acc.isEmailVerified ? 'Đã xác thực OTP' : 'Chưa xác thực'}
                        </CBadge>
                      </td>
                      <td className="text-end">
                        <CButton
                          size="sm"
                          color="primary"
                          variant="outline"
                          onClick={() => openOnboardModal(acc)}
                        >
                          <CIcon icon={cilCheckCircle} className="me-1" />
                          Duyệt &amp; Gán phòng ban
                        </CButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CCardBody>
        </CCard>
      )}

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
        pendingAccounts={api.pendingAccounts}
        formData={formData}
        onClose={() => !api.loading && setVisible(false)}
        onSave={handleSave}
        onChange={handleChange}
        onSelectPendingAccount={handleSelectPendingAccount}
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
          <div className="small text-danger mt-2">
            Lưu ý: Khi xóa nhân viên, tài khoản đăng nhập liên kết của người dùng này cũng sẽ bị xóa khỏi hệ thống.
          </div>
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
