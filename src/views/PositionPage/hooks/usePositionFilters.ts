import { useMemo, useState } from 'react'
import { Position } from 'src/types/position'

export const usePositionFilters = (positions: Position[]) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredPositions = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return (positions ?? [])
      .filter((position): position is Position => Boolean(position))
      .filter((position) => {
        const matchesSearch =
          !keyword ||
          (position.code ?? '').toLowerCase().includes(keyword) ||
          (position.name ?? '').toLowerCase().includes(keyword) ||
          (position.description ?? '').toLowerCase().includes(keyword)

        const matchesStatus =
          !statusFilter ||
          (statusFilter === 'active'
            ? position.isActive === true
            : position.isActive === false)

        return matchesSearch && matchesStatus
      })
  }, [positions, search, statusFilter])

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredPositions,
  }
}