import { useCallback, useEffect, useState } from 'react'
import axiosClient from 'src/api/axiosClient'
import { User, UserPermissionsResponse } from 'src/types/user'


export const useUser = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosClient.get('/users')

      const data = response.data?.data ?? response.data

      setUsers(
        data?.items ??
        data ??
        []
      )
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
        'Không thể tải danh sách người dùng'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])
const getAllRoles = async () => {
  const response = await axiosClient.get('/api/v1/roles', {
    params: {
      pageNumber: 1,
      pageSize: 100,
    },
  })

  return response.data?.data?.items ?? []
}

const getAllPermissions = async () => {
  const response = await axiosClient.get('/api/v1/permissions', {
    params: {
      pageNumber: 1,
      pageSize: 100,
    },
  })

  return response.data?.data?.items ?? []
}
  const getUserPermissions = async (
    userId: string,
  ): Promise<UserPermissionsResponse> => {
    const response = await axiosClient.get(
      `api/users/${userId}/permissions`,
    )

    return response.data?.data ?? response.data
  }

  const createUser = async (data: any) => {
    const response = await axiosClient.post(
      '/users',
      data,
    )

    await fetchUsers()

    return response.data
  }

  const updateUserAccess = async (
    userId: string,
    data: any,
  ) => {
    const response = await axiosClient.put(
      `api/users/${userId}/access`,
      data,
    )

    await fetchUsers()

    return response.data
  }

  const deleteUser = async (
    userId: string,
  ) => {
    await axiosClient.delete(`/users/${userId}`)

    setUsers((prev) =>
      prev.filter((x) => x.id !== userId),
    )
  }

  return {
    users,
    loading,
    error,
    createUser,
    updateUserAccess,
    deleteUser,
    getUserPermissions,
    getAllRoles,
    getAllPermissions,
    refreshUsers: fetchUsers,
  }
}