export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  workspace_id: string;
  epic_id?: string;
  requirement_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  due_date?: string;
  tags?: string[];
  position?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  workspace_id: string;
  epic_id?: string;
  requirement_id?: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  due_date?: string;
  tags?: string[];
  position?: number;
  created_by: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  due_date?: string;
  tags?: string[];
  position?: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  epic_id?: string;
  requirement_id?: string;
  search?: string;
}

export interface TaskSortOptions {
  field: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'position';
  order: 'asc' | 'desc';
}
