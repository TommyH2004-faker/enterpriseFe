// src/views/projects/hooks/useProjects.ts

import { useCallback, useEffect, useState } from 'react'
import { projectService } from 'src/services/projectService'
import { ProjectFilters, ProjectListData } from 'src/types/ProjectType/project'

const EMPTY_DATA: ProjectListData = {
  items: [],
  page: 1,
  pageSize: 12,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
}

export const useProjects = (filters: ProjectFilters) => {
  const [data, setData] = useState<ProjectListData>(EMPTY_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent === true
      try {
        if (!silent) {
          setLoading(true)
        }
        setError(null)

        const result = await projectService.getProjects(filters)
        setData(result)
      } catch (err: any) {
        if (!silent) {
          setError(err?.response?.data?.message || 'Không thể tải danh sách dự án.')
        }
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [filters],
  )

  const silentRefetch = useCallback(async () => {
    await fetchProjects({ silent: true })
  }, [fetchProjects])

  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  return {
    data,
    loading,
    error,
    refetch: fetchProjects,
    silentRefetch,
  }
}
