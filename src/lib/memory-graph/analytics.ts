/**
 * Advanced Graph Analytics and Insights Engine
 * 
 * Provides sophisticated analysis capabilities for the memory graph
 * including pattern detection, anomaly identification, and predictive insights.
 */

import type { Node, Edge, NodeType, EdgeType } from './types';
import type { MemoryGraph } from './memory-graph';

export interface GraphAnalytics {
  // Network metrics
  density: number;
  clustering: number;
  averagePathLength: number;
  diameter: number;
  
  // Node metrics
  centralityDistribution: Record<string, number>;
  degreeDistribution: Record<number, number>;
  
  // Community detection
  communities: Community[];
  modularity: number;
  
  // Temporal analysis
  growthRate: number;
  activityPatterns: ActivityPattern[];
  
  // Anomalies
  anomalies: Anomaly[];
  
  // Predictions
  predictions: Prediction[];
}

export interface Community {
  id: string;
  nodes: string[];
  size: number;
  density: number;
  dominantType: NodeType;
  cohesion: number;
  description: string;
}

export interface ActivityPattern {
  type: 'creation_spike' | 'connection_burst' | 'type_emergence' | 'cluster_formation';
  timeframe: { start: Date; end: Date };
  intensity: number;
  entities: string[];
  description: string;
}

export interface Anomaly {
  type: 'isolated_node' | 'over_connected' | 'type_mismatch' | 'temporal_outlier' | 'missing_connection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  entityId: string;
  description: string;
  confidence: number;
  suggestedAction?: string;
}

export interface Prediction {
  type: 'growth_forecast' | 'connection_likelihood' | 'failure_risk' | 'optimization_opportunity';
  confidence: number;
  timeframe: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  entities: string[];
  recommendation: string;
}

export interface InfluenceAnalysis {
  nodeId: string;
  influenceScore: number;
  reachability: number;
  criticalityIndex: number;
  networkPosition: 'core' | 'periphery' | 'bridge' | 'isolated';
  keyConnections: string[];
}

export interface PathAnalysis {
  from: string;
  to: string;
  shortestPath: string[];
  alternativePaths: string[][];
  bottlenecks: string[];
  reliability: number;
}

export class GraphAnalyticsEngine {
  private graph: MemoryGraph;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 300000; // 5 minutes

  constructor(graph: MemoryGraph) {
    this.graph = graph;
  }

  // Main analytics computation
  async computeAnalytics(): Promise<GraphAnalytics> {
    const cacheKey = 'full_analytics';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const nodes = this.graph.query({}).nodes;
    const edges = this.graph.query({}).edges;

    if (nodes.length === 0) {
      return this.getEmptyAnalytics();
    }

    const analytics: GraphAnalytics = {
      density: this.calculateDensity(nodes, edges),
      clustering: this.calculateClustering(nodes, edges),
      averagePathLength: this.calculateAveragePathLength(nodes),
      diameter: this.calculateDiameter(nodes),
      centralityDistribution: this.calculateCentralityDistribution(nodes),
      degreeDistribution: this.calculateDegreeDistribution(nodes),
      communities: this.detectCommunities(nodes, edges),
      modularity: this.calculateModularity(nodes, edges),
      growthRate: this.calculateGrowthRate(nodes),
      activityPatterns: this.detectActivityPatterns(nodes, edges),
      anomalies: this.detectAnomalies(nodes, edges),
      predictions: this.generatePredictions(nodes, edges)
    };

    this.setCache(cacheKey, analytics);
    return analytics;
  }

  // Network density calculation
  private calculateDensity(nodes: Node[], edges: Edge[]): number {
    if (nodes.length < 2) return 0;
    const maxPossibleEdges = nodes.length * (nodes.length - 1);
    return (edges.length * 2) / maxPossibleEdges;
  }

  // Clustering coefficient
  private calculateClustering(nodes: Node[], edges: Edge[]): number {
    if (nodes.length < 3) return 0;

    const adjacencyMap = this.buildAdjacencyMap(edges);
    let totalClustering = 0;
    let validNodes = 0;

    for (const node of nodes) {
      const neighbors = adjacencyMap.get(node.id) || new Set();
      if (neighbors.size < 2) continue;

      let triangles = 0;
      const neighborArray = Array.from(neighbors);
      
      for (let i = 0; i < neighborArray.length; i++) {
        for (let j = i + 1; j < neighborArray.length; j++) {
          const neighbor1 = neighborArray[i];
          const neighbor2 = neighborArray[j];
          
          if (adjacencyMap.get(neighbor1)?.has(neighbor2)) {
            triangles++;
          }
        }
      }

      const possibleTriangles = (neighbors.size * (neighbors.size - 1)) / 2;
      if (possibleTriangles > 0) {
        totalClustering += triangles / possibleTriangles;
        validNodes++;
      }
    }

    return validNodes > 0 ? totalClustering / validNodes : 0;
  }

  // Average path length using BFS
  private calculateAveragePathLength(nodes: Node[]): number {
    if (nodes.length < 2) return 0;

    let totalDistance = 0;
    let pathCount = 0;

    for (const startNode of nodes) {
      const distances = this.bfsDistances(startNode.id, nodes);
      
      for (const [targetId, distance] of distances) {
        if (targetId !== startNode.id && distance < Infinity) {
          totalDistance += distance;
          pathCount++;
        }
      }
    }

    return pathCount > 0 ? totalDistance / pathCount : 0;
  }

  // Network diameter
  private calculateDiameter(nodes: Node[]): number {
    let maxDistance = 0;

    for (const node of nodes) {
      const distances = this.bfsDistances(node.id, nodes);
      const nodeMaxDistance = Math.max(...Array.from(distances.values()).filter(d => d < Infinity));
      maxDistance = Math.max(maxDistance, nodeMaxDistance);
    }

    return maxDistance;
  }

  // BFS for distance calculation
  private bfsDistances(startId: string, nodes: Node[]): Map<string, number> {
    const distances = new Map<string, number>();
    const queue = [{ id: startId, distance: 0 }];
    const visited = new Set<string>();

    // Initialize all distances to infinity
    nodes.forEach(node => distances.set(node.id, Infinity));
    distances.set(startId, 0);

    while (queue.length > 0) {
      const { id, distance } = queue.shift()!;
      
      if (visited.has(id)) continue;
      visited.add(id);

      const neighbors = this.graph.getNeighbors(id);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          const newDistance = distance + 1;
          if (newDistance < distances.get(neighbor.id)!) {
            distances.set(neighbor.id, newDistance);
            queue.push({ id: neighbor.id, distance: newDistance });
          }
        }
      }
    }

    return distances;
  }

  // Centrality distribution
  private calculateCentralityDistribution(nodes: Node[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const node of nodes) {
      const centrality = this.graph.getCentralityScore(node.id);
      const bucket = Math.floor(centrality / 5) * 5; // Group by 5s
      distribution[`${bucket}-${bucket + 4}`] = (distribution[`${bucket}-${bucket + 4}`] || 0) + 1;
    }

    return distribution;
  }

  // Degree distribution
  private calculateDegreeDistribution(nodes: Node[]): Record<number, number> {
    const distribution: Record<number, number> = {};

    for (const node of nodes) {
      const degree = this.graph.getCentralityScore(node.id);
      distribution[degree] = (distribution[degree] || 0) + 1;
    }

    return distribution;
  }

  // Community detection using simple modularity-based approach
  private detectCommunities(nodes: Node[], edges: Edge[]): Community[] {
    const communities: Community[] = [];
    const visited = new Set<string>();
    const adjacencyMap = this.buildAdjacencyMap(edges);

    // Simple connected components as communities
    for (const node of nodes) {
      if (visited.has(node.id)) continue;

      const community = this.findConnectedComponent(node.id, adjacencyMap, visited);
      if (community.length > 1) {
        const communityNodes = community.map(id => nodes.find(n => n.id === id)!).filter(Boolean);
        const dominantType = this.findDominantType(communityNodes);
        
        communities.push({
          id: `community_${communities.length + 1}`,
          nodes: community,
          size: community.length,
          density: this.calculateCommunityDensity(community, edges),
          dominantType,
          cohesion: this.calculateCohesion(community, edges),
          description: this.generateCommunityDescription(communityNodes, dominantType)
        });
      }
    }

    return communities;
  }

  private findConnectedComponent(startId: string, adjacencyMap: Map<string, Set<string>>, visited: Set<string>): string[] {
    const component: string[] = [];
    const queue = [startId];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;

      visited.add(nodeId);
      component.push(nodeId);

      const neighbors = adjacencyMap.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    return component;
  }

  private calculateCommunityDensity(nodeIds: string[], edges: Edge[]): number {
    const nodeSet = new Set(nodeIds);
    const internalEdges = edges.filter(edge => nodeSet.has(edge.from) && nodeSet.has(edge.to));
    const maxPossibleEdges = nodeIds.length * (nodeIds.length - 1);
    return maxPossibleEdges > 0 ? (internalEdges.length * 2) / maxPossibleEdges : 0;
  }

  private calculateCohesion(nodeIds: string[], edges: Edge[]): number {
    // Simple cohesion metric based on internal vs external connections
    const nodeSet = new Set(nodeIds);
    let internalConnections = 0;
    let externalConnections = 0;

    for (const edge of edges) {
      if (nodeSet.has(edge.from) && nodeSet.has(edge.to)) {
        internalConnections++;
      } else if (nodeSet.has(edge.from) || nodeSet.has(edge.to)) {
        externalConnections++;
      }
    }

    const totalConnections = internalConnections + externalConnections;
    return totalConnections > 0 ? internalConnections / totalConnections : 0;
  }

  private findDominantType(nodes: Node[]): NodeType {
    const typeCounts: Record<NodeType, number> = {} as Record<NodeType, number>;
    
    for (const node of nodes) {
      typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
    }

    return Object.entries(typeCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as NodeType;
  }

  private generateCommunityDescription(nodes: Node[], dominantType: NodeType): string {
    const typeCount = nodes.filter(n => n.type === dominantType).length;
    const totalCount = nodes.length;
    
    if (typeCount === totalCount) {
      return `Homogeneous ${dominantType.toLowerCase()} cluster`;
    } else {
      return `Mixed cluster dominated by ${dominantType.toLowerCase()} (${typeCount}/${totalCount})`;
    }
  }

  // Modularity calculation
  private calculateModularity(nodes: Node[], edges: Edge[]): number {
    const communities = this.detectCommunities(nodes, edges);
    if (communities.length <= 1) return 0;

    const m = edges.length;
    if (m === 0) return 0;

    let modularity = 0;
    const nodeToComm = new Map<string, string>();
    
    communities.forEach(comm => {
      comm.nodes.forEach(nodeId => {
        nodeToComm.set(nodeId, comm.id);
      });
    });

    for (const edge of edges) {
      const commI = nodeToComm.get(edge.from);
      const commJ = nodeToComm.get(edge.to);
      
      if (commI === commJ) {
        const degreeI = this.graph.getCentralityScore(edge.from);
        const degreeJ = this.graph.getCentralityScore(edge.to);
        modularity += 1 - (degreeI * degreeJ) / (2 * m);
      }
    }

    return modularity / (2 * m);
  }

  // Growth rate calculation
  private calculateGrowthRate(nodes: Node[]): number {
    if (nodes.length === 0) return 0;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentNodes = nodes.filter(node => 
      new Date(node.metadata.createdAt) > oneWeekAgo
    );

    return (recentNodes.length / nodes.length) * 100;
  }

  // Activity pattern detection
  private detectActivityPatterns(nodes: Node[], edges: Edge[]): ActivityPattern[] {
    const patterns: ActivityPattern[] = [];

    // Creation spike detection
    const creationSpikes = this.detectCreationSpikes(nodes);
    patterns.push(...creationSpikes);

    // Connection burst detection
    const connectionBursts = this.detectConnectionBursts(edges);
    patterns.push(...connectionBursts);

    return patterns;
  }

  private detectCreationSpikes(nodes: Node[]): ActivityPattern[] {
    const patterns: ActivityPattern[] = [];
    const dailyCreations = new Map<string, Node[]>();

    // Group nodes by creation date
    nodes.forEach(node => {
      const date = new Date(node.metadata.createdAt).toDateString();
      if (!dailyCreations.has(date)) {
        dailyCreations.set(date, []);
      }
      dailyCreations.get(date)!.push(node);
    });

    // Find spikes (days with significantly more creations)
    const avgDaily = nodes.length / Math.max(dailyCreations.size, 1);
    const threshold = avgDaily * 2; // 2x average

    for (const [date, dayNodes] of dailyCreations) {
      if (dayNodes.length > threshold) {
        const dateObj = new Date(date);
        patterns.push({
          type: 'creation_spike',
          timeframe: { 
            start: dateObj, 
            end: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000) 
          },
          intensity: dayNodes.length / avgDaily,
          entities: dayNodes.map(n => n.id),
          description: `${dayNodes.length} entities created on ${date} (${(dayNodes.length / avgDaily).toFixed(1)}x normal)`
        });
      }
    }

    return patterns;
  }

  private detectConnectionBursts(edges: Edge[]): ActivityPattern[] {
    // Similar logic for edge creation bursts
    return []; // Simplified for now
  }

  // Anomaly detection
  private detectAnomalies(nodes: Node[], edges: Edge[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Isolated nodes
    const isolatedNodes = this.findIsolatedNodes(nodes, edges);
    anomalies.push(...isolatedNodes);

    // Over-connected nodes
    const overConnected = this.findOverConnectedNodes(nodes);
    anomalies.push(...overConnected);

    // Type mismatches
    const typeMismatches = this.findTypeMismatches(nodes, edges);
    anomalies.push(...typeMismatches);

    return anomalies;
  }

  private findIsolatedNodes(nodes: Node[], edges: Edge[]): Anomaly[] {
    const connectedNodes = new Set<string>();
    edges.forEach(edge => {
      connectedNodes.add(edge.from);
      connectedNodes.add(edge.to);
    });

    return nodes
      .filter(node => !connectedNodes.has(node.id))
      .map(node => ({
        type: 'isolated_node' as const,
        severity: 'medium' as const,
        entityId: node.id,
        description: `${node.type} "${node.properties.name || node.id}" has no connections`,
        confidence: 0.9,
        suggestedAction: 'Review if this entity should be connected to others'
      }));
  }

  private findOverConnectedNodes(nodes: Node[]): Anomaly[] {
    const avgConnections = nodes.reduce((sum, node) => 
      sum + this.graph.getCentralityScore(node.id), 0) / nodes.length;
    
    const threshold = avgConnections * 3; // 3x average

    return nodes
      .filter(node => this.graph.getCentralityScore(node.id) > threshold)
      .map(node => ({
        type: 'over_connected' as const,
        severity: 'low' as const,
        entityId: node.id,
        description: `${node.type} "${node.properties.name || node.id}" has unusually many connections (${this.graph.getCentralityScore(node.id)})`,
        confidence: 0.7,
        suggestedAction: 'Verify if all connections are necessary'
      }));
  }

  private findTypeMismatches(nodes: Node[], edges: Edge[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    // Look for unusual connection patterns
    const typeConnections = new Map<string, Set<string>>();
    
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      
      if (fromNode && toNode) {
        const key = `${fromNode.type}-${edge.type}-${toNode.type}`;
        if (!typeConnections.has(key)) {
          typeConnections.set(key, new Set());
        }
        typeConnections.get(key)!.add(edge.id);
      }
    });

    // Find rare connection patterns
    const totalConnections = edges.length;
    for (const [pattern, edgeIds] of typeConnections) {
      const frequency = edgeIds.size / totalConnections;
      
      if (frequency < 0.05 && edgeIds.size === 1) { // Less than 5% and only one instance
        const edge = edges.find(e => edgeIds.has(e.id))!;
        anomalies.push({
          type: 'type_mismatch',
          severity: 'low',
          entityId: edge.from,
          description: `Unusual connection pattern: ${pattern}`,
          confidence: 0.6,
          suggestedAction: 'Verify if this connection type is correct'
        });
      }
    }

    return anomalies;
  }

  // Prediction generation
  private generatePredictions(nodes: Node[], edges: Edge[]): Prediction[] {
    const predictions: Prediction[] = [];

    // Growth forecast
    const growthForecast = this.predictGrowth(nodes);
    if (growthForecast) predictions.push(growthForecast);

    // Connection likelihood
    const connectionPredictions = this.predictConnections(nodes, edges);
    predictions.push(...connectionPredictions);

    return predictions;
  }

  private predictGrowth(nodes: Node[]): Prediction | null {
    if (nodes.length < 10) return null;

    const growthRate = this.calculateGrowthRate(nodes);
    const projectedGrowth = growthRate * 4; // 4 weeks projection

    return {
      type: 'growth_forecast',
      confidence: 0.7,
      timeframe: '4 weeks',
      description: `Graph expected to grow by ${projectedGrowth.toFixed(1)}% (${Math.round(nodes.length * projectedGrowth / 100)} new entities)`,
      impact: projectedGrowth > 50 ? 'high' : projectedGrowth > 20 ? 'medium' : 'low',
      entities: [],
      recommendation: projectedGrowth > 50 ? 'Consider scaling infrastructure' : 'Monitor growth patterns'
    };
  }

  private predictConnections(nodes: Node[], edges: Edge[]): Prediction[] {
    // Simple prediction based on node types that commonly connect
    const predictions: Prediction[] = [];
    
    // Find services without database connections
    const services = nodes.filter(n => n.type === 'Service');
    const databases = nodes.filter(n => n.type === 'Database');
    
    if (services.length > 0 && databases.length > 0) {
      const connectedServices = new Set<string>();
      edges.forEach(edge => {
        if (edge.type === 'DEPENDS_ON' || edge.type === 'CONNECTS_TO') {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (fromNode?.type === 'Service' && toNode?.type === 'Database') {
            connectedServices.add(fromNode.id);
          }
        }
      });

      const unconnectedServices = services.filter(s => !connectedServices.has(s.id));
      
      if (unconnectedServices.length > 0) {
        predictions.push({
          type: 'connection_likelihood',
          confidence: 0.8,
          timeframe: '2 weeks',
          description: `${unconnectedServices.length} services likely need database connections`,
          impact: 'medium',
          entities: unconnectedServices.map(s => s.id),
          recommendation: 'Review service dependencies and add missing database connections'
        });
      }
    }

    return predictions;
  }

  // Utility methods
  private buildAdjacencyMap(edges: Edge[]): Map<string, Set<string>> {
    const adjacencyMap = new Map<string, Set<string>>();
    
    edges.forEach(edge => {
      if (!adjacencyMap.has(edge.from)) {
        adjacencyMap.set(edge.from, new Set());
      }
      if (!adjacencyMap.has(edge.to)) {
        adjacencyMap.set(edge.to, new Set());
      }
      
      adjacencyMap.get(edge.from)!.add(edge.to);
      adjacencyMap.get(edge.to)!.add(edge.from); // Treat as undirected for clustering
    });
    
    return adjacencyMap;
  }

  private getEmptyAnalytics(): GraphAnalytics {
    return {
      density: 0,
      clustering: 0,
      averagePathLength: 0,
      diameter: 0,
      centralityDistribution: {},
      degreeDistribution: {},
      communities: [],
      modularity: 0,
      growthRate: 0,
      activityPatterns: [],
      anomalies: [],
      predictions: []
    };
  }

  // Cache management
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Advanced analysis methods
  async analyzeInfluence(nodeId: string): Promise<InfluenceAnalysis> {
    const node = this.graph.getNode(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const centrality = this.graph.getCentralityScore(nodeId);
    const neighbors = this.graph.getNeighbors(nodeId);
    const allNodes = this.graph.query({}).nodes;
    
    // Calculate reachability (how many nodes can be reached)
    const reachable = this.bfsDistances(nodeId, allNodes);
    const reachableCount = Array.from(reachable.values()).filter(d => d < Infinity).length - 1;
    
    // Determine network position
    const avgCentrality = allNodes.reduce((sum, n) => sum + this.graph.getCentralityScore(n.id), 0) / allNodes.length;
    let networkPosition: 'core' | 'periphery' | 'bridge' | 'isolated';
    
    if (centrality === 0) {
      networkPosition = 'isolated';
    } else if (centrality > avgCentrality * 2) {
      networkPosition = 'core';
    } else if (this.isBridgeNode(nodeId)) {
      networkPosition = 'bridge';
    } else {
      networkPosition = 'periphery';
    }

    return {
      nodeId,
      influenceScore: centrality * (reachableCount / allNodes.length),
      reachability: reachableCount / allNodes.length,
      criticalityIndex: this.calculateCriticalityIndex(nodeId),
      networkPosition,
      keyConnections: neighbors.slice(0, 5).map(n => n.id)
    };
  }

  private isBridgeNode(nodeId: string): boolean {
    // Simplified bridge detection - node whose removal increases connected components
    const neighbors = this.graph.getNeighbors(nodeId);
    if (neighbors.length < 2) return false;

    // Check if removing this node would disconnect its neighbors
    const neighborIds = neighbors.map(n => n.id);
    for (let i = 0; i < neighborIds.length; i++) {
      for (let j = i + 1; j < neighborIds.length; j++) {
        const path = this.graph.findPath(neighborIds[i], neighborIds[j]);
        if (path && path.includes(nodeId) && path.length === 3) {
          return true; // This node is the only path between these neighbors
        }
      }
    }
    
    return false;
  }

  private calculateCriticalityIndex(nodeId: string): number {
    // How much the graph would be affected if this node was removed
    const originalComponents = this.graph.findClusters().size;
    
    // Simulate removal (simplified)
    const neighbors = this.graph.getNeighbors(nodeId);
    const centrality = this.graph.getCentralityScore(nodeId);
    
    // Heuristic: criticality based on centrality and bridge potential
    return centrality * (this.isBridgeNode(nodeId) ? 2 : 1);
  }

  async analyzePath(fromId: string, toId: string): Promise<PathAnalysis> {
    const shortestPath = this.graph.findPath(fromId, toId);
    
    if (!shortestPath) {
      return {
        from: fromId,
        to: toId,
        shortestPath: [],
        alternativePaths: [],
        bottlenecks: [],
        reliability: 0
      };
    }

    // Find alternative paths (simplified)
    const alternativePaths: string[][] = [];
    // In a full implementation, this would find k-shortest paths
    
    // Identify bottlenecks (nodes that appear in most paths)
    const bottlenecks = shortestPath.slice(1, -1).filter(nodeId => 
      this.isBridgeNode(nodeId)
    );

    // Calculate reliability based on path diversity and bottlenecks
    const reliability = Math.max(0, 1 - (bottlenecks.length / shortestPath.length));

    return {
      from: fromId,
      to: toId,
      shortestPath,
      alternativePaths,
      bottlenecks,
      reliability
    };
  }
}