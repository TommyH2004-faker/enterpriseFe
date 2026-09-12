import axiosClient from './axiosClient'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  gender: number
}

export interface LoginResponse {
  accessToken: string
  accessTokenExpiresAt: string
  antiCsrfToken: string
  roles: string[]
  permissions: string[]
  mustChangePassword: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface RefreshTokenResponse {
  accessToken: string
  accessTokenExpiresAt: string
  antiCsrfToken: string
}

export interface VerifyEmailRequest {
  email: string
  code: string
}

export interface ApiResponse<T> {
  isSuccess: boolean
  statusCode: number
  message: string
  data: T | null
  errors: Array<string | { code?: string; description?: string }>
}

type ErrorResponseData = {
  message?: string
  errors?: Array<string | { code?: string; description?: string }>
}

export const getErrorMessage = (
  errors: ApiResponse<unknown>['errors'] | undefined,
  fallback: string,
) => {
  const firstError = errors?.[0]

  if (typeof firstError === 'string') {
    return firstError
  }

  return firstError?.description || firstError?.code || fallback
}

export const getHttpErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== 'object' || error === null) return fallback

  const response = (error as { response?: { data?: ErrorResponseData } }).response
  return getErrorMessage(response?.data?.errors, response?.data?.message || fallback)
}

export const authApi = {
  register: async (
    request: RegisterRequest,
  ): Promise<ApiResponse<string>> => {
    const response = await axiosClient.post<ApiResponse<string>>(
      '/auth/register',
      request,
    )

    return response.data
  },

  verifyEmail: async (
    request: VerifyEmailRequest,
  ): Promise<ApiResponse<null>> => {
    const response = await axiosClient.get<ApiResponse<null>>(
      '/auth/verify-email',
      { params: request },
    )

    return response.data
  },

  forgotPassword: async (
    email: string,
  ): Promise<ApiResponse<null>> => {
    const response = await axiosClient.post<ApiResponse<null>>(
      '/auth/forgot-password',
      { email },
    )

    return response.data
  },

  login: async (
    request: LoginRequest,
  ): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosClient.post<
      ApiResponse<LoginResponse> | LoginResponse
    >('/auth/login', request)

    const payload = response.data

    if ('accessToken' in payload) {
      return {
        isSuccess: true,
        statusCode: 200,
        message: '',
        data: payload,
        errors: [],
      }
    }

    return payload
  },

  changePassword: async (
    request: ChangePasswordRequest,
  ): Promise<ApiResponse<null>> => {
    const response = await axiosClient.post<ApiResponse<null> | null>(
      '/auth/change-password',
      request,
    )

    if (!response.data || !('isSuccess' in response.data)) {
      return {
        isSuccess: true,
        statusCode: 200,
        message: '',
        data: null,
        errors: [],
      }
    }

    return response.data
  },

  refresh: async (): Promise<
    ApiResponse<RefreshTokenResponse>
  > => {
    const response =
      await axiosClient.post<
        ApiResponse<RefreshTokenResponse>
      >('/auth/refresh')

    return response.data
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout')
  },
}