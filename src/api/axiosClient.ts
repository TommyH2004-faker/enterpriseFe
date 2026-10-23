import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { authStorage } from '../services/authStorage'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
})

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// Các endpoint này tự xử lý 401 của chính chúng:
// - login 401 = sai tài khoản/mật khẩu (không được redirect)
// - refresh 401 = hết đường sống (không được refresh lại -> tránh vòng lặp)
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh']

const isAuthEndpoint = (url?: string): boolean =>
  !!url && AUTH_ENDPOINTS.some((path) => url.includes(path))

/** Xóa toàn bộ dữ liệu đăng nhập và đưa người dùng về trang login. */
const forceLogout = () => {
  authStorage.clearAuth()

  if (window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error || !token) promise.reject(error)
    else promise.resolve(token)
  })
  failedQueue = []
}

// ------------------------------------------------------------
// Request interceptor
// ------------------------------------------------------------
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = authStorage.getAccessToken()

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    if (config.data instanceof FormData) {
      // Không ép JSON, để trình duyệt tự đặt multipart boundary.
      config.headers.delete('Content-Type')
    } else if (!config.headers.get('Content-Type')) {
      config.headers.set('Content-Type', 'application/json')
    }

    return config
  },
  (error) => Promise.reject(error),
)

// ------------------------------------------------------------
// Response interceptor
// ------------------------------------------------------------
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined

    if (!originalRequest) return Promise.reject(error)

    // 403: đã đăng nhập nhưng không đủ quyền.
    if (error.response?.status === 403) {
      if (window.location.pathname !== '/403') {
        window.location.href = '/403'
      }
      return Promise.reject(error)
    }

    if (error.response?.status !== 401) return Promise.reject(error)

    // 401 từ login/refresh: để nơi gọi tự xử lý.
    // Riêng refresh thất bại nghĩa là phiên đã chết hẳn -> đăng xuất.
    if (isAuthEndpoint(originalRequest.url)) {
      if (originalRequest.url?.includes('/auth/refresh')) forceLogout()
      return Promise.reject(error)
    }

    // Đã thử refresh + retry mà vẫn 401 (ví dụ session bị revoke): đăng xuất.
    if (originalRequest._retry) {
      forceLogout()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    // Đang có một lần refresh chạy: xếp hàng chờ token mới.
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return axiosClient(originalRequest)
      })
    }

    isRefreshing = true

    try {
      const newToken = await authStorage.refreshAccessToken()
      processQueue(null, newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return await axiosClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      forceLogout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default axiosClient