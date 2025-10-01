/**
 * Memory Graph System Types
 * 
 * Defines the core types and interfaces for the multi-agent coordination
 * memory graph system.
 */

export interface Node {
  id: string;
  type: NodeType;
  properties: Record<string, any>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    source?: string;
    confidence?: number;
  };
}

export interface Edge {
  id: string;
  type: EdgeType;
  from: string;
  to: string;
  properties?: Record<string, any>;
  metadata: {
    createdAt: Date;
    strength?: number;
    bidirectional?: boolean;
  };
}

export interface GraphQuery {
  nodeType?: NodeType;
  edgeType?: EdgeType;
  properties?: Record<string, any>;
  depth?: number;
  limit?: number;
}

export type NodeType = 
  | 'Service' | 'Environment' | 'Deployment' | 'Configuration'
  | 'User' | 'Team' | 'Project' | 'Repository'
  | 'Task' | 'Issue' | 'Incident' | 'Error'
  | 'Customer' | 'Feature' | 'Permission'
  | 'Document' | 'API' | 'Database' | 'Secret';

export type EdgeType =
  | 'OWNS' | 'MANAGES' | 'DEPENDS_ON' | 'BLOCKS'
  | 'REQUIRES' | 'PROVIDES' | 'CONNECTS_TO' | 'DEPLOYED_TO'
  | 'PART_OF' | 'AFFECTS' | 'CAUSED_BY' | 'RESOLVED_BY'
  | 'MENTIONS' | 'DUPLICATES' | 'RELATES_TO' | 'NOTIFIES';

export interface GraphQueryResult {
  nodes: Node[];
  edges: Edge[];
}

export interface RiskAnalysis {
  service: string;
  missingConfigurations: string[];
  relatedIncidents: any[];
  dependencies: string[];
  riskScore: number;
}

export interface EntityExtraction {
  id: string;
  type: NodeType;
  properties: Record<string, any>;
}

export interface RelationshipExtraction {
  type: EdgeType;
  from: string;
  to: string;
  properties?: Record<string, any>;
}