import axiosInstance from './axiosInstance'

export const productApi = {
  getAll:     (params)           => axiosInstance.get('/products',             { params }),
  getById:    (id)               => axiosInstance.get(`/products/${id}`),
  getByTag:   (tag, limit = 8)   => axiosInstance.get(`/products/tag/${tag}`,  { params: { limit } }),
  getRelated: (id)               => axiosInstance.get(`/products/related/${id}`),
  search:     (q, page = 1, limit = 20) => axiosInstance.get('/products/search', { params: { q, page, limit } }),
}
