
import { ApiResponse } from 'src/api/authApi'
import axiosClient from 'src/api/axiosClient'

import type {
  ChangePasswordRequest,
  MyProfile,
  UpdateMyProfileRequest,
  UserProfile,
} from 'src/types/profile'

const PROFILE_ENDPOINT = 'api/v1/my-profile'
const AVATAR_ENDPOINT = 'api/v1/my-profile/avatar'
const CHANGE_PASSWORD_ENDPOINT = 'auth/change-password'

const PROFILE_CHANGED_EVENT = 'profile:changed'

/**
 * Đọc lỗi từ response của ASP.NET Core hoặc Axios.
/** */
const getErrorMessage = (error: unknown): string => {
  if (typeof error !== 'object' || error === null) {
    return 'Đã xảy ra lỗi. Vui lòng thử lại.'
  }

  const err = error as {
    message?: string
    response?: {
      status?: number
      data?: unknown
    }
  }

  const data = err.response?.data

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (typeof data === 'object' && data !== null) {
    const body = data as {
      code?: unknown
      description?: unknown
      message?: unknown
      title?: unknown
      detail?: unknown
      errors?: unknown
    }

    // Ưu tiên thông báo nghiệp vụ do backend trả về.
    if (
      typeof body.description === 'string' &&
      body.description.trim()
    ) {
      return body.description
    }

    if (
      typeof body.message === 'string' &&
      body.message.trim()
    ) {
      return body.message
    }

    if (
      typeof body.detail === 'string' &&
      body.detail.trim()
    ) {
      return body.detail
    }

    if (
      typeof body.title === 'string' &&
      body.title.trim()
    ) {
      return body.title
    }

    if (body.errors && typeof body.errors === 'object') {
      const messages = Array.isArray(body.errors)
        ? body.errors.filter(
            (item): item is string =>
              typeof item === 'string' && item.trim().length > 0,
          )
        : Object.values(
            body.errors as Record<string, unknown>,
          ).flatMap((value) =>
            Array.isArray(value)
              ? value.filter(
                  (item): item is string =>
                    typeof item === 'string' &&
                    item.trim().length > 0,
                )
              : typeof value === 'string' && value.trim()
                ? [value]
                : [],
          )

      if (messages.length > 0) {
        return messages.join('\n')
      }
    }
  }

  if (err.response?.status === 400) {
    return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.'
  }

  if (err.response?.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
  }

  if (err.response?.status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này.'
  }

  return err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'
}


const profileService = {
  async getMyProfile(): Promise<MyProfile> {
    const response = await axiosClient.get<MyProfile>(PROFILE_ENDPOINT)
    return response.data
  },

  async updateMyProfile(
    data: UpdateMyProfileRequest,
  ): Promise<MyProfile> {
    try {
      const response = await axiosClient.put<MyProfile>(
        PROFILE_ENDPOINT,
        data,
      )

      return response.data
    } catch (error) {
      console.error('[updateMyProfile] status:', (
        error as { response?: { status?: number } }
      ).response?.status)

      console.error('[updateMyProfile] response:', (
        error as { response?: { data?: unknown } }
      ).response?.data)

      throw error
    }
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axiosClient.post<{ avatarUrl: string }>(
      AVATAR_ENDPOINT,
      formData,
    )

    return response.data.avatarUrl
  },

  resolveFileUrl(url: string | null | undefined): string | null {
    if (!url) return null
    if (/^(https?:|blob:|data:)/i.test(url)) return url

    const base = (axiosClient.defaults.baseURL ?? '').replace(/\/+$/, '')

    return `${base}${url.startsWith('/') ? '' : '/'}${url}`
  },

  notifyProfileChanged(user: UserProfile): void {
    window.dispatchEvent(
      new CustomEvent<UserProfile>(PROFILE_CHANGED_EVENT, {
        detail: user,
      }),
    )
  },

  subscribeProfileChanged(
    callback: (user: UserProfile) => void,
  ): () => void {
    const handler = (event: Event) => {
      callback((event as CustomEvent<UserProfile>).detail)
    }

    window.addEventListener(PROFILE_CHANGED_EVENT, handler)

    return () => {
      window.removeEventListener(PROFILE_CHANGED_EVENT, handler)
    }
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const response = await axiosClient.post<ApiResponse<unknown>>(
      CHANGE_PASSWORD_ENDPOINT,
      data,
    )

    if (!response.data.isSuccess) {
      throw new Error(
        response.data.message || 'Không thể đổi mật khẩu.',
      )
    }
  },

  getErrorMessage,
}

export default profileService
