
import axiosClient from 'src/api/axiosClient'
import {
  ApiEnvelope,
  CreateProjectRequest,
  ProjectDetail,
  ProjectFilters,
  ProjectListData,
  UpdateProjectRequest,
} from 'src/types/ProjectType/project'
import { ProjectProgress } from 'src/types/ProjectType/project-progress'
import { ProjectStatistics } from 'src/types/ProjectType/project-statistics'
import {
  CreateBoardRequest,
  KanbanBoardDetail,
  KanbanBoardSummary,
  KanbanTask,
  MoveTaskRequest,
  ProjectTask,
} from 'src/types/KanbanType/kanban'

const BASE_URL = '/api/v1/projects'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/** Backend có chỗ trả { data }, có chỗ trả { value } (Result<T>). Gộp cả hai. */
interface Envelope<T> {
  data?: T
  value?: T
}

function unwrap<T>(body: Envelope<T>): T {
  return (body.data ?? body.value) as T
}

/** Khớp với action mà ChangeProjectStatusCommand hiểu ở backend. */
export type ProjectStatusAction =
  | 'start'
  | 'onhold'
  | 'resume'
  | 'complete'
  | 'cancel'
  | 'reopen'
  | 'deactivate'

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

export interface CreateTaskParams {
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
}

/* -------------------------------------------------------------------------- */
/* Service                                                                    */
/* -------------------------------------------------------------------------- */

export const projectService = {
  /* ===================== ProjectController ===================== */

  /** GET /api/v1/projects */
  async getProjects(filters: ProjectFilters = {}): Promise<ProjectListData> {
    const response = await axiosClient.get<Envelope<ProjectListData>>(BASE_URL, {
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
    })
    return unwrap(response.data)
  },

  /** GET /api/v1/projects/count */
  async getProjectCount(): Promise<number> {
    const response = await axiosClient.get<Envelope<number>>(`${BASE_URL}/count`)
    return unwrap(response.data)
  },

  /** GET /api/v1/projects/{projectId} */
  async getProject(projectId: string): Promise<ProjectDetail> {
    const response = await axiosClient.get<Envelope<ProjectDetail>>(
      `${BASE_URL}/${projectId}`,
    )
    return unwrap(response.data)
  },

  /** Alias cũ, giữ để không phải sửa nơi đang gọi. */
  async getProjectById(projectId: string): Promise<ProjectDetail> {
    return this.getProject(projectId)
  },

  /** POST /api/v1/projects */
  async createProject(request: CreateProjectRequest): Promise<ProjectDetail> {
    const response = await axiosClient.post<Envelope<ProjectDetail>>(
      BASE_URL,
      request,
    )
    return unwrap(response.data)
  },

  /**
   * PUT /api/v1/projects/{projectId}
   * Backend chỉ nhận: name, description, startDate, endDate, priority.
   */
  async updateProject(
    projectId: string,
    request: UpdateProjectRequest,
  ): Promise<void> {
    await axiosClient.put(`${BASE_URL}/${projectId}`, request)
  },

  /** DELETE /api/v1/projects/{projectId} (soft delete; chỉ Planning/Cancelled) */
  async deleteProject(projectId: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${projectId}`)
  },

  /** GET /api/v1/projects/{projectId}/progress */
  async getProgress(projectId: string): Promise<ProjectProgress> {
    const response = await axiosClient.get<Envelope<ProjectProgress>>(
      `${BASE_URL}/${projectId}/progress`,
    )
    return unwrap(response.data)
  },

  /** GET /api/v1/projects/{projectId}/statistics */
  async getStatistics(projectId: string): Promise<ProjectStatistics> {
    const response = await axiosClient.get<Envelope<ProjectStatistics>>(
      `${BASE_URL}/${projectId}/statistics`,
    )
    return unwrap(response.data)
  },

  /* ---------------------- Đổi trạng thái ---------------------- */

  /**
   * PUT /api/v1/projects/{projectId}/status
   * Lưu ý: ChangeStatusRequest ở backend CHỈ có `action`, không có `reason`.
   * Muốn gửi lý do thì dùng hold() hoặc cancel() bên dưới.
   */
  async changeStatus(
    projectId: string,
    action: ProjectStatusAction,
  ): Promise<void> {
    await axiosClient.put(`${BASE_URL}/${projectId}/status`, { action })
  },

  /** POST /api/v1/projects/{projectId}/start */
  async start(projectId: string): Promise<void> {
    await axiosClient.post(`${BASE_URL}/${projectId}/start`)
  },

  /** POST /api/v1/projects/{projectId}/hold — BẮT BUỘC có lý do */
  async hold(projectId: string, reason: string): Promise<void> {
    await axiosClient.post(`${BASE_URL}/${projectId}/hold`, { reason })
  },

  /** POST /api/v1/projects/{projectId}/resume */
  async resume(projectId: string): Promise<void> {
    await axiosClient.post(`${BASE_URL}/${projectId}/resume`)
  },

  /** POST /api/v1/projects/{projectId}/complete */
  async complete(projectId: string): Promise<void> {
    const progress = await this.getProgress(projectId)
    const overallProgress = progress.overallProgress ?? progress.progress ?? 0

    if (overallProgress < 100) {
      throw new Error('Chỉ có thể hoàn thành dự án khi tiến độ đạt 100%.')
    }

    await axiosClient.post(`${BASE_URL}/${projectId}/complete`)
  },

  /** POST /api/v1/projects/{projectId}/cancel — BẮT BUỘC có lý do */
  async cancel(projectId: string, reason: string): Promise<void> {
    await axiosClient.post(`${BASE_URL}/${projectId}/cancel`, { reason })
  },

  /** PUT /api/v1/projects/{projectId}/activate — mở lại dự án đã hoàn thành/hủy (Admin) */
  async reopen(projectId: string): Promise<void> {
    await axiosClient.put(`${BASE_URL}/${projectId}/activate`)
  },

  /** Alias cũ của reopen(). */
  async activate(projectId: string): Promise<void> {
    await this.reopen(projectId)
  },

  /** POST /api/v1/projects/{projectId}/deactivate */
  async deactivate(projectId: string): Promise<void> {
    await axiosClient.post(`${BASE_URL}/${projectId}/deactivate`)
  },

  /* ---------------------- Thành viên ---------------------- */

  /** GET /api/v1/projects/{projectId}/members */
  async getProjectMembers(projectId: string): Promise<ProjectMemberResponse[]> {
    const response = await axiosClient.get<Envelope<ProjectMemberResponse[]>>(
      `${BASE_URL}/${projectId}/members`,
    )
    return unwrap(response.data) ?? []
  },

  /** POST /api/v1/projects/{projectId}/members */
  async addProjectMember(projectId: string, userId: string): Promise<void> {
    const body: AddProjectMemberRequest = { userId }
    await axiosClient.post(`${BASE_URL}/${projectId}/members`, body)
  },

  /** DELETE /api/v1/projects/{projectId}/members/{userId} */
  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${projectId}/members/${userId}`)
  },

  /* ---------------------- Kanban boards ---------------------- */

  /** GET /api/v1/projects/{projectId}/boards */
  async getBoards(projectId: string): Promise<KanbanBoardSummary[]> {
    const response = await axiosClient.get<Envelope<KanbanBoardSummary[]>>(
      `${BASE_URL}/${projectId}/boards`,
    )
    return unwrap(response.data) ?? []
  },

  /** GET /api/v1/projects/{projectId}/boards/{boardId} */
  async getBoard(
    projectId: string,
    boardId: string,
  ): Promise<KanbanBoardDetail> {
    const response = await axiosClient.get<Envelope<KanbanBoardDetail>>(
      `${BASE_URL}/${projectId}/boards/${boardId}`,
    )
    return unwrap(response.data)
  },

  /* ================================================================== */
  /* CÁC API DƯỚI ĐÂY KHÔNG CÓ TRONG ProjectController BẠN GỬI.          */
  /* Chúng nằm ở controller khác (Board/Task). Hãy đối chiếu route thật */
  /* ở controller đó trước khi dùng.                                    */
  /* ================================================================== */

  /** POST /api/v1/projects/{projectId}/boards */
  async createBoard(
    projectId: string,
    request: CreateBoardRequest,
  ): Promise<KanbanBoardSummary> {
    const response = await axiosClient.post<Envelope<KanbanBoardSummary>>(
      `${BASE_URL}/${projectId}/boards`,
      request,
    )
    return unwrap(response.data)
  },

  /** GET /api/v1/projects/{projectId}/tasks */
  async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    const response = await axiosClient.get<Envelope<ProjectTask[]>>(
      `${BASE_URL}/${projectId}/tasks`,
    )
    return unwrap(response.data) ?? []
  },

  /** POST /api/v1/projects/{projectId}/tasks */
  async createTask(params: CreateTaskParams) {
    const response = await axiosClient.post(
      `${BASE_URL}/${params.projectId}/tasks`,
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

        assigneeIds: params.assigneeIds ?? [],
        labelIds: params.labelIds ?? [],
      },
    )
    return response.data
  },

  /** GET /api/v1/boards/{projectId}/{boardId}/tasks */
  async getBoardTasks(
    boardId: string,
    projectId: string,
  ): Promise<KanbanTask[]> {
    const response = await axiosClient.get<Envelope<KanbanTask[]>>(
      `/api/v1/boards/${projectId}/${boardId}/tasks`,
    )
    return unwrap(response.data) ?? []
  },

  /** PUT /api/v1/tasks/{taskId}/move */
  async moveTask(taskId: string, request: MoveTaskRequest): Promise<void> {
    await axiosClient.put(`/api/v1/tasks/${taskId}/move`, request)
  },
}