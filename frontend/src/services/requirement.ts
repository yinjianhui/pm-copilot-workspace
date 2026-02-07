import apiClient from './api';
import { Requirement, RequirementCreate, RequirementUpdate } from '../types/requirement';

export const requirementService = {
  async getAll(epicId?: string, skip = 0, limit = 100): Promise<Requirement[]> {
    const params: any = { skip, limit };
    if (epicId) params.epic_id = epicId;

    const response = await apiClient.get('/requirements', { params });
    return response.data;
  },

  async getById(id: string): Promise<Requirement> {
    const response = await apiClient.get(`/requirements/${id}`);
    return response.data;
  },

  async create(data: RequirementCreate): Promise<Requirement> {
    const response = await apiClient.post('/requirements', data);
    return response.data;
  },

  async update(id: string, data: RequirementUpdate): Promise<Requirement> {
    const response = await apiClient.put(`/requirements/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/requirements/${id}`);
  },
};
