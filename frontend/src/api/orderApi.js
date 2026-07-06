import api from './axiosConfig'

export const orderApi = {

  placeOrder:      (data)   => api.post('/orders', data),
  getMyOrders:     (params) => api.get('/orders/me', { params }),
  getMyOrderById:  (id)     => api.get(`/orders/me/${id}`),

  adminGetAll:     (params) => api.get('/admin/orders', { params }),
  adminGetById:    (id)     => api.get(`/admin/orders/${id}`),
  adminUpdateStatus: (id, data) => api.patch(`/admin/orders/${id}/status`, data),
  adminGetStats:   ()       => api.get('/admin/stats'),
}
