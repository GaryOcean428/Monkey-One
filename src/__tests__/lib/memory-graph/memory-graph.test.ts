/**
 * Memory Graph Core Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryGraph } from '../../../lib/memory-graph/memory-graph';
import type { Node, Edge } from '../../../lib/memory-graph/types';

describe('MemoryGraph', () => {
  let graph: MemoryGraph;

  beforeEach(() => {
    graph = new MemoryGraph();
  });

  describe('Node Operations', () => {
    it('should add a node successfully', () => {
      const node = graph.addNode({
        id: 'test-node',
        type: 'Service',
        properties: { name: 'Test Service' }
      });

      expect(node.id).toBe('test-node');
      expect(node.type).toBe('Service');
      expect(node.properties.name).toBe('Test Service');
      expect(node.metadata.createdBy).toBe('system');
      expect(node.metadata.createdAt).toBeInstanceOf(Date);
    });

    it('should retrieve a node by id', () => {
      graph.addNode({
        id: 'test-node',
        type: 'Service',
        properties: { name: 'Test Service' }
      });

      const retrieved = graph.getNode('test-node');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-node');
    });

    it('should update a node', () => {
      graph.addNode({
        id: 'test-node',
        type: 'Service',
        properties: { name: 'Test Service' }
      });

      const updated = graph.updateNode('test-node', {
        properties: { name: 'Updated Service', version: '2.0' }
      });

      expect(updated).toBeDefined();
      expect(updated?.properties.name).toBe('Updated Service');
      expect(updated?.properties.version).toBe('2.0');
      expect(updated?.metadata.updatedAt).toBeInstanceOf(Date);
    });

    it('should delete a node and its edges', () => {
      graph.addNode({
        id: 'node1',
        type: 'Service',
        properties: { name: 'Service 1' }
      });

      graph.addNode({
        id: 'node2',
        type: 'Service',
        properties: { name: 'Service 2' }
      });

      graph.addEdge({
        type: 'DEPENDS_ON',
        from: 'node1',
        to: 'node2'
      });

      const deleted = graph.deleteNode('node1');
      expect(deleted).toBe(true);
      expect(graph.getNode('node1')).toBeUndefined();
      
      // Edge should also be deleted
      const edges = graph.query({}).edges;
      expect(edges.length).toBe(0);
    });

    it('should return undefined for non-existent node', () => {
      const node = graph.getNode('non-existent');
      expect(node).toBeUndefined();
    });
  });

  describe('Edge Operations', () => {
    beforeEach(() => {
      graph.addNode({
        id: 'service1',
        type: 'Service',
        properties: { name: 'Service 1' }
      });

      graph.addNode({
        id: 'service2',
        type: 'Service',
        properties: { name: 'Service 2' }
      });
    });

    it('should add an edge successfully', () => {
      const edge = graph.addEdge({
        type: 'DEPENDS_ON',
        from: 'service1',
        to: 'service2'
      });

      expect(edge.id).toBe('service1-DEPENDS_ON-service2');
      expect(edge.type).toBe('DEPENDS_ON');
      expect(edge.from).toBe('service1');
      expect(edge.to).toBe('service2');
      expect(edge.metadata.strength).toBe(1.0);
    });

    it('should retrieve an edge by id', () => {
      graph.addEdge({
        type: 'DEPENDS_ON',
        from: 'service1',
        to: 'service2'
      });

      const edge = graph.getEdge('service1-DEPENDS_ON-service2');
      expect(edge).toBeDefined();
      expect(edge?.type).toBe('DEPENDS_ON');
    });

    it('should delete an edge', () => {
      graph.addEdge({
        type: 'DEPENDS_ON',
        from: 'service1',
        to: 'service2'
      });

      const deleted = graph.deleteEdge('service1-DEPENDS_ON-service2');
      expect(deleted).toBe(true);
      expect(graph.getEdge('service1-DEPENDS_ON-service2')).toBeUndefined();
    });

    it('should handle bidirectional edges', () => {
      graph.addEdge({
        type: 'CONNECTS_TO',
        from: 'service1',
        to: 'service2',
        metadata: { bidirectional: true }
      });

      const neighbors1 = graph.getNeighbors('service1');
      const neighbors2 = graph.getNeighbors('service2');

      expect(neighbors1.some(n => n.id === 'service2')).toBe(true);
      expect(neighbors2.some(n => n.id === 'service1')).toBe(true);
    });
  });

  describe('Query Operations', () => {
    beforeEach(() => {
      // Add test data
      graph.addNode({
        id: 'service1',
        type: 'Service',
        properties: { name: 'CRM Service', status: 'active' }
      });

      graph.addNode({
        id: 'service2',
        type: 'Service',
        properties: { name: 'Auth Service', status: 'inactive' }
      });

      graph.addNode({
        id: 'db1',
        type: 'Database',
        properties: { name: 'Main DB' }
      });

      graph.addEdge({
        type: 'DEPENDS_ON',
        from: 'service1',
        to: 'db1'
      });
    });

    it('should query nodes by type', () => {
      const result = graph.query({ nodeType: 'Service' });
      
      expect(result.nodes).toHaveLength(2);
      expect(result.nodes.every(n => n.type === 'Service')).toBe(true);
    });

    it('should query nodes by properties', () => {
      const result = graph.query({
        nodeType: 'Service',
        properties: { status: 'active' }
      });

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].properties.name).toBe('CRM Service');
    });

    it('should query with regex properties', () => {
      const result = graph.query({
        nodeType: 'Service',
        properties: { name: { $regex: 'CRM.*' } }
      });

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].properties.name).toBe('CRM Service');
    });

    it('should expand query by depth', () => {
      const result = graph.query({
        nodeType: 'Service',
        properties: { name: 'CRM Service' },
        depth: 1
      });

      // Should include the service and its connected database
      expect(result.nodes.length).toBeGreaterThan(1);
      expect(result.nodes.some(n => n.type === 'Database')).toBe(true);
    });

    it('should limit query results', () => {
      const result = graph.query({
        nodeType: 'Service',
        limit: 1
      });

      expect(result.nodes).toHaveLength(1);
    });

    it('should include relevant edges in query results', () => {
      const result = graph.query({
        nodeType: 'Service',
        depth: 1
      });

      expect(result.edges.length).toBeGreaterThan(0);
      expect(result.edges[0].type).toBe('DEPENDS_ON');
    });
  });

  describe('Path Finding', () => {
    beforeEach(() => {
      // Create a path: service1 -> db1 -> service2
      graph.addNode({ id: 'service1', type: 'Service', properties: {} });
      graph.addNode({ id: 'db1', type: 'Database', properties: {} });
      graph.addNode({ id: 'service2', type: 'Service', properties: {} });

      graph.addEdge({ type: 'CONNECTS_TO', from: 'service1', to: 'db1' });
      graph.addEdge({ type: 'CONNECTS_TO', from: 'db1', to: 'service2' });
    });

    it('should find a path between connected nodes', () => {
      const path = graph.findPath('service1', 'service2');
      
      expect(path).not.toBeNull();
      expect(path).toEqual(['service1', 'db1', 'service2']);
    });

    it('should return null for disconnected nodes', () => {
      graph.addNode({ id: 'isolated', type: 'Service', properties: {} });
      
      const path = graph.findPath('service1', 'isolated');
      expect(path).toBeNull();
    });

    it('should find direct path', () => {
      const path = graph.findPath('service1', 'db1');
      
      expect(path).not.toBeNull();
      expect(path).toEqual(['service1', 'db1']);
    });
  });

  describe('Analysis Operations', () => {
    beforeEach(() => {
      // Create a hub node with multiple connections
      graph.addNode({ id: 'hub', type: 'Service', properties: {} });
      graph.addNode({ id: 'node1', type: 'Service', properties: {} });
      graph.addNode({ id: 'node2', type: 'Service', properties: {} });
      graph.addNode({ id: 'node3', type: 'Service', properties: {} });

      graph.addEdge({ type: 'CONNECTS_TO', from: 'hub', to: 'node1' });
      graph.addEdge({ type: 'CONNECTS_TO', from: 'hub', to: 'node2' });
      graph.addEdge({ type: 'CONNECTS_TO', from: 'node3', to: 'hub' });
    });

    it('should calculate centrality score', () => {
      const centralityHub = graph.getCentralityScore('hub');
      const centralityNode1 = graph.getCentralityScore('node1');

      expect(centralityHub).toBeGreaterThan(centralityNode1);
      expect(centralityHub).toBe(3); // 2 outgoing + 1 incoming
      expect(centralityNode1).toBe(1); // 1 incoming
    });

    it('should find clusters', () => {
      const clusters = graph.findClusters();
      
      expect(clusters.size).toBeGreaterThan(0);
      // All nodes should be in the same cluster since they're connected
      const firstCluster = Array.from(clusters.values())[0];
      expect(firstCluster.size).toBe(4);
    });

    it('should get nodes by type', () => {
      const services = graph.getNodesByType('Service');
      expect(services).toHaveLength(4);
    });

    it('should get neighbors', () => {
      const outgoingNeighbors = graph.getNeighbors('hub', 'out');
      const incomingNeighbors = graph.getNeighbors('hub', 'in');
      const allNeighbors = graph.getNeighbors('hub', 'both');

      expect(outgoingNeighbors).toHaveLength(2);
      expect(incomingNeighbors).toHaveLength(1);
      expect(allNeighbors).toHaveLength(3);
    });
  });

  describe('Serialization', () => {
    beforeEach(() => {
      graph.addNode({
        id: 'service1',
        type: 'Service',
        properties: { name: 'Test Service' }
      });

      graph.addNode({
        id: 'db1',
        type: 'Database',
        properties: { name: 'Test DB' }
      });

      graph.addEdge({
        type: 'DEPENDS_ON',
        from: 'service1',
        to: 'db1'
      });
    });

    it('should serialize to JSON', () => {
      const json = graph.toJSON();
      const data = JSON.parse(json);

      expect(data.nodes).toHaveLength(2);
      expect(data.edges).toHaveLength(1);
      expect(data.nodes[0].type).toBe('Service');
      expect(data.edges[0].type).toBe('DEPENDS_ON');
    });

    it('should deserialize from JSON', () => {
      const json = graph.toJSON();
      const newGraph = MemoryGraph.fromJSON(json);

      expect(newGraph.getNode('service1')).toBeDefined();
      expect(newGraph.getNode('db1')).toBeDefined();
      expect(newGraph.getEdge('service1-DEPENDS_ON-db1')).toBeDefined();

      const stats = newGraph.getStats();
      expect(stats.nodeCount).toBe(2);
      expect(stats.edgeCount).toBe(1);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      graph.addNode({ id: 'service1', type: 'Service', properties: {} });
      graph.addNode({ id: 'service2', type: 'Service', properties: {} });
      graph.addNode({ id: 'db1', type: 'Database', properties: {} });
      
      graph.addEdge({ type: 'DEPENDS_ON', from: 'service1', to: 'db1' });
      graph.addEdge({ type: 'CONNECTS_TO', from: 'service2', to: 'db1' });
    });

    it('should provide accurate stats', () => {
      const stats = graph.getStats();

      expect(stats.nodeCount).toBe(3);
      expect(stats.edgeCount).toBe(2);
      expect(stats.nodeTypes.Service).toBe(2);
      expect(stats.nodeTypes.Database).toBe(1);
      expect(stats.avgDegree).toBeGreaterThan(0);
    });

    it('should clear the graph', () => {
      graph.clear();

      const stats = graph.getStats();
      expect(stats.nodeCount).toBe(0);
      expect(stats.edgeCount).toBe(0);
    });
  });
});