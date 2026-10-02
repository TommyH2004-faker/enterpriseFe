// src/services/projectService.ts

import axiosClient from "src/api/axiosClient"
import {
  ApiEnvelope,
  ChangeDepartmentRequest,
  ChangeManagerRequest,
  CreateProjectRequest,
  ProjectDetail,
  ProjectFilters,
  ProjectListData,
  UpdateProjectRequest,
} from "src/types/ProjectType/project"
import { ProjectProgress } from "src/types/ProjectType/project-progress"
import { ProjectStatistics } from "src/types/ProjectType/project-statistics"
import { CreateBoardRequest, KanbanBoardDetail, KanbanBoardSummary, KanbanTask, MoveTaskRequest, ProjectTask } from "src/types/KanbanType/kanban"


const BASE_URL = '/api/v1/projects'
interface ResultEnvelope<T> {
  value: T
  isSuccess: boolean
  isFailure: boolean
  error: {
    code: string
    description: string
    type: number
  }
}
export interface AddProjectMemberRequest {
  userId: string
}
export interface ProjectMemberResponse {
  id: string
  userId?: string
  employeeId?: string
  name: string
  email: string
  role: string
  department: string
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
          departmentId: filters.departmentId || undefined,
          managerId: filters.managerId || undefined,
          sortBy: filters.sortBy || 'CreatedAt',
          sortDirection: filters.sortDirection || 'desc',
        },
      },
    )

    return response.data.data
  },
async createTask(params: {
  projectId: string
  boardId: string
  columnId: string

  title: string
  description?: string

  taskType: number
  priority: number

  startDate?: string | null
  dueDate?: string | null

  storyPoint: number
  estimateHour: number

  assigneeIds: string[]
  labelIds: string[]
}) {
  const response = await axiosClient.post(
    `/api/v1/projects/${params.projectId}/tasks`,
    {
      boardId: params.boardId,
      columnId: params.columnId,

      title: params.title,
      description: params.description,

      taskType: params.taskType,
      priority: params.priority,

      startDate: params.startDate || null,
      dueDate: params.dueDate || null,

      storyPoint: params.storyPoint,
      estimateHour: params.estimateHour,

      assigneeIds: params.assigneeIds || [],
      labelIds: params.labelIds || [],
    },
  )

  return response.data
},
  async getProject(
    projectId: string,
  ): Promise<ProjectDetail> {
    const response = await axiosClient.get<ApiEnvelope<ProjectDetail>>(
      `${BASE_URL}/${projectId}`,
    )

    return response.data.data
  },
  
  async getProjectTasks(
  projectId: string,
): Promise<ProjectTask[]> {
  const response = await axiosClient.get<
    ResultEnvelope<ProjectTask[]>
  >(
    `${BASE_URL}/${projectId}/tasks`,
  )

  return response.data.value ?? []
},
  async getProjectById(
    projectId: string,
  ): Promise<ProjectDetail> {
    return this.getProject(projectId)
  },

  async getProgress(
    projectId: string,
  ): Promise<ProjectProgress> {
    const response = await axiosClient.get<ApiEnvelope<ProjectProgress>>(
      `${BASE_URL}/${projectId}/progress`,
    )

    return response.data.data
  },

  async getStatistics(
    projectId: string,
  ): Promise<ProjectStatistics> {
    const response = await axiosClient.get<ApiEnvelope<ProjectStatistics>>(
      `${BASE_URL}/${projectId}/statistics`,
    )

    return response.data.data
  },

  async createProject(
    request: CreateProjectRequest,
  ): Promise<ProjectDetail> {
    const response = await axiosClient.post<ApiEnvelope<ProjectDetail>>(
      BASE_URL,
      request,
    )

    return response.data.data
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

  // Kanban Board APIs
  async getBoards(projectId: string): Promise<KanbanBoardSummary[]> {
    const response = await axiosClient.get<ApiEnvelope<KanbanBoardSummary[]>>(
      `${BASE_URL}/${projectId}/boards`,
    )
    return response.data.data
  },

  async createBoard(projectId: string, request: CreateBoardRequest): Promise<KanbanBoardSummary> {
    const response = await axiosClient.post<ApiEnvelope<KanbanBoardSummary>>(
      `${BASE_URL}/${projectId}/boards`,
      request,
    )
    return response.data.data
  },

  async getBoard(projectId: string, boardId: string): Promise<KanbanBoardDetail> {
    const response = await axiosClient.get<ApiEnvelope<KanbanBoardDetail>>(
      `${BASE_URL}/${projectId}/boards/${boardId}`,
    )
    return response.data.data
  },


async getBoardTasks(
  boardId: string,
  projectId: string,
): Promise<KanbanTask[]> {
  const response = await axiosClient.get<ApiEnvelope<KanbanTask[]>>(
    `/api/v1/boards/${projectId}/${boardId}/tasks`,
  )
  return response.data.data
},




  async moveTask(taskId: string, request: MoveTaskRequest): Promise<void> {
    await axiosClient.put(`/api/v1/tasks/${taskId}/move`, request)
  },
  async getProjectMembers(
    projectId: string,
  ): Promise<ProjectMemberResponse[]> {
    const response = await axiosClient.get(
      `/api/v1/projects/${projectId}/members`,
    )

    return response.data.data
  },
  async addProjectMember(
    projectId: string,
    userId: string,
  ): Promise<void> {
    await axiosClient.post(
      `/api/v1/projects/${projectId}/members`,
      {
        userId,
      },
    )
  },

  async removeProjectMember(
    projectId: string,
    userId: string,
  ): Promise<void> {
    await axiosClient.delete(
      `/api/v1/projects/${projectId}/members/${userId}`,
    )
  },
}