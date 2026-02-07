export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  settings?: Record<string, any>;
}

export interface WorkspaceCreate {
  name: string;
  description?: string;
  owner_id: string;
  settings?: Record<string, any>;
}

export interface WorkspaceUpdate {
  name?: string;
  description?: string;
  settings?: Record<string, any>;
}
