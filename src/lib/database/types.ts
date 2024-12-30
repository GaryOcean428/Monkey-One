export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  user_id: string;
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CodeInsight {
  id: string;
  user_id: string;
  file_path: string;
  content: string;
  type: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface LearningMetric {
  id: string;
  user_id: string;
  metric_type: string;
  value: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  steps: Record<string, any>[];
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  name: string;
  content: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type Tables = {
  profiles: Profile;
  experiences: Experience;
  code_insights: CodeInsight;
  learning_metrics: LearningMetric;
  workflows: Workflow;
  documents: Document;
};
