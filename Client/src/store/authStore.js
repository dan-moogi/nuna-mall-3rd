import { create } from 'zustand'
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const useAuthStore = create((set, get) => ({
  user:        null,
  accessToken: null,
  isLoggedIn:  false,
  authLoading: true,   // initAuth 완료 전까지 true

  setUser:  (user)  => set({ user }),
  setToken: (token) => set({ accessToken: token, isLoggedIn: true }),

  // axiosInstance를 거치지 않고 axios 직접 호출 → 순환 참조 방지
  initAuth: async () => {
    try {
      const { data: refreshData } = await axios.post(
        `${BASE}/auth/refresh`, {}, { withCredentials: true }
      )
      set({ accessToken: refreshData.accessToken, isLoggedIn: true })

      const { data: meData } = await axios.get(`${BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${refreshData.accessToken}` },
        withCredentials: true,
      })
      set({ user: meData.user })
    } catch {
      set({ user: null, accessToken: null, isLoggedIn: false })
    } finally {
      set({ authLoading: false })
    }
  },

  logout: async () => {
    try {
      const token = get().accessToken
      await axios.post(
        `${BASE}/auth/logout`, {},
        {
          headers:        token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      )
    } catch { /* 무시 */ } finally {
      set({ user: null, accessToken: null, isLoggedIn: false })
    }
  },
}))

export default useAuthStore
