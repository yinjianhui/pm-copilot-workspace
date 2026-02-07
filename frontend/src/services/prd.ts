import { api } from './api';
import type { PRD, CreatePRDRequest, UpdatePRDRequest } from '../types/prd';

export const prdService = {
  // Get PRD for a requirement
  getPRD: async (requirementId: string): Promise<PRD> => {
    const response = await api.get(`/requirements/${requirementId}/prd`);
    return response.data;
  },

  // Create a new PRD
  createPRD: async (requirementId: string, data: CreatePRDRequest): Promise<PRD> => {
    const response = await api.post(`/requirements/${requirementId}/prd`, data);
    return response.data;
  },

  // Update an existing PRD
  updatePRD: async (prdId: string, data: UpdatePRDRequest): Promise<PRD> => {
    const response = await api.put(`/prds/${prdId}`, data);
    return response.data;
  },

  // Delete a PRD
  deletePRD: async (prdId: string): Promise<void> => {
    await api.delete(`/prds/${prdId}`);
  },

  // Generate PRD using AI
  generatePRD: async (requirementId: string, prompt: string): Promise<PRD> => {
    const response = await api.post(`/requirements/${requirementId}/prd/generate`, { prompt });
    return response.data;
  },
};
