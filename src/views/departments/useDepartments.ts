import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { departmentService } from '../../services/departmentService'
import {
  CreateDepartmentRequest,
  DepartmentResponse,
  PaginationData,
  UpdateDepartmentRequest,
} from '../../types/Department'

const initialPagination: PaginationData = {
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: true,
}

const confirmDelete = (message: string): Promise<boolean> =>
  new Promise((resolve) => {
    const toastId = toast.custom(() =>
      React.createElement(
        'div',
        {
          style: {
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 16px',
          background: '#fff',
          color: '#212529',
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        React.createElement('span', null, message),
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'btn btn-sm btn-light',
            onClick: () => {
              toast.dismiss(toastId)
              resolve(false)
            },
          },
          'Hủy',
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'btn btn-sm btn-danger text-white',
            onClick: () => {
              toast.dismiss(toastId)
              resolve(true)
            },
          },
          'Xóa',
        ),
      ),
      { duration: Infinity },
    )
  })

export const useDepartments = () => {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([])
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [sortBy, setSortBy] = useState('Name')
  const [sortDescending, setSortDescending] = useState(false)
  const [sortOption, setSortOption] = useState('name-asc')

  const fetchDepartments = useCallback(
    async (
      pageNumber = 1,
      pageSize = pagination.pageSize,
      currentSortBy = sortBy,
      currentSortDescending = sortDescending,
    ) => {
      try {
        setLoading(true)
        const data = await departmentService.getAllDepartments(pageNumber, pageSize, {
          name: searchName || undefined,
          sortBy: currentSortBy,
          sortDescending: currentSortDescending,
        })
        setDepartments(data.items)
        setPagination({
          pageNumber: data.pageNumber,
          pageSize: data.pageSize,
          totalCount: data.totalCount,
          totalPages: data.totalPages,
          hasPreviousPage: data.hasPreviousPage,
          hasNextPage: data.hasNextPage,
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Lỗi tải dữ liệu')
      } finally {
        setLoading(false)
      }
    },
    [pagination.pageSize, searchName, sortBy, sortDescending],
  )

  useEffect(() => {
    fetchDepartments(1, 10)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchDepartments(1, pagination.pageSize), 300)
    return () => clearTimeout(timer)
  }, [searchName])

  const handleSortChange = (value: string) => {
    const options: Record<string, [string, boolean]> = {
      'name-asc': ['Name', false],
      'name-desc': ['Name', true],
      'code-asc': ['Code', false],
      'code-desc': ['Code', true],
      'date-new': ['CreatedAt', true],
      'date-old': ['CreatedAt', false],
    }
    const [nextSortBy, nextDescending] = options[value] || options['name-asc']
    setSortOption(value)
    setSortBy(nextSortBy)
    setSortDescending(nextDescending)
    fetchDepartments(1, pagination.pageSize, nextSortBy, nextDescending)
  }

  const saveDepartment = async (
    formData: CreateDepartmentRequest,
    editDept: DepartmentResponse | null,
  ) => {
    if (!formData.code.trim()) {
      toast.error('Mã phòng ban không được để trống')
      return false
    }
    if (!formData.name.trim()) {
      toast.error('Tên phòng ban không được để trống')
      return false
    }
    if (formData.isActive === null) {
      toast.error('Vui lòng chọn trạng thái phòng ban')
      return false
    }

    try {
      setLoading(true)
      if (editDept) {
        const request: UpdateDepartmentRequest = {
          code: formData.code,
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        }
        await departmentService.updateDepartment(editDept.id, request)
        toast.success('Cập nhật phòng ban thành công')
      } else {
        const request: CreateDepartmentRequest = {
          code: formData.code,
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        }
        await departmentService.createDepartment(request)
        toast.success('Tạo phòng ban thành công')
      }
      await fetchDepartments(pagination.pageNumber, pagination.pageSize)
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi lưu dữ liệu')
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteDepartment = async (id: string) => {
    if (!(await confirmDelete('Bạn có chắc chắn muốn xóa phòng ban này?'))) return

    try {
      setLoading(true)
      await departmentService.deleteDepartment(id)
      toast.success('Xóa phòng ban thành công')
      await fetchDepartments(pagination.pageNumber, pagination.pageSize)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xóa dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const deleteSelected = async (selectedIds: Set<string>) => {
    if (!selectedIds.size) return
    if (!(await confirmDelete(`Bạn có chắc chắn muốn xóa ${selectedIds.size} phòng ban?`))) {
      return
    }

    try {
      setLoading(true)
      for (const id of selectedIds) {
        await departmentService.deleteDepartment(id)
      }
      toast.success(`Đã xóa ${selectedIds.size} phòng ban`)
      await fetchDepartments(1, pagination.pageSize)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xóa dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  return {
    departments,
    pagination,
    loading,
    searchName,
    sortOption,
    setSearchName,
    handleSortChange,
    fetchDepartments,
    saveDepartment,
    deleteDepartment,
    deleteSelected,
  }
}
