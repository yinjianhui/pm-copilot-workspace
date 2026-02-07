import apiClient from './api';
import { Workspace, WorkspaceCreate, WorkspaceUpdate } from '../types/workspace';

export const workspaceService = {
  async getAll(skip = 0, limit = 100): Promise<Workspace[]> {
    const response = await apiClient.get('/workspaces', {
      params: { skip, limit },
    });
    return response.data;
  },

  async getById(id: string): Promise<Workspace> {
    const response = await apiClient.get(`/workspaces/${id}`);
    return response.data;
  },

  async create(data: WorkspaceCreate): Promise<Workspace> {
    const response = await apiClient.post('/workspaces', data);
    return response.data;
  },

  async update(id: string, data: WorkspaceUpdate): Promise<Workspace> {
    const response = await apiClient.put(`/workspaces/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/workspaces/${id}`);
  },
};
