import api from './axiosConfig'

export const categoryApi = {
  getAll:       ()       => api.get('/categories'),
  adminGetAll:  ()       => api.get('/admin/categories'),
  adminCreate:  (data)   => api.post('/admin/categories', data),
  adminUpdate:  (id, data) => api.put(`/admin/categories/${id}`, data),
  adminDelete:  (id)     => api.delete(`/admin/categories/${id}`),
}
