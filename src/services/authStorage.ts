import axios from "axios"

const ACCESS_TOKEN_KEY = 'accessToken'
const ACCESS_TOKEN_EXPIRES_AT_KEY = 'accessTokenExpiresAt'
const ANTI_CSRF_TOKEN_KEY = 'antiCsrfToken'
const ROLES_KEY = 'roles'
const PERMISSIONS_KEY = 'permissions'
const MUST_CHANGE_PASSWORD_KEY = 'mustChangePassword'
const STORAGE_TYPE_KEY = 'storageType'

type StorageType = 'local' | 'session'

const getStorage = (): Storage => {
  const storageType = localStorage.getItem(STORAGE_TYPE_KEY)

  return storageType === 'local'
    ? localStorage
    : sessionStorage
}

const getStorageByType = (
  storageType: StorageType,
): Storage => {
  return storageType === 'local'
    ? localStorage
    : sessionStorage
}

const clearStorage = (storage: Storage) => {
  storage.removeItem(ACCESS_TOKEN_KEY)
  storage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
  storage.removeItem(ANTI_CSRF_TOKEN_KEY)
  storage.removeItem(ROLES_KEY)
  storage.removeItem(PERMISSIONS_KEY)
  storage.removeItem(MUST_CHANGE_PASSWORD_KEY)
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
    const storageType: StorageType = remember
      ? 'local'
      : 'session'

    const storage = getStorageByType(storageType)

    // Xóa authentication cũ ở cả hai storage
    clearStorage(localStorage)
    clearStorage(sessionStorage)

    localStorage.removeItem(STORAGE_TYPE_KEY)
    sessionStorage.removeItem(STORAGE_TYPE_KEY)

    // Ghi nhớ nơi lưu auth
    localStorage.setItem(
      STORAGE_TYPE_KEY,
      storageType,
    )

    storage.setItem(
      ACCESS_TOKEN_KEY,
      accessToken,
    )

    storage.setItem(
      ACCESS_TOKEN_EXPIRES_AT_KEY,
      accessTokenExpiresAt,
    )

    storage.setItem(
      ANTI_CSRF_TOKEN_KEY,
      antiCsrfToken,
    )

    storage.setItem(
      ROLES_KEY,
      JSON.stringify(roles),
    )

    storage.setItem(
      PERMISSIONS_KEY,
      JSON.stringify(permissions),
    )

    storage.setItem(
      MUST_CHANGE_PASSWORD_KEY,
      String(mustChangePassword),
    )
  },

  /**
   * Cập nhật Access Token sau khi refresh.
   *
   * Không thay đổi Refresh Token vì Refresh Token
   * được quản lý hoàn toàn bởi HttpOnly Cookie.
   */
  updateAccessToken: (
    accessToken: string,
    accessTokenExpiresAt: string,
  ) => {
    const storage = getStorage()

    storage.setItem(
      ACCESS_TOKEN_KEY,
      accessToken,
    )

    storage.setItem(
      ACCESS_TOKEN_EXPIRES_AT_KEY,
      accessTokenExpiresAt,
    )
  },

  getAccessToken: (): string | null => {
    return getStorage().getItem(
      ACCESS_TOKEN_KEY,
    )
  },

  getAccessTokenExpiresAt: (): string | null => {
    return getStorage().getItem(
      ACCESS_TOKEN_EXPIRES_AT_KEY,
    )
  },

  getAntiCsrfToken: (): string | null => {
    return getStorage().getItem(
      ANTI_CSRF_TOKEN_KEY,
    )
  },

  getRoles: (): string[] => {
    const roles = getStorage().getItem(
      ROLES_KEY,
    )

    if (!roles) {
      return []
    }

    try {
      const parsed = JSON.parse(roles)

      return Array.isArray(parsed)
        ? parsed
        : []
    } catch {
      return []
    }
  },

  getPermissions: (): string[] => {
    const permissions =
      getStorage().getItem(
        PERMISSIONS_KEY,
      )

    if (!permissions) {
      return []
    }

    try {
      const parsed = JSON.parse(permissions)

      return Array.isArray(parsed)
        ? parsed
        : []
    } catch {
      return []
    }
  },

  mustChangePassword: (): boolean => {
    return getStorage().getItem(MUST_CHANGE_PASSWORD_KEY) === 'true'
  },

  completePasswordChange: () => {
    localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, 'false')
    sessionStorage.setItem(MUST_CHANGE_PASSWORD_KEY, 'false')
  },

  clearAuth: () => {
    clearStorage(localStorage)
    clearStorage(sessionStorage)

    localStorage.removeItem(
      STORAGE_TYPE_KEY,
    )

    sessionStorage.removeItem(
      STORAGE_TYPE_KEY,
    )
  },

  isAuthenticated: (): boolean => {
    return !!authStorage.getAccessToken()
  },
  
   refreshAccessToken: async (): Promise<string> => {
    try {
      // Call API endpoint refresh token
      // Backend sẽ set cookie mới + return access token mới
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
        {}, // body có thể trống, Backend lấy refresh token từ cookie
        {
          withCredentials: true,
          timeout: 10000,
        }
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

      // Update vào storage
      authStorage.updateAccessToken(
        accessToken,
        accessTokenExpiresAt,
      )

      // Update CSRF token nếu có
      if (antiCsrfToken) {
        const storage = getStorage()
        storage.setItem(ANTI_CSRF_TOKEN_KEY, antiCsrfToken)
      }

      // Update roles/permissions nếu có thay đổi
      if (roles || permissions) {
        const storage = getStorage()
        if (roles) {
          storage.setItem(ROLES_KEY, JSON.stringify(roles))
        }
        if (permissions) {
          storage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
        }
      }

      return accessToken
    } catch (error) {
      // Refresh thất bại = Refresh Token hết hạn
      authStorage.clearAuth()
      throw error
    }
  } , 
  // logout 
  logout: async (reason?: string): Promise<void> => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
      { reason },
      {
        withCredentials: true,
        timeout: 10000,
      },
    )
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    authStorage.clearAuth()
  }
},
}