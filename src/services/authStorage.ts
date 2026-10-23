import axios from 'axios'

const ACCESS_TOKEN_KEY = 'accessToken'
const ACCESS_TOKEN_EXPIRES_AT_KEY = 'accessTokenExpiresAt'
const ANTI_CSRF_TOKEN_KEY = 'antiCsrfToken'
const ROLES_KEY = 'roles'
const PERMISSIONS_KEY = 'permissions'
const MUST_CHANGE_PASSWORD_KEY = 'mustChangePassword'
const STORAGE_TYPE_KEY = 'storageType'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const REQUEST_TIMEOUT = 10000

type StorageType = 'local' | 'session'

const getStorage = (): Storage => {
  const storageType = localStorage.getItem(STORAGE_TYPE_KEY)

  return storageType === 'local' ? localStorage : sessionStorage
}

const getStorageByType = (storageType: StorageType): Storage => {
  return storageType === 'local' ? localStorage : sessionStorage
}

const clearStorage = (storage: Storage) => {
  storage.removeItem(ACCESS_TOKEN_KEY)
  storage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
  storage.removeItem(ANTI_CSRF_TOKEN_KEY)
  storage.removeItem(ROLES_KEY)
  storage.removeItem(PERMISSIONS_KEY)
  storage.removeItem(MUST_CHANGE_PASSWORD_KEY)
}

const parseStringArray = (raw: string | null): string[] => {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Gọi API cần đăng nhập (logout, logout-all...).
 *
 * Dùng axios thường (không qua axiosClient) để tránh import vòng tròn
 * và tránh interceptor tự redirect giữa chừng khi đang đăng xuất.
 * Nếu access token đã hết hạn (401) thì refresh một lần rồi gọi lại,
 * để session phía server vẫn được thu hồi đúng cách.
 */
const postAuthorized = async (
  path: string,
  body: unknown,
): Promise<void> => {
  const send = (token: string) =>
    axios.post(`${API_BASE_URL}${path}`, body, {
      withCredentials: true,
      timeout: REQUEST_TIMEOUT,
      headers: { Authorization: `Bearer ${token}` },
    })

  const token = authStorage.getAccessToken()

  // Không có token thì không còn gì để thu hồi phía server.
  if (!token) return

  try {
    await send(token)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const newToken = await authStorage.refreshAccessToken()
      await send(newToken)
      return
    }

    throw error
  }
}

export const authStorage = {
  /**
   * Lưu thông tin authentication.
   *
   * Refresh Token KHÔNG được lưu ở đây.
   * Refresh Token được Backend lưu trong HttpOnly Cookie.
   */
  saveAuth: (
    accessToken: string,
    accessTokenExpiresAt: string,
    antiCsrfToken: string,
    roles: string[],
    permissions: string[],
    mustChangePassword: boolean,
    remember: boolean,
  ) => {
    const storageType: StorageType = remember ? 'local' : 'session'
    const storage = getStorageByType(storageType)

    // Xóa authentication cũ ở cả hai storage
    clearStorage(localStorage)
    clearStorage(sessionStorage)

    localStorage.removeItem(STORAGE_TYPE_KEY)
    sessionStorage.removeItem(STORAGE_TYPE_KEY)

    // Ghi nhớ nơi lưu auth
    localStorage.setItem(STORAGE_TYPE_KEY, storageType)

    storage.setItem(ACCESS_TOKEN_KEY, accessToken)
    storage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, accessTokenExpiresAt)
    storage.setItem(ANTI_CSRF_TOKEN_KEY, antiCsrfToken)
    storage.setItem(ROLES_KEY, JSON.stringify(roles))
    storage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
    storage.setItem(MUST_CHANGE_PASSWORD_KEY, String(mustChangePassword))
  },

  /**
   * Cập nhật Access Token sau khi refresh.
   * Refresh Token do HttpOnly Cookie quản lý, không đụng tới ở đây.
   */
  updateAccessToken: (accessToken: string, accessTokenExpiresAt: string) => {
    const storage = getStorage()

    storage.setItem(ACCESS_TOKEN_KEY, accessToken)
    storage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, accessTokenExpiresAt)
  },

  getAccessToken: (): string | null => getStorage().getItem(ACCESS_TOKEN_KEY),

  getAccessTokenExpiresAt: (): string | null =>
    getStorage().getItem(ACCESS_TOKEN_EXPIRES_AT_KEY),

  getAntiCsrfToken: (): string | null =>
    getStorage().getItem(ANTI_CSRF_TOKEN_KEY),

  getRoles: (): string[] => parseStringArray(getStorage().getItem(ROLES_KEY)),

  getPermissions: (): string[] =>
    parseStringArray(getStorage().getItem(PERMISSIONS_KEY)),

  mustChangePassword: (): boolean =>
    getStorage().getItem(MUST_CHANGE_PASSWORD_KEY) === 'true',

  completePasswordChange: () => {
    localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, 'false')
    sessionStorage.setItem(MUST_CHANGE_PASSWORD_KEY, 'false')
  },

  clearAuth: () => {
    clearStorage(localStorage)
    clearStorage(sessionStorage)

    localStorage.removeItem(STORAGE_TYPE_KEY)
    sessionStorage.removeItem(STORAGE_TYPE_KEY)
  },

  isAuthenticated: (): boolean => !!authStorage.getAccessToken(),

  /**
   * Lấy access token mới bằng refresh token trong HttpOnly cookie.
   *
   * Backend BẮT BUỘC có access token cũ (có thể đã hết hạn) trong body:
   * nó đọc user id và session id từ token đó để đối chiếu với refresh token.
   */
  refreshAccessToken: async (): Promise<string> => {
    try {
      const currentAccessToken = authStorage.getAccessToken()

      if (!currentAccessToken) {
        throw new Error('No access token available to refresh.')
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { accessToken: currentAccessToken },
        {
          withCredentials: true,
          timeout: REQUEST_TIMEOUT,
        },
      )

      const refreshPayload = response.data?.data ?? response.data

      const {
        accessToken,
        accessTokenExpiresAt,
        antiCsrfToken,
        roles,
        permissions,
      } = refreshPayload

      if (!accessToken) {
        throw new Error('Refresh response did not contain an access token.')
      }

      authStorage.updateAccessToken(accessToken, accessTokenExpiresAt)

      // Cập nhật các giá trị phụ nếu backend có trả về
      const storage = getStorage()

      if (antiCsrfToken) {
        storage.setItem(ANTI_CSRF_TOKEN_KEY, antiCsrfToken)
      }

      if (roles) {
        storage.setItem(ROLES_KEY, JSON.stringify(roles))
      }

      if (permissions) {
        storage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
      }

      return accessToken
    } catch (error) {
      // Refresh thất bại = phiên không còn hợp lệ
      authStorage.clearAuth()
      throw error
    }
  },

  /**
   * Đăng xuất thiết bị hiện tại.
   * Luôn dọn dữ liệu local dù API thành công hay thất bại.
   * Nơi gọi chịu trách nhiệm chuyển hướng về /login.
   */
  logout: async (reason?: string): Promise<void> => {
    try {
      await postAuthorized('/auth/logout', { reason })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      authStorage.clearAuth()
    }
  },

  /**
   * Đăng xuất tất cả thiết bị của tài khoản.
   */
  logoutAll: async (reason?: string): Promise<void> => {
    try {
      await postAuthorized('/auth/logout-all-devices', { reason })
    } catch (error) {
      console.error('Logout all devices failed:', error)
    } finally {
      authStorage.clearAuth()
    }
  },
}