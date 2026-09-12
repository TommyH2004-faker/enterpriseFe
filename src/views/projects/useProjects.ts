import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getProjectErrorMessage, projectService } from '../../services/projectService'
import { ProjectFilters, ProjectListData, ProjectSummary } from '../../types/Project'

const emptyResult: ProjectListData = {
  items: [],
  page: 1,
  pageSize: 12,
  totalCount: 0,
  totalPages: 0,
}

export const useProjects = () => {
  const [result, setResult] = useState(emptyResult)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ProjectFilters>({ page: 1, pageSize: 12 })

  const loadProjects = useCallback(async (nextFilters: ProjectFilters = filters) => {
    try {
      setLoading(true)
      const data = await projectService.getProjects(nextFilters)
      setResult(data)
    } catch (error) {
      toast.error(getProjectErrorMessage(error, 'Không thể tải danh sách dự án'))
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  const updateFilters = (next: Partial<ProjectFilters>) => {
    const nextFilters = { ...filters, ...next, page: next.page ?? 1 }
    setFilters(nextFilters)
    void loadProjects(nextFilters)
  }

  const addProject = (project: ProjectSummary) => {
    setResult((previous) => ({
      ...previous,
      items: [project, ...previous.items],
      totalCount: previous.totalCount + 1,
    }))
  }

  return {
    projects: result.items,
    pagination: result,
    filters,
    loading,
    updateFilters,
    loadProjects,
    addProject,
  }
}
