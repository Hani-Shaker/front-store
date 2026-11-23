import { api } from '../lib/api.js';

export const productService = {
  getAll: () => api('/api/products'),
  getById: (id) => api(`/api/products/${id}`),
  create: (data) => api('/api/products', { method: 'POST', body: data, admin: true }),
  update: (id, data) => api(`/api/products/${id}`, { method: 'PUT', body: data, admin: true }),
  delete: (id) => api(`/api/products/${id}`, { method: 'DELETE', admin: true }),
};
