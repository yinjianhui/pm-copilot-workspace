export type RequirementStatus = 'clarifying' | 'clarified' | 'in_progress' | 'completed';

export interface Requirement {
  id: string;
  epic_id: string;
  title: string;
  status: RequirementStatus;
  checklist_state?: Record<string, any>;
  conversation_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RequirementCreate {
  epic_id: string;
  title: string;
  status?: RequirementStatus;
  checklist_state?: Record<string, any>;
  created_by: string;
}

export interface RequirementUpdate {
  title?: string;
  status?: RequirementStatus;
  checklist_state?: Record<string, any>;
}
