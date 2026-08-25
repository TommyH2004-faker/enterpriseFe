import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'
import { authStorage } from '../services/authStorage'


const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },

  withCredentials: true,
})

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken =
      authStorage.getAccessToken()

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`
    }

    return config
  },
)

axiosClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    return Promise.reject(error)
  },
)

export default axiosClient