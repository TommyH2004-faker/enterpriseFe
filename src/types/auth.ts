export interface LoginRequest {
  username: string
  password: string
}

export interface LoginData {
  accessToken: string
  accessTokenExpiresAt: string
  antiCsrfToken: string
  roles: string[]
  permissions: string[]
}

export interface LoginApiResponse {
  isSuccess: boolean
  statusCode: number
  message: string
  data: LoginData | null
  errors: string[]
}

export interface RefreshTokenRequest {
  accessToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  accessTokenExpiresAt: string
}

export interface LogoutRequest {
  reason?: string
}