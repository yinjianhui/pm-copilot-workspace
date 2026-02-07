import { api } from './api';
import type { Epic, CreateEpicRequest, UpdateEpicRequest } from '../types/epic';

export const epicService = {
  // Get all epics for a workspace
  getEpicsByWorkspace: async (workspaceId: string): Promise<Epic[]> => {
    const response = await api.get(`/workspaces/${workspaceId}/epics`);
    return response.data;
  },

  // Get a specific epic
  getEpic: async (epicId: string): Promise<Epic> => {
    const response = await api.get(`/epics/${epicId}`);
    return response.data;
  },

  // Create a new epic
  createEpic: async (workspaceId: string, data: CreateEpicRequest): Promise<Epic> => {
    const response = await api.post(`/workspaces/${workspaceId}/epics`, data);
    return response.data;
  },

  // Update an epic
  updateEpic: async (epicId: string, data: UpdateEpicRequest): Promise<Epic> => {
    const response = await api.put(`/epics/${epicId}`, data);
    return response.data;
  },

  // Delete an epic
  deleteEpic: async (epicId: string): Promise<void> => {
    await api.delete(`/epics/${epicId}`);
  },
};
