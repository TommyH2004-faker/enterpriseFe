import { useCallback, useEffect, useState } from 'react'
import axiosClient from 'src/api/axiosClient'
import { Permission, PermissionForm } from 'src/types/permission'

export const usePermission = () => {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)

  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [search, setSearch] = useState('')

 const fetchPermissions = useCallback(async () => {
  try {
    setLoading(true)
    setError(null)

    console.log('Fetching permissions:', {
      pageNumber,
      pageSize,
      search,
    })

    const response = await axiosClient.get(
      '/api/v1/permissions',
      {
        params: {
          pageNumber: pageNumber,
          pageSize: pageSize,
          search: search || undefined,
          sortBy: 'Module',
          sortDescending: false,
        },
      },
    )

    const data = response.data?.data ?? response.data

    console.log('Permission response:', data)

    setPermissions(data?.items ?? [])
    setTotalCount(data?.totalCount ?? 0)
    setTotalPages(data?.totalPages ?? 0)
  } catch (err: any) {
    setError(
      err?.response?.data?.message ??
        'Không thể tải danh sách permission',
    )
  } finally {
    setLoading(false)
  }
}, [pageNumber, pageSize, search])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const createPermission = async (data: PermissionForm) => {
    const response = await axiosClient.post(
      '/api/v1/permissions',
      data,
    )
   

    await fetchPermissions()

    return response.data
  }

  const updatePermission = async (
    id: string,
    data: PermissionForm,
  ) => {
    const response = await axiosClient.put(
      `/api/v1/permissions/${id}`,
      data,
    )

    await fetchPermissions()

    return response.data
  }

  const deletePermission = async (id: string) => {
    await axiosClient.delete(
      `/api/v1/permissions/${id}`,
    )

    setPermissions((prev) =>
      prev.filter((permission) => permission.id !== id),
    )

    setTotalCount((prev) => Math.max(0, prev - 1))
  }

  return {
    permissions,
    loading,
    error,

    pageNumber,
    pageSize,
    totalCount,
    totalPages,

    search,
    setSearch,
    setPageNumber,

    createPermission,
    updatePermission,
    deletePermission,

    refreshPermissions: fetchPermissions,
  }
}