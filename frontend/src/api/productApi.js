import api from './axiosConfig'

export const productApi = {

  getAll:  (params) => api.get('/products', { params }),
  getById: (id)     => api.get(`/products/${id}`),

  adminGetAll:     (params) => api.get('/admin/products', { params }),
  adminCreate:     (formData) => api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  adminUpdate:     (id, formData) => api.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  adminDelete:     (id)     => api.delete(`/admin/products/${id}`),
  adminToggle:     (id)     => api.patch(`/admin/products/${id}/toggle`),
  adminLowStock:   (threshold = 5) => api.get('/admin/products/low-stock', { params: { threshold } }),
}
