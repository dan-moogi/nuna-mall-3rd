import { create } from 'zustand'
import { productApi } from '../api/productApi'

const useProductStore = create((set) => ({
  homeData: { best: [], newSale: [], pantsBest: [], cody: [] },
  products:    [],
  total:       0,
  currentPage: 1,
  totalPages:  1,
  loading:     false,
  error:       null,

  fetchHomeData: async () => {
    set({ loading: true, error: null })
    try {
      const [best, newSale, pantsBest, cody] = await Promise.all([
        productApi.getByTag('best',       8),
        productApi.getByTag('new',        8),
        productApi.getByTag('pants-best', 8),
        productApi.getByTag('cody',       8),
      ])
      set({
        homeData: {
          best:      best.data.products      ?? [],
          newSale:   newSale.data.products   ?? [],
          pantsBest: pantsBest.data.products ?? [],
          cody:      cody.data.products      ?? [],
        },
        loading: false,
      })
    } catch (err) {
      console.error('[productStore] fetchHomeData error:', err.message)
      set({ loading: false, error: err.message })
    }
  },

  fetchProducts: async (params) => {
    set({ loading: true, error: null })
    try {
      const { data } = await productApi.getAll(params)
      set({
        products:    data.products    ?? [],
        total:       data.total       ?? 0,
        currentPage: data.page        ?? 1,
        totalPages:  data.totalPages  ?? 1,
        loading:     false,
      })
    } catch (err) {
      console.error('[productStore] fetchProducts error:', err.message)
      set({ loading: false, error: err.message })
    }
  },
}))

export default useProductStore
