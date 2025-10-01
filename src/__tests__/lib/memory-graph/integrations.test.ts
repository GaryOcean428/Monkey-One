/**
 * Integration Tests for Memory Graph System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useMemoryGraph, 
  GraphAPIHandler, 
  LocalStorageAdapter,
  createMemoryGraphSystem,
  createGraphAPIHandler
} from '../../../lib/memory-graph/integrations';
import { MemoryGraph } from '../../../lib/memory-graph/memory-graph';
import { IngestorAgent } from '../../../lib/memory-graph/ingestor-agent';
import { PlannerAgent } from '../../../lib/memory-graph/planner-agent';

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Memory Graph Integrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useMemoryGraph Hook', () => {
    it('should initialize with empty graph', () => {
      const { result } = renderHook(() => useMemoryGraph());

      expect(result.current.graph).toBeInstanceOf(MemoryGraph);
      expect(result.current.ingestor).toBeInstanceOf(IngestorAgent);
      expect(result.current.planner).toBeInstanceOf(PlannerAgent);
      expect(result.current.stats.nodeCount).toBe(0);
      expect(result.current.stats.edgeCount).toBe(0);
    });

    it('should provide query functionality', () => {
      const { result } = renderHook(() => useMemoryGraph());

      // Add a test node
      act(() => {
        result.current.graph.addNode({
          id: 'test-service',
          type: 'Service',
          properties: { name: 'Test Service' }
        });
      });

      const queryResult = result.current.query({ nodeType: 'Service' });
      expect(queryResult.nodes).toHaveLength(1);
      expect(queryResult.nodes[0].properties.name).toBe('Test Service');
    });

    it('should provide ingestText functionality', async () => {
      const { result } = renderHook(() => useMemoryGraph());

      await act(async () => {
        await result.current.ingestText(
          'The crm service requires DATABASE_URL configuration',
          'test-source'
        );
      });

      const services = result.current.query({ nodeType: 'Service' });
      const configs = result.current.query({ nodeType: 'Configuration' });

      expect(services.nodes.length).toBeGreaterThan(0);
      expect(configs.nodes.length).toBeGreaterThan(0);
    });

    it('should provide risk analysis functionality', async () => {
      const { result } = renderHook(() => useMemoryGraph());

      // Set up test data
      act(() => {
        result.current.graph.addNode({
          id: 'service:test',
          type: 'Service',
          properties: { name: 'Test Service' }
        });
      });

      const risks = await result.current.analyzeRisks('service:test');
      expect(risks).toBeDefined();
      expect(risks.service).toBe('Test Service');
    });

    it('should provide recommendations functionality', async () => {
      const { result } = renderHook(() => useMemoryGraph());

      // Add test task
      act(() => {
        result.current.graph.addNode({
          id: 'task:test',
          type: 'Task',
          properties: { name: 'Test Task', status: 'pending' }
        });
      });

      const recommendations = await result.current.getRecommendations('test context');
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should provide dependency analysis functionality', () => {
      const { result } = renderHook(() => useMemoryGraph());

      // Set up test dependencies
      act(() => {
        result.current.graph.addNode({
          id: 'service1',
          type: 'Service',
          properties: { name: 'Service 1' }
        });
        result.current.graph.addNode({
          id: 'service2',
          type: 'Service',
          properties: { name: 'Service 2' }
        });
        result.current.graph.addEdge({
          type: 'DEPENDS_ON',
          from: 'service1',
          to: 'service2'
        });
      });

      const analysis = result.current.analyzeDependencies('service1');
      expect(analysis.entity).toBe('Service 1');
      expect(analysis.directDependencies).toContain('service2');
    });

    it('should provide impact analysis functionality', () => {
      const { result } = renderHook(() => useMemoryGraph());

      // Set up test impact scenario
      act(() => {
        result.current.graph.addNode({
          id: 'core',
          type: 'Service',
          properties: { name: 'Core Service' }
        });
        result.current.graph.addNode({
          id: 'dependent',
          type: 'Service',
          properties: { name: 'Dependent Service' }
        });
        result.current.graph.addEdge({
          type: 'DEPENDS_ON',
          from: 'dependent',
          to: 'core'
        });
      });

      const analysis = result.current.analyzeImpact('core');
      expect(analysis.entity).toBe('Core Service');
      expect(analysis.directImpact).toContain('dependent');
    });
  });

  describe('GraphAPIHandler', () => {
    let graph: MemoryGraph;
    let ingestor: IngestorAgent;
    let planner: PlannerAgent;
    let handler: GraphAPIHandler;

    beforeEach(() => {
      graph = new MemoryGraph();
      ingestor = new IngestorAgent(graph);
      planner = new PlannerAgent(graph);
      handler = new GraphAPIHandler(graph, ingestor, planner);
    });

    it('should handle ingest requests', async () => {
      const request = {
        action: 'ingest' as const,
        data: {
          text: 'The auth service requires API_KEY configuration',
          source: 'api-test'
        }
      };

      const response = await handler.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data?.message).toContain('ingested successfully');

      // Verify data was actually ingested
      const services = graph.query({ nodeType: 'Service' });
      expect(services.nodes.length).toBeGreaterThan(0);
    });

    it('should handle query requests', async () => {
      // Add test data
      graph.addNode({
        id: 'test-service',
        type: 'Service',
        properties: { name: 'Test Service' }
      });

      const request = {
        action: 'query' as const,
        data: {
          query: { nodeType: 'Service' }
        }
      };

      const response = await handler.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data?.nodes).toHaveLength(1);
      expect(response.data?.nodes[0].properties.name).toBe('Test Service');
    });

    it('should handle analyze-risks requests', async () => {
      graph.addNode({
        id: 'service:test',
        type: 'Service',
        properties: { name: 'Test Service' }
      });

      const request = {
        action: 'analyze-risks' as const,
        data: {
          serviceId: 'service:test'
        }
      };

      const response = await handler.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data?.service).toBe('Test Service');
      expect(typeof response.data?.riskScore).toBe('number');
    });

    it('should handle get-recommendations requests', async () => {
      graph.addNode({
        id: 'task:test',
        type: 'Task',
        properties: { name: 'Test Task', status: 'pending' }
      });

      const request = {
        action: 'get-recommendations' as const,
        data: {
          context: 'test context'
        }
      };

      const response = await handler.handleRequest(request);

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should handle analyze-dependencies requests', async () => {
      graph.addNode({
        id: 'service1',
        type: 'Service',
        properties: { name: 'Service 1' }
      });

      const request = {
        action: 'analyze-dependencies' as const,
        data: {
          entityId: 'service1'
        }
      };

      const response = await handler.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data?.entity).toBe('Service 1');
    });

    it('should handle analyze-impact requests', async () => {
      graph.addNode({
        id: 'service1',
        type: 'Service',
        properties: { name: 'Service 1' }
      });

      const request = {
        action: 'analyze-impact' as const,
        data: {
          entityId: 'service1'
        }
      };

      const response = await handler.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data?.entity).toBe('Service 1');
    });

    it('should handle unknown actions', async () => {
      const request = {
        action: 'unknown-action' as any,
        data: {}
      };

      const response = await handler.handleRequest(request);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Unknown action');
    });

    it('should handle errors gracefully', async () => {
      const request = {
        action: 'analyze-dependencies' as const,
        data: {
          entityId: 'nonexistent'
        }
      };

      const response = await handler.handleRequest(request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('not found');
    });
  });

  describe('LocalStorageAdapter', () => {
    let adapter: LocalStorageAdapter;
    let graph: MemoryGraph;

    beforeEach(() => {
      adapter = new LocalStorageAdapter('test-graph');
      graph = new MemoryGraph();
      
      // Add test data
      graph.addNode({
        id: 'test-node',
        type: 'Service',
        properties: { name: 'Test Service' }
      });
    });

    it('should save graph to localStorage', async () => {
      await adapter.save(graph);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-graph',
        expect.stringContaining('Test Service')
      );
    });

    it('should load graph from localStorage', async () => {
      const testData = JSON.stringify({
        nodes: [{
          id: 'loaded-node',
          type: 'Service',
          properties: { name: 'Loaded Service' },
          metadata: { createdAt: new Date(), updatedAt: new Date(), createdBy: 'test' }
        }],
        edges: []
      });

      localStorageMock.getItem.mockReturnValue(testData);

      const loadedGraph = await adapter.load();
      const node = loadedGraph.getNode('loaded-node');

      expect(node).toBeDefined();
      expect(node?.properties.name).toBe('Loaded Service');
    });

    it('should return empty graph when no data exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const loadedGraph = await adapter.load();
      const stats = loadedGraph.getStats();

      expect(stats.nodeCount).toBe(0);
      expect(stats.edgeCount).toBe(0);
    });

    it('should check if data exists', async () => {
      localStorageMock.getItem.mockReturnValue('some-data');
      expect(await adapter.exists()).toBe(true);

      localStorageMock.getItem.mockReturnValue(null);
      expect(await adapter.exists()).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should create memory graph system', () => {
      const system = createMemoryGraphSystem();

      expect(system.graph).toBeInstanceOf(MemoryGraph);
      expect(system.ingestor).toBeInstanceOf(IngestorAgent);
      expect(system.planner).toBeInstanceOf(PlannerAgent);
    });

    it('should create graph API handler with provided components', () => {
      const graph = new MemoryGraph();
      const ingestor = new IngestorAgent(graph);
      const planner = new PlannerAgent(graph);

      const handler = createGraphAPIHandler(graph, ingestor, planner);

      expect(handler).toBeInstanceOf(GraphAPIHandler);
    });

    it('should create graph API handler with default components', () => {
      const handler = createGraphAPIHandler();

      expect(handler).toBeInstanceOf(GraphAPIHandler);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete workflow', async () => {
      const { result } = renderHook(() => useMemoryGraph());

      // 1. Ingest data
      await act(async () => {
        await result.current.ingestText(
          'The crm service requires DATABASE_URL and depends on postgres database. Issue #123 was caused by missing configuration.',
          'integration-test'
        );
      });

      // 2. Query data
      const services = result.current.query({ nodeType: 'Service' });
      const configs = result.current.query({ nodeType: 'Configuration' });
      const incidents = result.current.query({ nodeType: 'Incident' });

      expect(services.nodes.length).toBeGreaterThan(0);
      expect(configs.nodes.length).toBeGreaterThan(0);
      expect(incidents.nodes.length).toBeGreaterThan(0);

      // 3. Analyze risks
      const serviceId = services.nodes[0].id;
      const risks = await result.current.analyzeRisks(serviceId);

      expect(risks.service).toBeDefined();
      expect(risks.riskScore).toBeGreaterThan(0);

      // 4. Get recommendations
      const recommendations = await result.current.getRecommendations('integration test');

      expect(Array.isArray(recommendations)).toBe(true);

      // 5. Analyze dependencies and impact
      const depAnalysis = result.current.analyzeDependencies(serviceId);
      const impactAnalysis = result.current.analyzeImpact(serviceId);

      expect(depAnalysis.entity).toBeDefined();
      expect(impactAnalysis.entity).toBeDefined();
    });

    it('should maintain consistency across operations', async () => {
      const { result } = renderHook(() => useMemoryGraph());

      // Add data through different methods
      await act(async () => {
        // Method 1: Direct graph manipulation
        result.current.graph.addNode({
          id: 'direct-service',
          type: 'Service',
          properties: { name: 'Direct Service' }
        });

        // Method 2: Text ingestion
        await result.current.ingestText(
          'The ingested service connects to direct service',
          'consistency-test'
        );
      });

      // Verify both services exist and are connected
      const allServices = result.current.query({ nodeType: 'Service' });
      const allEdges = result.current.query({}).edges;

      expect(allServices.nodes.length).toBeGreaterThanOrEqual(2);
      expect(allEdges.length).toBeGreaterThan(0);

      // Verify relationships are properly established
      const connectsEdges = allEdges.filter(e => e.type === 'CONNECTS_TO');
      expect(connectsEdges.length).toBeGreaterThan(0);
    });
  });
});