export type EpicStatus = 'draft' | 'active' | 'completed' | 'archived';
export type EpicPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Epic {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  status: EpicStatus;
  priority: EpicPriority;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EpicCreate {
  workspace_id: string;
  title: string;
  description?: string;
  status?: EpicStatus;
  priority?: EpicPriority;
  created_by: string;
}

export interface EpicUpdate {
  title?: string;
  description?: string;
  status?: EpicStatus;
  priority?: EpicPriority;
}
