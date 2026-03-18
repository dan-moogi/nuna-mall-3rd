import axios from 'axios'
import useAuthStore from '../store/authStore'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Request 인터셉터: accessToken 헤더 주입
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response 인터셉터: 401 시 토큰 갱신 후 재시도
axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err)
    }
    original._retry = true
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      useAuthStore.getState().setToken(data.accessToken)
      original.headers.Authorization = `Bearer ${data.accessToken}`
      return axiosInstance(original)
    } catch (_) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(err)
    }
  }
)

export default axiosInstance
