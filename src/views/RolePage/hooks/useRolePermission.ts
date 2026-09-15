
import { useCallback, useEffect, useMemo, useState } from 'react'
import axiosClient from 'src/api/axiosClient'
import type { Permission } from 'src/types/permission'

interface UseRolePermissionReturn {
  permissions: Permission[]
  selectedPermissionIds: Set<string>
  loading: boolean
  saving: boolean
  error: string | null

  search: string
  setSearch: (value: string) => void

  togglePermission: (permissionId: string) => void
  toggleModule: (module: string) => void

  isModuleFullySelected: (module: string) => boolean
  isModulePartiallySelected: (module: string) => boolean

  selectAll: () => void
  clearAll: () => void

  refresh: () => Promise<void>
  save: () => Promise<boolean>
}

export const useRolePermission = (
  roleId: string | null,
): UseRolePermissionReturn => {
  const [permissions, setPermissions] = useState<Permission[]>([])

  const [selectedPermissionIds, setSelectedPermissionIds] =
    useState<Set<string>>(new Set())

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')

  /**
   * Load:
   * 1. All permissions
   * 2. Permissions assigned to current role
   */
  const fetchPermissions = useCallback(async () => {
    if (!roleId) {
      setPermissions([])
      setSelectedPermissionIds(new Set())
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [allResponse, roleResponse] = await Promise.all([
        axiosClient.get('/api/v1/permissions', {
          params: {
            pageNumber: 1,
            pageSize: 100,
            sortBy: 'Module',
            sortDescending: false,
          },
        }),

        axiosClient.get(
          `/api/v1/roles/${roleId}/permissions`,
        ),
      ])


      const allData =
        allResponse.data?.data ?? allResponse.data

      /**
       * GET /roles/{roleId}/permissions
       *
       * data:
       * [...]
       */
      const roleData =
        roleResponse.data?.data ?? roleResponse.data

      const allPermissions: Permission[] =
        allData?.items ?? []

      const rolePermissions: Permission[] =
        Array.isArray(roleData)
          ? roleData
          : []

      setPermissions(allPermissions)

      setSelectedPermissionIds(
        new Set(
          rolePermissions.map(
            (permission) => permission.id,
          ),
        ),
      )
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        'Không thể tải danh sách quyền.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }, [roleId])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  /**
   * Permissions after searching.
   */
  const filteredPermissions = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) {
      return permissions
    }

    return permissions.filter((permission) => {
      return (
        permission.code
          .toLowerCase()
          .includes(keyword) ||
        permission.module
          .toLowerCase()
          .includes(keyword) ||
        permission.action
          .toLowerCase()
          .includes(keyword) ||
        permission.displayName
          .toLowerCase()
          .includes(keyword) ||
        permission.description
          ?.toLowerCase()
          .includes(keyword)
      )
    })
  }, [permissions, search])

  /**
   * Toggle one permission.
   */
  const togglePermission = useCallback(
    (permissionId: string) => {
      setSelectedPermissionIds((current) => {
        const next = new Set(current)

        if (next.has(permissionId)) {
          next.delete(permissionId)
        } else {
          next.add(permissionId)
        }

        return next
      })
    },
    [],
  )

  /**
   * Get permissions belonging to one module.
   */
  const getModulePermissions = useCallback(
    (module: string) => {
      return permissions.filter(
        (permission) =>
          permission.module === module,
      )
    },
    [permissions],
  )

  /**
   * Check if all permissions in module
   * are selected.
   */
  const isModuleFullySelected = useCallback(
    (module: string) => {
      const modulePermissions =
        getModulePermissions(module)

      if (modulePermissions.length === 0) {
        return false
      }

      return modulePermissions.every(
        (permission) =>
          selectedPermissionIds.has(
            permission.id,
          ),
      )
    },
    [
      getModulePermissions,
      selectedPermissionIds,
    ],
  )

  /**
   * Check if some but not all permissions
   * in module are selected.
   */
  const isModulePartiallySelected = useCallback(
    (module: string) => {
      const modulePermissions =
        getModulePermissions(module)

      const selectedCount =
        modulePermissions.filter(
          (permission) =>
            selectedPermissionIds.has(
              permission.id,
            ),
        ).length

      return (
        selectedCount > 0 &&
        selectedCount < modulePermissions.length
      )
    },
    [
      getModulePermissions,
      selectedPermissionIds,
    ],
  )

  /**
   * Select / unselect all permissions
   * belonging to a module.
   */
  const toggleModule = useCallback(
    (module: string) => {
      const modulePermissions =
        getModulePermissions(module)

      setSelectedPermissionIds((current) => {
        const next = new Set(current)

        const allSelected =
          modulePermissions.every(
            (permission) =>
              next.has(permission.id),
          )

        if (allSelected) {
          modulePermissions.forEach(
            (permission) => {
              next.delete(permission.id)
            },
          )
        } else {
          modulePermissions.forEach(
            (permission) => {
              next.add(permission.id)
            },
          )
        }

        return next
      })
    },
    [getModulePermissions],
  )

  /**
   * Select all permissions.
   */
  const selectAll = useCallback(() => {
    setSelectedPermissionIds(
      new Set(
        permissions.map(
          (permission) => permission.id,
        ),
      ),
    )
  }, [permissions])

  /**
   * Remove all permissions.
   */
  const clearAll = useCallback(() => {
    setSelectedPermissionIds(new Set())
  }, [])

  /**
   * Save selected permissions.
   *
   * NOTE:
   * Backend must provide:
   *
   * PUT /api/v1/roles/{roleId}/permissions
   *
   * {
   *   permissionIds: [...]
   * }
   */
  const save = useCallback(async () => {
    if (!roleId) {
      return false
    }

    try {
      setSaving(true)
      setError(null)

      await axiosClient.put(
        `/api/v1/roles/${roleId}/permissions`,
        {
          permissionIds: Array.from(
            selectedPermissionIds,
          ),
        },
      )

      return true
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        'Không thể lưu phân quyền.'

      setError(message)

      return false
    } finally {
      setSaving(false)
    }
  }, [roleId, selectedPermissionIds])

  return {
    permissions: filteredPermissions,
    selectedPermissionIds,
    loading,
    saving,
    error,

    search,
    setSearch,

    togglePermission,
    toggleModule,

    isModuleFullySelected,
    isModulePartiallySelected,

    selectAll,
    clearAll,

    refresh: fetchPermissions,
    save,
  }
}

