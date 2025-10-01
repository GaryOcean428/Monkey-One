/**
 * Memory Graph Core Implementation
 * 
 * Provides the main graph data structure with efficient indexing,
 * querying, and analysis capabilities.
 */

import type { 
  Node, 
  Edge, 
  NodeType, 
  EdgeType, 
  GraphQuery, 
  GraphQueryResult 
} from './types';

export class MemoryGraph {
  private nodes: Map<string, Node> = new Map();
  private edges: Map<string, Edge> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();
  private reverseAdjacencyList: Map<string, Set<string>> = new Map();
  private typeIndex: Map<NodeType, Set<string>> = new Map();
  
  constructor() {
    this.initializeIndexes();
  }
  
  private initializeIndexes(): void {
    // Initialize type indexes for fast lookups
    const nodeTypes: NodeType[] = [
      'Service', 'Environment', 'Deployment', 'Configuration',
      'User', 'Team', 'Project', 'Repository',
      'Task', 'Issue', 'Incident', 'Error',
      'Customer', 'Feature', 'Permission',
      'Document', 'API', 'Database', 'Secret'
    ];
    
    nodeTypes.forEach(type => {
      this.typeIndex.set(type, new Set());
    });
  }
  
  // -------------------- NODE OPERATIONS --------------------
  
  addNode(node: Omit<Node, 'metadata'> & { metadata?: Partial<Node['metadata']> }): Node {
    const fullNode: Node = {
      ...node,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: node.metadata?.createdBy || 'system',
        ...node.metadata
      }
    };
    
    this.nodes.set(fullNode.id, fullNode);
    this.typeIndex.get(fullNode.type)?.add(fullNode.id);
    
    if (!this.adjacencyList.has(fullNode.id)) {
      this.adjacencyList.set(fullNode.id, new Set());
      this.reverseAdjacencyList.set(fullNode.id, new Set());
    }
    
    return fullNode;
  }
  
  getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }
  
  updateNode(id: string, updates: Partial<Node>): Node | undefined {
    const node = this.nodes.get(id);
    if (!node) return undefined;
    
    const updatedNode = {
      ...node,
      ...updates,
      id: node.id, // Prevent ID changes
      metadata: {
        ...node.metadata,
        ...updates.metadata,
        updatedAt: new Date()
      }
    };
    
    this.nodes.set(id, updatedNode);
    return updatedNode;
  }
  
  deleteNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    
    // Remove from type index
    this.typeIndex.get(node.type)?.delete(id);
    
    // Remove all edges connected to this node
    const outgoingEdges = this.adjacencyList.get(id) || new Set();
    const incomingEdges = this.reverseAdjacencyList.get(id) || new Set();
    
    // Delete outgoing edges
    for (const targetId of outgoingEdges) {
      const edgeId = Array.from(this.edges.keys()).find(eid => {
        const edge = this.edges.get(eid);
        return edge?.from === id && edge?.to === targetId;
      });
      if (edgeId) {
        this.edges.delete(edgeId);
      }
      this.reverseAdjacencyList.get(targetId)?.delete(id);
    }
    
    // Delete incoming edges
    for (const sourceId of incomingEdges) {
      const edgeId = Array.from(this.edges.keys()).find(eid => {
        const edge = this.edges.get(eid);
        return edge?.from === sourceId && edge?.to === id;
      });
      if (edgeId) {
        this.edges.delete(edgeId);
      }
      this.adjacencyList.get(sourceId)?.delete(id);
    }
    
    // Remove adjacency lists
    this.adjacencyList.delete(id);
    this.reverseAdjacencyList.delete(id);
    
    // Remove node
    this.nodes.delete(id);
    
    return true;
  }
  
  // -------------------- EDGE OPERATIONS --------------------
  
  addEdge(edge: Omit<Edge, 'id' | 'metadata'> & { metadata?: Partial<Edge['metadata']> }): Edge {
    const edgeId = `${edge.from}-${edge.type}-${edge.to}`;
    
    const fullEdge: Edge = {
      ...edge,
      id: edgeId,
      metadata: {
        createdAt: new Date(),
        strength: 1.0,
        bidirectional: false,
        ...edge.metadata
      }
    };
    
    this.edges.set(edgeId, fullEdge);
    
    // Update adjacency lists
    this.adjacencyList.get(edge.from)?.add(edge.to);
    this.reverseAdjacencyList.get(edge.to)?.add(edge.from);
    
    if (fullEdge.metadata.bidirectional) {
      this.adjacencyList.get(edge.to)?.add(edge.from);
      this.reverseAdjacencyList.get(edge.from)?.add(edge.to);
    }
    
    return fullEdge;
  }
  
  getEdge(id: string): Edge | undefined {
    return this.edges.get(id);
  }
  
  deleteEdge(id: string): boolean {
    const edge = this.edges.get(id);
    if (!edge) return false;
    
    // Update adjacency lists
    this.adjacencyList.get(edge.from)?.delete(edge.to);
    this.reverseAdjacencyList.get(edge.to)?.delete(edge.from);
    
    if (edge.metadata.bidirectional) {
      this.adjacencyList.get(edge.to)?.delete(edge.from);
      this.reverseAdjacencyList.get(edge.from)?.delete(edge.to);
    }
    
    this.edges.delete(id);
    return true;
  }
  
  // -------------------- QUERY OPERATIONS --------------------
  
  query(params: GraphQuery): GraphQueryResult {
    let resultNodes: Node[] = [];
    
    // Start with type-filtered nodes
    if (params.nodeType) {
      const nodeIds = this.typeIndex.get(params.nodeType) || new Set();
      resultNodes = Array.from(nodeIds)
        .map(id => this.nodes.get(id)!)
        .filter(node => this.matchesProperties(node.properties, params.properties));
    } else {
      resultNodes = Array.from(this.nodes.values())
        .filter(node => this.matchesProperties(node.properties, params.properties));
    }
    
    // Expand by depth if requested
    if (params.depth && params.depth > 0 && resultNodes.length > 0) {
      const expanded = this.expandNodes(
        resultNodes.map(n => n.id),
        params.depth
      );
      resultNodes = Array.from(expanded)
        .map(id => this.nodes.get(id)!)
        .filter(Boolean);
    }
    
    // Apply limit
    if (params.limit) {
      resultNodes = resultNodes.slice(0, params.limit);
    }
    
    // Get relevant edges
    const nodeIds = new Set(resultNodes.map(n => n.id));
    const resultEdges = Array.from(this.edges.values())
      .filter(edge => {
        const matchesEdgeType = !params.edgeType || edge.type === params.edgeType;
        const connectsNodes = nodeIds.has(edge.from) && nodeIds.has(edge.to);
        return matchesEdgeType && connectsNodes;
      });
    
    return { nodes: resultNodes, edges: resultEdges };
  }
  
  private matchesProperties(nodeProps: Record<string, any>, queryProps?: Record<string, any>): boolean {
    if (!queryProps) return true;
    
    return Object.entries(queryProps).every(([key, value]) => {
      if (typeof value === 'object' && value !== null && '$regex' in value) {
        return new RegExp(value.$regex).test(nodeProps[key]);
      }
      return nodeProps[key] === value;
    });
  }
  
  private expandNodes(nodeIds: string[], depth: number): Set<string> {
    const visited = new Set<string>(nodeIds);
    const queue: Array<{ id: string, level: number }> = 
      nodeIds.map(id => ({ id, level: 0 }));
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      
      if (level >= depth) continue;
      
      // Get neighbors
      const neighbors = this.adjacencyList.get(id) || new Set();
      const reverseNeighbors = this.reverseAdjacencyList.get(id) || new Set();
      
      const allNeighbors = new Set([...neighbors, ...reverseNeighbors]);
      
      for (const neighborId of allNeighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ id: neighborId, level: level + 1 });
        }
      }
    }
    
    return visited;
  }
  
  // -------------------- PATH FINDING --------------------
  
  findPath(fromId: string, toId: string): string[] | null {
    const visited = new Set<string>();
    const parent = new Map<string, string>();
    const queue = [fromId];
    
    visited.add(fromId);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current === toId) {
        // Reconstruct path
        const path = [];
        let node = toId;
        while (node !== fromId) {
          path.unshift(node);
          node = parent.get(node)!;
        }
        path.unshift(fromId);
        return path;
      }
      
      const neighbors = this.adjacencyList.get(current) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }
    
    return null;
  }
  
  // -------------------- ANALYSIS OPERATIONS --------------------
  
  getCentralityScore(nodeId: string): number {
    const incoming = this.reverseAdjacencyList.get(nodeId)?.size || 0;
    const outgoing = this.adjacencyList.get(nodeId)?.size || 0;
    return incoming + outgoing;
  }
  
  findClusters(): Map<string, Set<string>> {
    const clusters = new Map<string, Set<string>>();
    const visited = new Set<string>();
    
    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        const cluster = new Set<string>();
        this.dfs(nodeId, visited, cluster);
        clusters.set(nodeId, cluster);
      }
    }
    
    return clusters;
  }
  
  private dfs(nodeId: string, visited: Set<string>, cluster: Set<string>): void {
    visited.add(nodeId);
    cluster.add(nodeId);
    
    // Get both outgoing and incoming neighbors for undirected clustering
    const outgoingNeighbors = this.adjacencyList.get(nodeId) || new Set();
    const incomingNeighbors = this.reverseAdjacencyList.get(nodeId) || new Set();
    const allNeighbors = new Set([...outgoingNeighbors, ...incomingNeighbors]);
    
    for (const neighbor of allNeighbors) {
      if (!visited.has(neighbor)) {
        this.dfs(neighbor, visited, cluster);
      }
    }
  }
  
  getNodesByType(type: NodeType): Node[] {
    const nodeIds = this.typeIndex.get(type) || new Set();
    return Array.from(nodeIds).map(id => this.nodes.get(id)!).filter(Boolean);
  }
  
  getNeighbors(nodeId: string, direction: 'in' | 'out' | 'both' = 'both'): Node[] {
    const neighbors = new Set<string>();
    
    if (direction === 'out' || direction === 'both') {
      const outgoing = this.adjacencyList.get(nodeId) || new Set();
      outgoing.forEach(id => neighbors.add(id));
    }
    
    if (direction === 'in' || direction === 'both') {
      const incoming = this.reverseAdjacencyList.get(nodeId) || new Set();
      incoming.forEach(id => neighbors.add(id));
    }
    
    return Array.from(neighbors).map(id => this.nodes.get(id)!).filter(Boolean);
  }
  
  // -------------------- SERIALIZATION --------------------
  
  toJSON(): string {
    return JSON.stringify({
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    }, null, 2);
  }
  
  static fromJSON(json: string): MemoryGraph {
    const data = JSON.parse(json);
    const graph = new MemoryGraph();
    
    // Add nodes
    for (const node of data.nodes) {
      graph.addNode(node);
    }
    
    // Add edges
    for (const edge of data.edges) {
      graph.addEdge(edge);
    }
    
    return graph;
  }
  
  // -------------------- UTILITY METHODS --------------------
  
  getStats(): {
    nodeCount: number;
    edgeCount: number;
    nodeTypes: Record<NodeType, number>;
    avgDegree: number;
  } {
    const nodeTypes = {} as Record<NodeType, number>;
    
    for (const [type, nodeIds] of this.typeIndex.entries()) {
      nodeTypes[type] = nodeIds.size;
    }
    
    const totalDegree = Array.from(this.nodes.keys())
      .reduce((sum, nodeId) => sum + this.getCentralityScore(nodeId), 0);
    
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      nodeTypes,
      avgDegree: this.nodes.size > 0 ? totalDegree / this.nodes.size : 0
    };
  }
  
  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();
    this.initializeIndexes();
  }
}