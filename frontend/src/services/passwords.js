import api from './api';

export const passwordService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);

    const response = await api.get(`/passwords?${params.toString()}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/passwords/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/passwords', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/passwords/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/passwords/${id}`);
    return response.data;
  },
};
