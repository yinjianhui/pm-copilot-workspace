export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  requirement_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export type SkillType =
  | 'clarify_requirements'
  | 'generate_prd'
  | 'create_wireframe'
  | 'analyze_competitors'
  | 'extract_tasks'
  | 'suggest_metrics'
  | 'review_completeness'
  | 'search_knowledge';
