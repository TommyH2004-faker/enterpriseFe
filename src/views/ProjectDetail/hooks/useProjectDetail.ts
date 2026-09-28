import { useCallback, useEffect, useState } from 'react'
import { projectService } from 'src/services/projectService'
import { ProjectDetail } from 'src/types/ProjectType/project'
import { ProjectProgress } from 'src/types/ProjectType/project-progress'
import { ProjectStatistics } from 'src/types/ProjectType/project-statistics'

export const useProjectDetail = (projectId: string) => {
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [progress, setProgress] = useState<ProjectProgress | null>(null)
  const [statistics, setStatistics] = useState<ProjectStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!projectId) return
    try {
      setLoading(true)
      setError(null)

      // Fetch project detail. Progress and statistics fall back gracefully to null if API fails
      const [projectData, progressData, statisticsData] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getProgress(projectId).catch(() => null),
        projectService.getStatistics(projectId).catch(() => null),
      ])

      setProject(projectData)
      setProgress(progressData)
      setStatistics(statisticsData)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Không tìm thấy dự án hoặc hệ thống gặp sự cố.',
      )
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  return {
    project,
    progress,
    statistics,
    loading,
    error,
    refetch: load,
  }
}