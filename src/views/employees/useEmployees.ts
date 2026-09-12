import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { departmentService } from '../../services/departmentService'
import { employeeService } from '../../services/employeeService'
import { DepartmentResponse } from '../../types/Department'
import {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  EmployeeResponse,
  PositionResponse,
  UpdateEmployeeRequest,
} from '../../types/Employee'

export const emptyEmployeeForm: CreateEmployeeRequest = {
  employeeCode: '',
  fullName: '',
  email: '',
  departmentId: '',
  positionId: '',
  joinedDate: null,
}

export const emptyEmployeeUpdateForm: UpdateEmployeeRequest = {
  ...emptyEmployeeForm,
  isActive: true,
}

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as {
      response?: {
        data?: {
          message?: string
          title?: string
          errorCode?: string
          errors?: Record<string, string[]>
        }
      }
    }).response
    const data = response?.data
    if (data?.message) return data.message
    if (data?.title) return data.title
    if (data?.errors) {
      return Object.values(data.errors).flat().join(', ')
    }
    if (data?.errorCode) return data.errorCode
  }
  return error instanceof Error ? error.message : 'Không thể thực hiện thao tác'
}

export const useEmployees = () => {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([])
  const [positions, setPositions] = useState<PositionResponse[]>([])
  const [employees, setEmployees] = useState<EmployeeResponse[]>([])
  const [departmentsLoading, setDepartmentsLoading] = useState(false)
  const [positionsLoading, setPositionsLoading] = useState(false)
  const [positionsError, setPositionsError] = useState('')
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [positionId, setPositionId] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)

  const loadEmployees = useCallback(async () => {
    try {
      setEmployeesLoading(true)
      const data = await employeeService.getEmployees({
        search: search || undefined,
        departmentId: departmentId || undefined,
        positionId: positionId || undefined,
        includeInactive,
      })
      setEmployees(data)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setEmployeesLoading(false)
    }
  }, [departmentId, includeInactive, positionId, search])

  const loadDepartments = useCallback(async () => {
    try {
      setDepartmentsLoading(true)
      const response = await departmentService.getAllDepartments(1, 100, {
        sortBy: 'Name',
        sortDescending: false,
      })
      setDepartments(response.items.filter((department) => department.isActive))
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setDepartmentsLoading(false)
    }
  }, [])

  const loadPositions = useCallback(async () => {
    try {
      setPositionsLoading(true)
      setPositionsError('')
      setPositions(await employeeService.getPositions())
    } catch (error) {
      const message = getErrorMessage(error)
      setPositionsError(message)
      toast.error(`Không tải được danh sách chức vụ: ${message}`)
    } finally {
      setPositionsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadEmployees()
  }, [loadEmployees])

  useEffect(() => {
    void Promise.all([loadDepartments(), loadPositions()])
  }, [loadDepartments, loadPositions])

  const createEmployee = async (
    formData: CreateEmployeeRequest,
  ): Promise<CreateEmployeeResponse | null> => {
    const requiredFields: Array<keyof CreateEmployeeRequest> = [
      'employeeCode',
      'fullName',
      'email',
      'departmentId',
      'positionId',
    ]

    if (requiredFields.some((field) => !formData[field].trim())) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return null
    }

    try {
      setLoading(true)
      const response = await employeeService.createEmployee({
        employeeCode: formData.employeeCode.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        departmentId: formData.departmentId,
        positionId: formData.positionId,
        joinedDate: formData.joinedDate || null,
      })
      toast.success(
        response.message ||
          'Tạo nhân viên thành công. Tài khoản và mật khẩu sẽ được gửi qua email.',
      )
      await loadEmployees()
      return response.data
    } catch (error) {
      toast.error(getErrorMessage(error))
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateEmployee = async (
    id: string,
    formData: UpdateEmployeeRequest,
  ): Promise<boolean> => {
    const requiredFields: Array<keyof CreateEmployeeRequest> = [
      'employeeCode',
      'fullName',
      'email',
      'departmentId',
      'positionId',
    ]

    if (requiredFields.some((field) => !formData[field].trim())) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return false
    }

    try {
      setLoading(true)
      const response = await employeeService.updateEmployee(id, {
        employeeCode: formData.employeeCode.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        departmentId: formData.departmentId,
        positionId: formData.positionId,
        joinedDate: formData.joinedDate || null,
        isActive: formData.isActive,
      })
      toast.success(response.message || 'Cập nhật nhân viên thành công')
      await loadEmployees()
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteEmployee = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await employeeService.deleteEmployee(id)
      toast.success(response.message || 'Xóa nhân viên thành công')
      await loadEmployees()
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    departments,
    positions,
    employees,
    departmentsLoading,
    positionsLoading,
    positionsError,
    employeesLoading,
    loading,
    search,
    departmentId,
    positionId,
    includeInactive,
    loadEmployees,
    setSearch,
    setDepartmentId,
    setPositionId,
    setIncludeInactive,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  }
}
