import axiosInstance from './axiosInstance'

export const cartApi = {
  get:            ()            => axiosInstance.get('/cart'),
  add:            (data)        => axiosInstance.post('/cart/add', data),
  updateQuantity: (itemId, qty) => axiosInstance.put('/cart/' + itemId, { quantity: qty }),
  remove:         (itemId)      => axiosInstance.delete('/cart/' + itemId),
  clear:          ()            => axiosInstance.delete('/cart'),
}
