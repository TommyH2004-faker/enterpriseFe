const ACCESS_TOKEN_KEY = 'accessToken'
const ACCESS_TOKEN_EXPIRES_AT_KEY = 'accessTokenExpiresAt'
const ANTI_CSRF_TOKEN_KEY = 'antiCsrfToken'
const ROLES_KEY = 'roles'
const PERMISSIONS_KEY = 'permissions'

type StorageType = 'local' | 'session'

const getStorage = (): Storage => {
  const storageType = localStorage.getItem('storageType')

  if (storageType === 'local') {
    return localStorage
  }

  return sessionStorage
}

export const authStorage = {
  saveAuth: (
    accessToken: string,
    accessTokenExpiresAt: string,
    antiCsrfToken: string,
    roles: string[],
    permissions: string[],
    remember: boolean,
  ) => {
    const storage = remember ? localStorage : sessionStorage

    localStorage.removeItem('storageType')
    sessionStorage.removeItem('storageType')

    localStorage.setItem(
      'storageType',
      remember ? 'local' : 'session',
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
  },

  getAccessToken: (): string | null => {
    return getStorage().getItem(ACCESS_TOKEN_KEY)
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
    const roles = getStorage().getItem(ROLES_KEY)

    if (!roles) {
      return []
    }

    try {
      return JSON.parse(roles)
    } catch {
      return []
    }
  },

  getPermissions: (): string[] => {
    const permissions =
      getStorage().getItem(PERMISSIONS_KEY)

    if (!permissions) {
      return []
    }

    try {
      return JSON.parse(permissions)
    } catch {
      return []
    }
  },

  clearAuth: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(
      ACCESS_TOKEN_EXPIRES_AT_KEY,
    )
    localStorage.removeItem(
      ANTI_CSRF_TOKEN_KEY,
    )
    localStorage.removeItem(ROLES_KEY)
    localStorage.removeItem(PERMISSIONS_KEY)
    localStorage.removeItem('storageType')

    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(
      ACCESS_TOKEN_EXPIRES_AT_KEY,
    )
    sessionStorage.removeItem(
      ANTI_CSRF_TOKEN_KEY,
    )
    sessionStorage.removeItem(ROLES_KEY)
    sessionStorage.removeItem(PERMISSIONS_KEY)
    sessionStorage.removeItem('storageType')
  },

  isAuthenticated: (): boolean => {
    return !!authStorage.getAccessToken()
  },
}