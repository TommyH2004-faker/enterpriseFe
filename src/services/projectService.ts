// import axiosClient from '../api/axiosClient'
// import {
//   ApiEnvelope,
//   CreateBoardRequest,
//   CreateProjectRequest,
//   KanbanBoardDetail,
//   KanbanBoardSummary,
//   KanbanTask,
//   MoveTaskRequest,
//   ProjectDetail,
//   ProjectFilters,
//   ProjectListData,
//   ProjectProgress,
//   ProjectStatistics,
// } from '../types/Project'

import axiosClient from "src/api/axiosClient"
import { ApiEnvelope, ChangeDepartmentRequest, ChangeManagerRequest, CreateProjectRequest, ProjectDetail, ProjectFilters, ProjectListData, UpdateProjectRequest } from "src/types/ProjectType/project"
import { ProjectProgress } from "src/types/ProjectType/project-progress"
import { ProjectStatistics } from "src/types/ProjectType/project-statistics"

// const unwrap = <T>(response: ApiEnvelope<T>): T => response.data

// export const getProjectErrorMessage = (error: unknown, fallback: string) => {
//   if (typeof error !== 'object' || error === null || !('response' in error)) {
//     return error instanceof Error ? error.message : fallback
//   }

//   const response = (error as {
//     response?: {
//       status?: number
//       data?: {
//         message?: string
//         title?: string
//         detail?: string
//         errors?: Array<string | { code?: string; description?: string }> | Record<string, string[]>
//       }
//     }
//   }).response
//   const data = response?.data

//   if (data?.message) return data.message
//   if (data?.title) return data.title
//   if (data?.detail) return data.detail

//   if (Array.isArray(data?.errors) && data.errors.length > 0) {
//     return data.errors
//       .map((item) => typeof item === 'string' ? item : item.description || item.code || '')
//       .filter(Boolean)
//       .join(', ')
//   }

//   if (data?.errors && !Array.isArray(data.errors)) {
//     return Object.values(data.errors).flat().join(', ')
//   }

//   if (response?.status === 400) return 'Backend từ chối dữ liệu hoặc query gửi lên không hợp lệ.'
//   if (response?.status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
//   if (response?.status === 404) return 'Không tìm thấy API hoặc dữ liệu dự án.'
//   return fallback
// }

// export const projectService = {
//   async getProjects(filters: ProjectFilters = {}): Promise<ProjectListData> {
//     const response = await axiosClient.get<ApiEnvelope<ProjectListData>>('/api/v1/projects', {
//       params: filters,
//     })
//     return unwrap(response.data)
//   },

//   async getProjectById(projectId: string): Promise<ProjectDetail> {
//     const response = await axiosClient.get<ApiEnvelope<ProjectDetail>>(`/api/v1/projects/${projectId}`)
//     return unwrap(response.data)
//   },

//   async getProjectProgress(projectId: string): Promise<ProjectProgress> {
//     const response = await axiosClient.get<ApiEnvelope<ProjectProgress>>(`/api/v1/projects/${projectId}/progress`)
//     return unwrap(response.data)
//   },

//   async getProjectStatistics(projectId: string): Promise<ProjectStatistics> {
//     const response = await axiosClient.get<ApiEnvelope<ProjectStatistics>>(`/api/v1/projects/${projectId}/statistics`)
//     return unwrap(response.data)
//   },

//   async createProject(request: CreateProjectRequest): Promise<ProjectDetail> {
//     const response = await axiosClient.post<ApiEnvelope<ProjectDetail>>('/api/v1/projects', request)
//     return unwrap(response.data)
//   },

//   async getBoards(projectId: string): Promise<KanbanBoardSummary[]> {
//     const response = await axiosClient.get<ApiEnvelope<KanbanBoardSummary[]>>(`/api/v1/projects/${projectId}/boards`)
//     return unwrap(response.data)
//   },

//   async createBoard(projectId: string, request: CreateBoardRequest): Promise<KanbanBoardSummary> {
//     const response = await axiosClient.post<ApiEnvelope<KanbanBoardSummary>>(
//       `/api/v1/projects/${projectId}/boards`,
//       request,
//     )
//     return unwrap(response.data)
//   },

//   async getBoard(projectId: string, boardId: string): Promise<KanbanBoardDetail> {
//     const response = await axiosClient.get<ApiEnvelope<KanbanBoardDetail>>(
//       `/api/v1/projects/${projectId}/boards/${boardId}`,
//     )
//     return unwrap(response.data)
//   },

//   async getBoardTasks(boardId: string): Promise<KanbanTask[]> {
//     const response = await axiosClient.get<ApiEnvelope<KanbanTask[]>>(`/api/v1/boards/${boardId}/tasks`)
//     return unwrap(response.data)
//   },

//   async moveTask(taskId: string, request: MoveTaskRequest): Promise<void> {
//     await axiosClient.put(`/api/v1/tasks/${taskId}/move`, request)
//   },
// }

// src/services/projectService.ts






const BASE_URL = '/api/v1/projects'

const unwrap = <T>(response: { data: ApiEnvelope<T> }): T => {
  return response.data.data
}

export const projectService = {
  async getProjects(
    filters: ProjectFilters = {},
  ): Promise<ProjectListData> {
    const response = await axiosClient.get<ApiEnvelope<ProjectListData>>(
      BASE_URL,
      {
        params: {
          pageNumber: filters.page ?? 1,
          pageSize: filters.pageSize ?? 12,

          search: filters.search || undefined,

          status: filters.status || undefined,

          departmentId:
            filters.departmentId || undefined,

          managerId:
            filters.managerId || undefined,

          sortBy:
            filters.sortBy || 'CreatedAt',

          sortDirection:
            filters.sortDirection || 'desc',
        },
      },
    )

    return unwrap(response)
  },

  async getProject(
    projectId: string,
  ): Promise<ProjectDetail> {
    const response = await axiosClient.get<ApiEnvelope<ProjectDetail>>(
      `${BASE_URL}/${projectId}`,
    )

    return unwrap(response)
  },

  async getProgress(
    projectId: string,
  ): Promise<ProjectProgress> {
    const response = await axiosClient.get<ApiEnvelope<ProjectProgress>>(
      `${BASE_URL}/${projectId}/progress`,
    )

    return unwrap(response)
  },

  async getStatistics(
    projectId: string,
  ): Promise<ProjectStatistics> {
    const response = await axiosClient.get<ApiEnvelope<ProjectStatistics>>(
      `${BASE_URL}/${projectId}/statistics`,
    )

    return unwrap(response)
  },

  // async createProject(
  //   request: CreateProjectRequest,
  // ): Promise<string> {
  //   const response = await axiosClient.post<ApiEnvelope<string>>(
  //     BASE_URL,
  //     request,
  //   )
    
  //   return unwrap(response)
  // },
  async createProject(
  request: CreateProjectRequest,
): Promise<ProjectDetail> {
  const response =
    await axiosClient.post<
      ApiEnvelope<ProjectDetail>
    >(
      BASE_URL,
      request,
    )

  return unwrap(response)
},

  async updateProject(
    projectId: string,
    request: UpdateProjectRequest,
  ): Promise<void> {
    await axiosClient.put<ApiEnvelope<unknown>>(
      `${BASE_URL}/${projectId}`,
      request,
    )
  },

  async changeDepartment(
    projectId: string,
    request: ChangeDepartmentRequest,
  ): Promise<void> {
    await axiosClient.patch<ApiEnvelope<unknown>>(
      `${BASE_URL}/${projectId}/department`,
      request,
    )
  },

  async changeManager(
    projectId: string,
    request: ChangeManagerRequest,
  ): Promise<void> {
    await axiosClient.patch<ApiEnvelope<unknown>>(
      `${BASE_URL}/${projectId}/manager`,
      request,
    )
  },

  async start(
    projectId: string,
  ): Promise<void> {
    await axiosClient.post<ApiEnvelope<unknown>>(
      `${BASE_URL}/${projectId}/start`,
    )
  },

  async hold(
    projectId: string,
  ): Promise<void> {
    await axiosClient.post<ApiEnvelope<unknown>>(
      `${BASE_URL}/${projectId}/hold`,
    )
  },

  async resume(
    projectId: string,
  ): Promise<void> {
    await axiosClient.post<ApiEnvelope<unknown>>(
      `${BASE_URL}/${projectId}/resume`,
    )
  },

  async complete(
    projectId: string,
  ): Promise<void> {
    await axiosClient.post<ApiEnvelope<unknown>>(
      `${BASE_URL}/${projectId}/complete`,
    )
  },

  async cancel(
    projectId: string,
  ): Promise<void> {
    await axiosClient.post<ApiEnvelope<unknown>>(
      `${BASE_URL}/${projectId}/cancel`,
    )
  },

  async activate(
    projectId: string,
  ): Promise<void> {
    await axiosClient.post<ApiEnvelope<unknown>>(
      `${BASE_URL}/${projectId}/activate`,
    )
  },

  async deactivate(
    projectId: string,
  ): Promise<void> {
    await axiosClient.post<ApiEnvelope<unknown>>(
      `${BASE_URL}/${projectId}/deactivate`,
    )
  },

  async deleteProject(
    projectId: string,
  ): Promise<void> {
    await axiosClient.delete<ApiEnvelope<unknown>>(
      `${BASE_URL}/${projectId}`,
    )
  },
}