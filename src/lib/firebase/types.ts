export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  databaseURL?: string;
  measurementId?: string;
}

export interface BrainState {
  neuralState: Record<string, unknown>;
  emotionalState: Record<string, unknown>;
}

export interface FirebaseCollections {
  brainState: BrainState;
  memories: {
    id: string;
    content: unknown;
    timestamp: number;
  };
}
