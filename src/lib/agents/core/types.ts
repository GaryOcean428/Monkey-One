interface PatternStep {
  action: string;
  weight?: number;  // Optional weight for importance
  threshold?: number;  // Optional matching threshold
}

interface Pattern {
  sequence: PatternStep[];
  name: string;
  description?: string;
}

interface MatchResult {
  match: boolean;
  confidence: number;
  step: PatternStep;
} 