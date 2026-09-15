import { useMemo, useState } from 'react'
import { User } from 'src/types/user'


export const useUserFilters = (
  users: User[],
) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState('all')
  const [roleFilter, setRoleFilter] =
    useState('all')

  const filteredUsers = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase()

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        user.username
          .toLowerCase()
          .includes(keyword) ||
        user.email
          .toLowerCase()
          .includes(keyword) ||
        user.fullName
          .toLowerCase()
          .includes(keyword)

      const matchesStatus =
        statusFilter === 'all' ||
        String(user.status) === statusFilter

      const matchesRole =
        roleFilter === 'all' ||
        user.roles?.some(
          (role) =>
            role.id === roleFilter,
        )

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole
      )
    })
  }, [
    users,
    search,
    statusFilter,
    roleFilter,
  ])

  return {
    search,
    setSearch,

    statusFilter,
    setStatusFilter,

    roleFilter,
    setRoleFilter,

    filteredUsers,
  }
}