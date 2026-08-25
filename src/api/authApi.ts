import axiosClient from './axiosClient'

import {
  LoginApiResponse,
  LoginRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
} from '../types/auth'

export const authApi = {
  login: async (
    request: LoginRequest,
  ): Promise<LoginApiResponse> => {
    const response =
      await axiosClient.post<LoginApiResponse>(
        '/auth/login',
        request,
      )

    return response.data
  },

  refresh: async (
    accessToken: string,
  ): Promise<RefreshTokenResponse> => {
    const request: RefreshTokenRequest = {
      accessToken,
    }

    const response =
      await axiosClient.post<RefreshTokenResponse>(
        '/auth/refresh',
        request,
      )

    return response.data
  },

  logout: async (
    reason?: string,
  ): Promise<void> => {
    const request: LogoutRequest = {
      reason,
    }

    await axiosClient.post(
      '/auth/logout',
      request,
    )
  },

  logoutAllDevices: async (
    reason?: string,
  ): Promise<void> => {
    await axiosClient.post(
      '/auth/logout-all-devices',
      {
        reason,
      },
    )
  },
}