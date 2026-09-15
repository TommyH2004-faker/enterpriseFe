import { useCallback, useEffect, useState } from 'react'
import roleService from 'src/services/roleService'
import type { Role, RoleListResponse } from 'src/types/role'
import { ROLE_DEFAULTS } from '../contants/RoleConstants'


export interface UseRoleDataReturn {
  roles: Role[]
  loading: boolean
  error: string | null
  pagination: RoleListResponse | null
  pageNumber: number
  pageSize: number
  search: string
  sortBy: string
  sortDescending: boolean
  totalRoles: number

  // Actions
  setPageNumber: (page: number) => void
  setSearch: (search: string) => void
  setSortBy: (field: string) => void
  setSortDescending: (descending: boolean) => void
  handleSort: (field: string) => void
  handleSearchChange: (value: string) => void
  loadRoles: () => Promise<void>
  clearError: () => void
}

/**
 * Hook để quản lý data loading, pagination, search, sort
 *
 * FIX APPLIED:
 * - Added explicit <boolean>, <number>, <string> generics to useState
 * - This prevents TypeScript from inferring literal types (false, 1, "DisplayName")
 * - Now allows type assignments in handlers properly
 */
export const useRoleData = (): UseRoleDataReturn => {
  // =========================================================
  // STATE
  // =========================================================

  // ✅ Explicit generic types prevent literal type inference
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<RoleListResponse | null>(null)

  const [pageNumber, setPageNumber] = useState<number>(ROLE_DEFAULTS.PAGE_NUMBER)
  const [pageSize] = useState<number>(ROLE_DEFAULTS.PAGE_SIZE)
  const [search, setSearch] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>(ROLE_DEFAULTS.SORT_BY)
  const [sortDescending, setSortDescending] = useState<boolean>(ROLE_DEFAULTS.SORT_DESCENDING)

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await roleService.getAll({
        pageNumber,
        pageSize,
        search: search.trim() || undefined,
        sortBy,
        sortDescending,
      })

      setRoles(result.items)
      setPagination(result)
    } catch (err: any) {
      console.error('Failed to load roles:', err)

      const message =
        err?.response?.data?.message ||
        'Không thể tải danh sách vai trò.'

      setError(message)
      setRoles([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [pageNumber, pageSize, search, sortBy, sortDescending])

  // =========================================================
  // EFFECTS
  // =========================================================

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  // =========================================================
  // HANDLERS
  // =========================================================

  // ✅ Now setSortDescending accepts boolean (not just literal false)
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDescending((prev) => !prev)
    } else {
      // ✅ Now setSortBy accepts any string (not just literal "DisplayName")
      setSortBy(field)
      // ✅ Now setSortDescending accepts boolean
      setSortDescending(false)
    }
    setPageNumber(ROLE_DEFAULTS.PAGE_NUMBER)
  }

  // ✅ Now setSearch accepts any string
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPageNumber(ROLE_DEFAULTS.PAGE_NUMBER)
  }

  const clearError = () => {
    setError(null)
  }

  // =========================================================
  // RETURN
  // =========================================================

  return {
    roles,
    loading,
    error,
    pagination,
    pageNumber,
    pageSize,
    search,
    sortBy,
    sortDescending,
    totalRoles: pagination?.totalCount ?? 0,

    setPageNumber,
    setSearch,
    setSortBy,
    setSortDescending,
    handleSort,
    handleSearchChange,
    loadRoles,
    clearError,
  }
}