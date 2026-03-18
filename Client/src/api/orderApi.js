import axiosInstance from './axiosInstance'

export const orderApi = {
  create:  (data) => axiosInstance.post('/orders', data),
  getAll:  ()     => axiosInstance.get('/orders'),
  getById: (id)   => axiosInstance.get('/orders/' + id),
  cancel:  (id)   => axiosInstance.put('/orders/' + id + '/cancel'),
}
