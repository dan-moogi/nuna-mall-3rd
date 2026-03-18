import { create } from 'zustand'
import { cartApi } from '../api/cartApi'
import useAuthStore from './authStore'
import useToastStore from './toastStore'

const calcCount = (items) => items.reduce((sum, i) => sum + i.quantity, 0)

const useCartStore = create((set) => ({
  items:      [],
  totalPrice: 0,
  totalCount: 0,
  loading:    false,

  fetchCart: async () => {
    if (!useAuthStore.getState().isLoggedIn) return
    set({ loading: true })
    try {
      const { data } = await cartApi.get()
      const items = data.cart.items ?? []
      set({
        items,
        totalPrice: data.cart.totalPrice ?? 0,
        totalCount: calcCount(items),
        loading:    false,
      })
    } catch {
      set({ loading: false })
    }
  },

  addToCart: async (itemData) => {
    try {
      const { data } = await cartApi.add(itemData)
      const items = data.cart.items ?? []
      set({
        items,
        totalPrice: data.cart.totalPrice ?? 0,
        totalCount: calcCount(items),
      })
      useToastStore.getState().showToast('장바구니에 담겼습니다! 🛍️')
    } catch (err) {
      useToastStore.getState().showToast(
        err.response?.data?.message || '장바구니 추가에 실패했습니다.',
        'error'
      )
    }
  },

  updateQuantity: async (itemId, qty) => {
    try {
      const { data } = await cartApi.updateQuantity(itemId, qty)
      const items = data.cart.items ?? []
      set({
        items,
        totalPrice: data.cart.totalPrice ?? 0,
        totalCount: calcCount(items),
      })
    } catch (err) {
      useToastStore.getState().showToast(
        err.response?.data?.message || '수량 변경에 실패했습니다.',
        'error'
      )
    }
  },

  removeItem: async (itemId) => {
    try {
      const { data } = await cartApi.remove(itemId)
      const items = data.cart.items ?? []
      set({
        items,
        totalPrice: data.cart.totalPrice ?? 0,
        totalCount: calcCount(items),
      })
    } catch (err) {
      useToastStore.getState().showToast(
        err.response?.data?.message || '삭제에 실패했습니다.',
        'error'
      )
    }
  },

  clearCart: async () => {
    try {
      await cartApi.clear()
      set({ items: [], totalPrice: 0, totalCount: 0 })
    } catch { /* 무시 */ }
  },
}))

export default useCartStore
