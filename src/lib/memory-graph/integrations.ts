/**
 * Memory Graph Integration Helpers
 * 
 * Provides React hooks, API handlers, and other integration utilities
 * for using the memory graph system in applications.
 */

import { useState, useCallback, useEffect } from 'react';
import { MemoryGraph } from './memory-graph';
import { IngestorAgent } from './ingestor-agent';
import { PlannerAgent } from './planner-agent';
import type { 
  GraphQuery, 
  GraphQueryResult, 
  RiskAnalysis,
  ActionRecommendation,
  DependencyAnalysis,
  ImpactAnalysis
} from './types';

// -------------------- REACT HOOKS --------------------

export interface UseMemoryGraphReturn {
  graph: MemoryGraph;
  ingestor: IngestorAgent;
  planner: PlannerAgent;
  query: (params: GraphQuery) => GraphQueryResult;
  ingestText: (text: string, source: string) => Promise<void>;
  analyzeRisks: (serviceId: string) => Promise<RiskAnalysis>;
  getRecommendations: (context: string) => Promise<ActionRecommendation[]>;
  analyzeDependencies: (entityId: string) => DependencyAnalysis;
  analyzeImpact: (entityId: string) => ImpactAnalysis;
  stats: ReturnType<MemoryGraph['getStats']>;
}

export function useMemoryGraph(): UseMemoryGraphReturn {
  const [graph] = useState(() => new MemoryGraph());
  const [ingestor] = useState(() => new IngestorAgent(graph));
  const [planner] = useState(() => new PlannerAgent(graph));
  const [stats, setStats] = useState(() => graph.getStats());
  
  const query = useCallback((params: GraphQuery) => {
    return graph.query(params);
  }, [graph]);
  
  const ingestText = useCallback(async (text: string, source: string) => {
    await ingestor.ingestText(text, source);
    setStats(graph.getStats());
  }, [ingestor, graph]);
  
  const analyzeRisks = useCallback(async (serviceId: string) => {
    return await planner.analyzeRisks(serviceId);
  }, [planner]);
  
  const getRecommendations = useCallback(async (context: string) => {
    return await planner.suggestNextAction(context);
  }, [planner]);
  
  const analyzeDependencies = useCallback((entityId: string) => {
    return planner.analyzeDependencies(entityId);
  }, [planner]);
  
  const analyzeImpact = useCallback((entityId: string) => {
    return planner.analyzeImpact(entityId);
  }, [planner]);
  
  // Update stats when graph changes
  useEffect(() => {
    const updateStats = () => setStats(graph.getStats());
    // In a real implementation, you might want to add event listeners
    // to the graph for automatic updates
    updateStats();
  }, [graph]);
  
  return {
    graph,
    ingestor,
    planner,
    query,
    ingestText,
    analyzeRisks,
    getRecommendations,
    analyzeDependencies,
    analyzeImpact,
    stats
  };
}

// -------------------- API HANDLERS --------------------

export interface GraphAPIRequest {
  action: 'ingest' | 'query' | 'analyze-risks' | 'get-recommendations' | 'analyze-dependencies' | 'analyze-impact';
  data: any;
}

export interface GraphAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class GraphAPIHandler {
  constructor(
    private graph: MemoryGraph,
    private ingestor: IngestorAgent,
    private planner: PlannerAgent
  ) {}
  
  async handleRequest(request: GraphAPIRequest): Promise<GraphAPIResponse> {
    try {
      switch (request.action) {
        case 'ingest':
          await this.ingestor.ingestText(request.data.text, request.data.source);
          return { success: true, data: { message: 'Text ingested successfully' } };
          
        case 'query':
          const results = this.graph.query(request.data.query);
          return { success: true, data: results };
          
        case 'analyze-risks':
          const risks = await this.planner.analyzeRisks(request.data.serviceId);
          return { success: true, data: risks };
          
        case 'get-recommendations':
          const recommendations = await this.planner.suggestNextAction(request.data.context);
          return { success: true, data: recommendations };
          
        case 'analyze-dependencies':
          const depAnalysis = this.planner.analyzeDependencies(request.data.entityId);
          return { success: true, data: depAnalysis };
          
        case 'analyze-impact':
          const impactAnalysis = this.planner.analyzeImpact(request.data.entityId);
          return { success: true, data: impactAnalysis };
          
        default:
          return { success: false, error: 'Unknown action' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Express.js middleware
export function createGraphMiddleware(
  graph: MemoryGraph,
  ingestor: IngestorAgent,
  planner: PlannerAgent
) {
  const handler = new GraphAPIHandler(graph, ingestor, planner);
  
  return async (req: any, res: any, next: any) => {
    if (req.path.startsWith('/api/graph')) {
      try {
        const request: GraphAPIRequest = req.body;
        const response = await handler.handleRequest(request);
        
        if (response.success) {
          res.json(response);
        } else {
          res.status(400).json(response);
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    } else {
      next();
    }
  };
}

// -------------------- STORAGE ADAPTERS --------------------

export interface StorageAdapter {
  save(graph: MemoryGraph): Promise<void>;
  load(): Promise<MemoryGraph>;
  exists(): Promise<boolean>;
}

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private key: string = 'memory-graph') {}
  
  async save(graph: MemoryGraph): Promise<void> {
    const data = graph.toJSON();
    localStorage.setItem(this.key, data);
  }
  
  async load(): Promise<MemoryGraph> {
    const data = localStorage.getItem(this.key);
    if (!data) {
      return new MemoryGraph();
    }
    return MemoryGraph.fromJSON(data);
  }
  
  async exists(): Promise<boolean> {
    return localStorage.getItem(this.key) !== null;
  }
}

export class FileStorageAdapter implements StorageAdapter {
  constructor(private filePath: string) {}
  
  async save(graph: MemoryGraph): Promise<void> {
    const data = graph.toJSON();
    // In a Node.js environment, you would use fs.writeFile
    // For browser environments, this would need to be adapted
    if (typeof window === 'undefined') {
      const fs = await import('fs/promises');
      await fs.writeFile(this.filePath, data, 'utf-8');
    } else {
      throw new Error('File storage not available in browser environment');
    }
  }
  
  async load(): Promise<MemoryGraph> {
    if (typeof window === 'undefined') {
      const fs = await import('fs/promises');
      try {
        const data = await fs.readFile(this.filePath, 'utf-8');
        return MemoryGraph.fromJSON(data);
      } catch (error) {
        return new MemoryGraph();
      }
    } else {
      throw new Error('File storage not available in browser environment');
    }
  }
  
  async exists(): Promise<boolean> {
    if (typeof window === 'undefined') {
      const fs = await import('fs/promises');
      try {
        await fs.access(this.filePath);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

// -------------------- PERSISTENCE HOOKS --------------------

export function usePersistedMemoryGraph(
  adapter: StorageAdapter
): UseMemoryGraphReturn & {
  save: () => Promise<void>;
  load: () => Promise<void>;
  isLoading: boolean;
} {
  const memoryGraph = useMemoryGraph();
  const [isLoading, setIsLoading] = useState(false);
  
  const save = useCallback(async () => {
    setIsLoading(true);
    try {
      await adapter.save(memoryGraph.graph);
    } finally {
      setIsLoading(false);
    }
  }, [adapter, memoryGraph.graph]);
  
  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedGraph = await adapter.load();
      // Replace the current graph with the loaded one
      memoryGraph.graph.clear();
      const data = JSON.parse(loadedGraph.toJSON());
      
      // Re-add all nodes and edges
      for (const node of data.nodes) {
        memoryGraph.graph.addNode(node);
      }
      for (const edge of data.edges) {
        memoryGraph.graph.addEdge(edge);
      }
    } finally {
      setIsLoading(false);
    }
  }, [adapter, memoryGraph.graph]);
  
  // Auto-load on mount
  useEffect(() => {
    const autoLoad = async () => {
      if (await adapter.exists()) {
        await load();
      }
    };
    autoLoad();
  }, [adapter, load]);
  
  return {
    ...memoryGraph,
    save,
    load,
    isLoading
  };
}

// -------------------- UTILITY FUNCTIONS --------------------

export function createMemoryGraphSystem() {
  const graph = new MemoryGraph();
  const ingestor = new IngestorAgent(graph);
  const planner = new PlannerAgent(graph);
  
  return { graph, ingestor, planner };
}

export function createGraphAPIHandler(
  graph?: MemoryGraph,
  ingestor?: IngestorAgent,
  planner?: PlannerAgent
) {
  if (!graph || !ingestor || !planner) {
    const system = createMemoryGraphSystem();
    return new GraphAPIHandler(system.graph, system.ingestor, system.planner);
  }
  
  return new GraphAPIHandler(graph, ingestor, planner);
}

// -------------------- EXAMPLE USAGE --------------------

export const examples = {
  // Basic usage
  basicUsage: () => {
    const { graph, ingestor, planner } = useMemoryGraph();
    
    // Ingest some data
    ingestor.ingestText(
      "crm7 service requires SUPABASE_URL and depends on postgres database",
      "deployment-docs"
    );
    
    // Query the graph
    const services = graph.query({ nodeType: 'Service' });
    console.log('Services:', services.nodes);
    
    // Analyze risks
    planner.analyzeRisks('service:crm7').then(risks => {
      console.log('Risk analysis:', risks);
    });
  },
  
  // Persistence usage
  persistenceUsage: () => {
    const adapter = new LocalStorageAdapter('my-graph');
    const {
      graph,
      ingestor,
      planner,
      save,
      load,
      isLoading
    } = usePersistedMemoryGraph(adapter);
    
    // Data is automatically loaded on mount
    // Save manually when needed
    const handleSave = async () => {
      await save();
      console.log('Graph saved!');
    };
    
    return { graph, ingestor, planner, handleSave, isLoading };
  }
};