import api from './axiosConfig'

export const cartApi = {
  getCart:    ()             => api.get('/cart'),
  addItem:    (data)         => api.post('/cart/items', data),
  updateItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId)       => api.delete(`/cart/items/${itemId}`),
  getCount:   ()             => api.get('/cart/count'),
}
