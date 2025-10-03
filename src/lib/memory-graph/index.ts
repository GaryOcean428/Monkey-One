/**
 * Memory Graph System - Main Export
 *
 * Multi-agent coordination memory graph system for tracking
 * entities, relationships, and providing intelligent analysis.
 */

// Core classes
export { MemoryGraph } from './memory-graph'
export { IngestorAgent } from './ingestor-agent'
export { PlannerAgent } from './planner-agent'

// Types
export type {
  Node,
  Edge,
  NodeType,
  EdgeType,
  GraphQuery,
  GraphQueryResult,
  RiskAnalysis,
  EntityExtraction,
  RelationshipExtraction,
} from './types'

export type { ActionRecommendation, DependencyAnalysis, ImpactAnalysis } from './planner-agent'

// Integration helpers
export {
  useMemoryGraph,
  usePersistedMemoryGraph,
  GraphAPIHandler,
  createGraphMiddleware,
  LocalStorageAdapter,
  FileStorageAdapter,
  createMemoryGraphSystem,
  createGraphAPIHandler,
  examples,
} from './integrations'

export type {
  UseMemoryGraphReturn,
  GraphAPIRequest,
  GraphAPIResponse,
  StorageAdapter,
} from './integrations'

// -------------------- QUICK START EXAMPLES --------------------

/**
 * Basic usage example:
 *
 * ```typescript
 * import { MemoryGraph, IngestorAgent, PlannerAgent } from './memory-graph';
 *
 * const graph = new MemoryGraph();
 * const ingestor = new IngestorAgent(graph);
 * const planner = new PlannerAgent(graph);
 *
 * // Ingest text data
 * await ingestor.ingestText(
 *   "crm7 service requires SUPABASE_URL and depends on postgres database",
 *   "deployment-docs"
 * );
 *
 * // Query the graph
 * const services = graph.query({ nodeType: 'Service' });
 *
 * // Analyze risks
 * const risks = await planner.analyzeRisks('service:crm7');
 * ```
 */

/**
 * React hook usage:
 *
 * ```typescript
 * import { useMemoryGraph } from './memory-graph';
 *
 * function MyComponent() {
 *   const { graph, ingestText, analyzeRisks, stats } = useMemoryGraph();
 *
 *   const handleIngest = async () => {
 *     await ingestText("Some deployment info", "user-input");
 *   };
 *
 *   return (
 *     <div>
 *       <p>Nodes: {stats.nodeCount}, Edges: {stats.edgeCount}</p>
 *       <button onClick={handleIngest}>Ingest Data</button>
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * API handler usage:
 *
 * ```typescript
 * import express from 'express';
 * import { createGraphMiddleware, createMemoryGraphSystem } from './memory-graph';
 *
 * const app = express();
 * const { graph, ingestor, planner } = createMemoryGraphSystem();
 *
 * app.use(express.json());
 * app.use(createGraphMiddleware(graph, ingestor, planner));
 *
 * // Now you can POST to /api/graph with actions like:
 * // { action: 'ingest', data: { text: '...', source: '...' } }
 * // { action: 'query', data: { query: { nodeType: 'Service' } } }
 * ```
 */

/**
 * Persistence usage:
 *
 * ```typescript
 * import { usePersistedMemoryGraph, LocalStorageAdapter } from './memory-graph';
 *
 * function PersistentGraph() {
 *   const adapter = new LocalStorageAdapter('my-graph');
 *   const { graph, save, load, isLoading } = usePersistedMemoryGraph(adapter);
 *
 *   // Graph is automatically loaded on mount
 *   // Call save() to persist changes
 * }
 * ```
 */
