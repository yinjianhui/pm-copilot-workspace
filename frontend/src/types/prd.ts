export interface PRDSection {
  id: string;
  title: string;
  content: string;
  order: number;
  patches?: PRDPatch[];
}

export interface PRDPatch {
  id: string;
  section_id: string;
  content: string;
  status: 'pending' | 'applied' | 'rejected';
  created_at: string;
}

export interface PRD {
  id: string;
  requirement_id: string;
  title: string;
  sections: PRDSection[];
  version: number;
  created_at: string;
  updated_at: string;
}
