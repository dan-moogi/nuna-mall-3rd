import axiosInstance from './axiosInstance'

export const paymentApi = {
  prepare: (orderId)           => axiosInstance.post('/payment/prepare', { orderId }),
  confirm: (paymentData)       => axiosInstance.post('/payment/confirm', paymentData),
  cancel:  (orderId, reason)   => axiosInstance.post('/payment/cancel', { orderId, reason }),
}
