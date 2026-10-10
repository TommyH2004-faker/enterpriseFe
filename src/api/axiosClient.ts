import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { authStorage } from '../services/authStorage'


const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = authStorage.getAccessToken()

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    if (config.data instanceof FormData) {
      // Không ép JSON hoặc tự đặt multipart boundary.
      config.headers.delete('Content-Type')
    } else if (!config.headers.get('Content-Type')) {
      config.headers.set('Content-Type', 'application/json')
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Backend trả 403 khi người dùng đã đăng nhập nhưng không có quyền.
    // Xử lý tại interceptor để mọi service dùng chung một luồng.
    if (error.response?.status === 403) {
      if (window.location.pathname !== '/403') {
        window.location.href = '/403'
      }

      return Promise.reject(error)
    }

    // Token hết hạn + chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang refresh, queue request này
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      // Bắt đầu refresh
      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await authStorage.refreshAccessToken()
        isRefreshing = false
        processQueue(null, newToken)

        // Retry request gốc với token mới
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosClient(originalRequest)
      } catch (err) {
        // Refresh thất bại
        isRefreshing = false
        processQueue(err)
        
        // Redirect login
        window.location.href = '/login'
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosClient