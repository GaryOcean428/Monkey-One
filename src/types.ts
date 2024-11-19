
export type WorkerConfig = {
  id: string;
  type: string;
  options?: Record<string, unknown>;
};

export type WorkerId = string;

export type WorkerStatus = {
  id: WorkerId;
  status: 'running' | 'stopped' | 'error';
  lastHeartbeat?: Date;
};

export type AgentType = 'orchestrator' | 'coder' | 'websurfer' | 'filesurfer';

export type SessionStore = {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
};

export type AgentState = {
  id: string;
  type: AgentType;
  status: string;
  data: Record<string, unknown>;
};

export interface Tool {
  name: string;
  description: string;
  execute(args: Record<string, unknown>): Promise<unknown>;
}