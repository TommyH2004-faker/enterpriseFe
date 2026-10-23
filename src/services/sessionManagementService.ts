
import axiosClient from 'src/api/axiosClient'
import type {
  SessionManagementQuery,
  SessionManagementResponse,
} from 'src/types/sessionManagement'

interface ApiResponse<T> {
  isSuccess: boolean
  statusCode: number
  message: string
  traceId: string
  data: T
  errors: unknown[]
}

const BASE_URL = 'api/v1/auth/sessions'

const sessionManagementService = {
  async getAll(
    params: SessionManagementQuery,
  ): Promise<SessionManagementResponse> {
    const response = await axiosClient.get<
      ApiResponse<SessionManagementResponse>
    >(BASE_URL, {
      params: {
        username: params.username?.trim() || undefined,
        page: params.page,
        pageSize: params.pageSize,
      },
    })

    return response.data.data
  },

  async revokeSession(sessionId: string): Promise<void> {
    await axiosClient.post<ApiResponse<unknown>>(
      `${BASE_URL}/${sessionId}/revoke`,
    )
  },

  // Thu hồi tất cả session của một người dùng cụ thể.
  // Giữ lại nếu các component khác còn sử dụng.
  async revokeAllUserSessions(userId: string): Promise<number> {
    const response = await axiosClient.post<ApiResponse<number>>(
      `${BASE_URL}/${userId}/revoke-all`,
    )

    return response.data.data
  },
  // Thu hồi tất cả session của mọi tài khoản trên hệ thống.
async revokeAllSessions(): Promise<number> {
  const response = await axiosClient.post<ApiResponse<number>>(
    `${BASE_URL}/revoke-all`,
  )

  return response.data.data
},
}

export default sessionManagementService
