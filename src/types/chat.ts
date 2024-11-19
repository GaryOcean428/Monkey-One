export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime: number;
  completedTime?: number;
  warnings?: string[];
  metadata?: Record<string, unknown>;
}

export interface Action {
  id: string;
  type: 'file' | 'schedule' | 'integration' | 'api';
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface Integration {
  id: string;
  type: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  config?: Record<string, unknown>;
  lastSync?: number;
}