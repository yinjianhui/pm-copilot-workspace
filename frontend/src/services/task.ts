import apiClient from './api';
import { Task, TaskCreate, TaskUpdate, TaskFilters, TaskSortOptions } from '../types/task';

export const taskService = {
  async getAll(
    workspaceId: string,
    filters?: TaskFilters,
    sort?: TaskSortOptions,
    skip = 0,
    limit = 100
  ): Promise<Task[]> {
    const params: any = { skip, limit };

    if (filters) {
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.assignee_id) params.assignee_id = filters.assignee_id;
      if (filters.epic_id) params.epic_id = filters.epic_id;
      if (filters.requirement_id) params.requirement_id = filters.requirement_id;
      if (filters.search) params.search = filters.search;
    }

    if (sort) {
      params.sort_by = sort.field;
      params.sort_order = sort.order;
    }

    const response = await apiClient.get(`/workspaces/${workspaceId}/tasks`, { params });
    return response.data;
  },

  async getById(workspaceId: string, id: string): Promise<Task> {
    const response = await apiClient.get(`/workspaces/${workspaceId}/tasks/${id}`);
    return response.data;
  },

  async create(workspaceId: string, data: TaskCreate): Promise<Task> {
    const response = await apiClient.post(`/workspaces/${workspaceId}/tasks`, data);
    return response.data;
  },

  async update(workspaceId: string, id: string, data: TaskUpdate): Promise<Task> {
    const response = await apiClient.put(`/workspaces/${workspaceId}/tasks/${id}`, data);
    return response.data;
  },

  async patch(workspaceId: string, id: string, data: Partial<TaskUpdate>): Promise<Task> {
    const response = await apiClient.patch(`/workspaces/${workspaceId}/tasks/${id}`, data);
    return response.data;
  },

  async delete(workspaceId: string, id: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/tasks/${id}`);
  },

  async updateStatus(workspaceId: string, id: string, status: Task['status']): Promise<Task> {
    const response = await apiClient.patch(`/workspaces/${workspaceId}/tasks/${id}`, { status });
    return response.data;
  },

  async updatePriority(workspaceId: string, id: string, priority: Task['priority']): Promise<Task> {
    const response = await apiClient.patch(`/workspaces/${workspaceId}/tasks/${id}`, { priority });
    return response.data;
  },

  async bulkUpdateStatus(
    workspaceId: string,
    taskIds: string[],
    status: Task['status']
  ): Promise<Task[]> {
    const response = await apiClient.post(`/workspaces/${workspaceId}/tasks/bulk-status`, {
      task_ids: taskIds,
      status,
    });
    return response.data;
  },
};
