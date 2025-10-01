/**
 * Planner Agent Implementation
 * 
 * Responsible for analyzing the memory graph and providing
 * insights, risk assessments, and action recommendations.
 */

import type { RiskAnalysis } from './types';
import type { MemoryGraph } from './memory-graph';

export interface ActionRecommendation {
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  impactScore: number;
  relatedEntities: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
}

export interface DependencyAnalysis {
  entity: string;
  directDependencies: string[];
  transitiveDependencies: string[];
  dependents: string[];
  criticalPath: string[];
  riskFactors: string[];
}

export interface ImpactAnalysis {
  entity: string;
  directImpact: string[];
  cascadingImpact: string[];
  affectedServices: string[];
  affectedUsers: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export class PlannerAgent {
  constructor(private graph: MemoryGraph) {}
  
  async analyzeRisks(serviceId: string): Promise<RiskAnalysis> {
    // Find all dependencies
    const deps = this.graph.query({
      nodeType: 'Configuration',
      depth: 2
    });
    
    // Find related incidents
    const incidents = this.graph.query({
      nodeType: 'Incident',
      depth: 1
    });
    
    // Find missing configurations
    const service = this.graph.getNode(serviceId);
    if (!service) {
      return { 
        service: 'unknown',
        missingConfigurations: [],
        relatedIncidents: [],
        dependencies: [],
        riskScore: 0
      };
    }
    
    // Analyze configuration completeness
    const requiredConfigs = this.findRequiredConfigurations(serviceId);
    const existingConfigs = this.findExistingConfigurations(serviceId);
    const missingConfigs = requiredConfigs.filter(
      config => !existingConfigs.includes(config)
    );
    
    // Find actual service dependencies
    const serviceDeps = this.graph.query({ depth: 1 }).edges
      .filter(edge => edge.from === serviceId && 
        ['DEPENDS_ON', 'REQUIRES'].includes(edge.type))
      .map(edge => this.graph.getNode(edge.to))
      .filter(node => node?.type === 'Service')
      .map(node => node!.properties.name || node!.id);

    const risks: RiskAnalysis = {
      service: service.properties.name || serviceId,
      missingConfigurations: missingConfigs,
      relatedIncidents: incidents.nodes.map(n => ({
        id: n.id,
        number: n.properties.number,
        description: n.properties.description
      })),
      dependencies: serviceDeps,
      riskScore: 0
    };
    
    // Calculate risk score based on multiple factors
    const centralityScore = this.graph.getCentralityScore(serviceId);
    const incidentCount = incidents.nodes.length;
    const missingConfigCount = missingConfigs.length;
    const dependencyCount = risks.dependencies.length;
    
    risks.riskScore = 
      centralityScore * 10 +           // High connectivity = higher risk
      incidentCount * 25 +             // Past incidents increase risk
      missingConfigCount * 15 +        // Missing configs are risky
      dependencyCount * 5;             // More dependencies = more risk
    
    return risks;
  }
  
  async suggestNextAction(context: string): Promise<ActionRecommendation[]> {
    // Query graph for relevant context
    const pendingTasks = this.graph.query({
      nodeType: 'Task',
      properties: { status: 'pending' },
      depth: 1,
      limit: 10
    });
    
    const openIncidents = this.graph.query({
      nodeType: 'Incident',
      properties: { status: 'open' },
      depth: 1,
      limit: 5
    });
    
    const recommendations: ActionRecommendation[] = [];
    
    // Process open incidents (highest priority)
    for (const incident of openIncidents.nodes) {
      const impactScore = this.calculateImpactScore(incident.id);
      recommendations.push({
        action: `Resolve incident ${incident.properties.number || incident.id}`,
        priority: impactScore > 75 ? 'critical' : impactScore > 50 ? 'high' : 'medium',
        reasoning: `Open incident affecting system stability. Impact score: ${impactScore}`,
        impactScore,
        relatedEntities: this.getRelatedEntities(incident.id),
        estimatedEffort: this.estimateEffort(incident.id)
      });
    }
    
    // Process pending tasks
    for (const task of pendingTasks.nodes) {
      const impactScore = this.calculateImpactScore(task.id);
      recommendations.push({
        action: `Complete task: ${task.properties.name || task.properties.description}`,
        priority: impactScore > 60 ? 'high' : impactScore > 30 ? 'medium' : 'low',
        reasoning: `Pending task that may impact system functionality`,
        impactScore,
        relatedEntities: this.getRelatedEntities(task.id),
        estimatedEffort: this.estimateEffort(task.id)
      });
    }
    
    // Identify configuration gaps
    const configGaps = this.identifyConfigurationGaps();
    for (const gap of configGaps) {
      recommendations.push({
        action: `Configure missing setting: ${gap.config}`,
        priority: gap.critical ? 'high' : 'medium',
        reasoning: `Missing configuration may cause service failures`,
        impactScore: gap.critical ? 70 : 40,
        relatedEntities: [gap.service],
        estimatedEffort: 'low'
      });
    }
    
    // Sort by priority and impact score
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.impactScore - a.impactScore;
    });
  }
  
  analyzeDependencies(entityId: string): DependencyAnalysis {
    const entity = this.graph.getNode(entityId);
    if (!entity) {
      throw new Error(`Entity ${entityId} not found`);
    }
    
    // Find direct dependencies (what this entity depends on)
    const directDeps = this.graph.query({
      depth: 1
    }).edges
      .filter(edge => edge.from === entityId && 
        ['DEPENDS_ON', 'REQUIRES'].includes(edge.type))
      .map(edge => edge.to);
    
    // Find transitive dependencies
    const transitiveDeps = new Set<string>();
    const visited = new Set<string>();
    
    const findTransitive = (nodeId: string, depth: number) => {
      if (depth > 5 || visited.has(nodeId)) return; // Prevent infinite loops
      visited.add(nodeId);
      
      const deps = this.graph.query({ depth: 1 }).edges
        .filter(edge => edge.from === nodeId && 
          ['DEPENDS_ON', 'REQUIRES'].includes(edge.type))
        .map(edge => edge.to);
      
      deps.forEach(dep => {
        transitiveDeps.add(dep);
        findTransitive(dep, depth + 1);
      });
    };
    
    directDeps.forEach(dep => findTransitive(dep, 0));
    
    // Find dependents (what depends on this entity)
    const dependents = this.graph.query({
      depth: 1
    }).edges
      .filter(edge => edge.to === entityId && 
        ['DEPENDS_ON', 'REQUIRES'].includes(edge.type))
      .map(edge => edge.from);
    
    // Find critical path (longest dependency chain)
    const criticalPath = this.findCriticalPath(entityId);
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(entityId, {
      directDeps,
      transitiveDeps: Array.from(transitiveDeps),
      dependents
    });
    
    return {
      entity: entity.properties.name || entityId,
      directDependencies: directDeps,
      transitiveDependencies: Array.from(transitiveDeps),
      dependents,
      criticalPath,
      riskFactors
    };
  }
  
  analyzeImpact(entityId: string): ImpactAnalysis {
    const entity = this.graph.getNode(entityId);
    if (!entity) {
      throw new Error(`Entity ${entityId} not found`);
    }
    
    // Find direct impact (immediate dependents)
    const directImpact = this.graph.getNeighbors(entityId, 'in')
      .map(node => node.id);
    
    // Find cascading impact (transitive dependents)
    const cascadingImpact = new Set<string>();
    const visited = new Set<string>();
    
    const findCascading = (nodeId: string, depth: number) => {
      if (depth > 5 || visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const dependents = this.graph.getNeighbors(nodeId, 'in');
      dependents.forEach(dependent => {
        cascadingImpact.add(dependent.id);
        findCascading(dependent.id, depth + 1);
      });
    };
    
    directImpact.forEach(id => findCascading(id, 0));
    
    // Find affected services and users
    const allAffected = [...directImpact, ...Array.from(cascadingImpact)];
    const affectedServices = allAffected
      .map(id => this.graph.getNode(id))
      .filter(node => node?.type === 'Service')
      .map(node => node!.id);
    
    const affectedUsers = allAffected
      .map(id => this.graph.getNode(id))
      .filter(node => node?.type === 'User')
      .map(node => node!.id);
    
    // Calculate risk level
    const totalImpact = directImpact.length + cascadingImpact.size;
    const serviceImpact = affectedServices.length;
    const userImpact = affectedUsers.length;
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (totalImpact > 20 || serviceImpact > 10 || userImpact > 100) {
      riskLevel = 'critical';
    } else if (totalImpact > 10 || serviceImpact > 5 || userImpact > 50) {
      riskLevel = 'high';
    } else if (totalImpact > 5 || serviceImpact > 2 || userImpact > 10) {
      riskLevel = 'medium';
    }
    
    return {
      entity: entity.properties.name || entityId,
      directImpact,
      cascadingImpact: Array.from(cascadingImpact),
      affectedServices,
      affectedUsers,
      riskLevel
    };
  }
  
  // Private helper methods
  
  private findRequiredConfigurations(serviceId: string): string[] {
    const configs: string[] = [];
    
    // Find configuration requirements through relationships
    const requirements = this.graph.query({ depth: 1 }).edges
      .filter(edge => edge.from === serviceId && edge.type === 'REQUIRES')
      .map(edge => edge.to);
    
    requirements.forEach(reqId => {
      const node = this.graph.getNode(reqId);
      if (node?.type === 'Configuration') {
        configs.push(node.properties.key || node.id);
      }
    });
    
    return configs;
  }
  
  private findExistingConfigurations(serviceId: string): string[] {
    const configs: string[] = [];
    
    // Find existing configurations
    const existing = this.graph.query({ depth: 1 }).edges
      .filter(edge => edge.from === serviceId && edge.type === 'PROVIDES')
      .map(edge => edge.to);
    
    existing.forEach(configId => {
      const node = this.graph.getNode(configId);
      if (node?.type === 'Configuration') {
        configs.push(node.properties.key || node.id);
      }
    });
    
    return configs;
  }
  
  private calculateImpactScore(entityId: string): number {
    const centrality = this.graph.getCentralityScore(entityId);
    const neighbors = this.graph.getNeighbors(entityId);
    const criticalNeighbors = neighbors.filter(n => 
      ['Service', 'Database', 'API'].includes(n.type)
    ).length;
    
    return centrality * 5 + criticalNeighbors * 10;
  }
  
  private getRelatedEntities(entityId: string): string[] {
    return this.graph.getNeighbors(entityId).map(n => n.id);
  }
  
  private estimateEffort(entityId: string): 'low' | 'medium' | 'high' {
    const complexity = this.graph.getCentralityScore(entityId);
    if (complexity > 10) return 'high';
    if (complexity > 5) return 'medium';
    return 'low';
  }
  
  private identifyConfigurationGaps(): Array<{
    service: string;
    config: string;
    critical: boolean;
  }> {
    const gaps: Array<{ service: string; config: string; critical: boolean }> = [];
    
    // Find services with missing required configurations
    const services = this.graph.getNodesByType('Service');
    
    services.forEach(service => {
      const required = this.findRequiredConfigurations(service.id);
      const existing = this.findExistingConfigurations(service.id);
      
      const missing = required.filter(config => !existing.includes(config));
      missing.forEach(config => {
        gaps.push({
          service: service.id,
          config,
          critical: this.isCriticalConfig(config)
        });
      });
    });
    
    return gaps;
  }
  
  private isCriticalConfig(configKey: string): boolean {
    const criticalPatterns = [
      /database/i,
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /url/i,
      /host/i,
      /port/i
    ];
    
    return criticalPatterns.some(pattern => pattern.test(configKey));
  }
  
  private findCriticalPath(entityId: string): string[] {
    // Find the longest dependency chain starting from this entity
    const visited = new Set<string>();
    let longestPath: string[] = [];
    
    const dfs = (nodeId: string, currentPath: string[]) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const deps = this.graph.query({ depth: 1 }).edges
        .filter(edge => edge.from === nodeId && edge.type === 'DEPENDS_ON')
        .map(edge => edge.to);
      
      if (deps.length === 0) {
        if (currentPath.length > longestPath.length) {
          longestPath = [...currentPath];
        }
        return;
      }
      
      deps.forEach(dep => {
        dfs(dep, [...currentPath, dep]);
      });
    };
    
    dfs(entityId, [entityId]);
    return longestPath;
  }
  
  private identifyRiskFactors(
    entityId: string,
    analysis: {
      directDeps: string[];
      transitiveDeps: string[];
      dependents: string[];
    }
  ): string[] {
    const risks: string[] = [];
    
    if (analysis.directDeps.length > 10) {
      risks.push('High number of direct dependencies');
    }
    
    if (analysis.transitiveDeps.length > 20) {
      risks.push('Complex transitive dependency chain');
    }
    
    if (analysis.dependents.length > 15) {
      risks.push('Many services depend on this entity');
    }
    
    // Check for circular dependencies by looking for cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const neighbors = this.graph.query({ depth: 1 }).edges
        .filter(edge => edge.from === nodeId && edge.type === 'DEPENDS_ON')
        .map(edge => edge.to);
      
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor)) return true;
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    if (hasCycle(entityId)) {
      risks.push('Potential circular dependency detected');
    }
    
    // Check for single points of failure
    const criticalDeps = analysis.directDeps.filter(depId => {
      const depDependents = this.graph.getNeighbors(depId, 'in');
      return depDependents.length === 1; // Only this entity depends on it
    });
    
    if (criticalDeps.length > 0) {
      risks.push('Has single points of failure in dependencies');
    }
    
    return risks;
  }
}