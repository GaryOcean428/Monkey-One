/**
 * Planner Agent Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryGraph } from '../../../lib/memory-graph/memory-graph';
import { PlannerAgent } from '../../../lib/memory-graph/planner-agent';

describe('PlannerAgent', () => {
  let graph: MemoryGraph;
  let planner: PlannerAgent;

  beforeEach(() => {
    graph = new MemoryGraph();
    planner = new PlannerAgent(graph);
  });

  describe('Risk Analysis', () => {
    beforeEach(() => {
      // Set up test scenario
      graph.addNode({
        id: 'service:crm7',
        type: 'Service',
        properties: { name: 'CRM7 Service' }
      });

      graph.addNode({
        id: 'env:SUPABASE_URL',
        type: 'Configuration',
        properties: { key: 'SUPABASE_URL', type: 'environment_variable' }
      });

      graph.addNode({
        id: 'env:DATABASE_PASSWORD',
        type: 'Configuration',
        properties: { key: 'DATABASE_PASSWORD', type: 'environment_variable' }
      });

      graph.addNode({
        id: 'incident:101',
        type: 'Incident',
        properties: { number: '101', description: 'Service outage' }
      });

      graph.addNode({
        id: 'database:postgres',
        type: 'Database',
        properties: { name: 'PostgreSQL' }
      });

      // Add relationships
      graph.addEdge({
        type: 'REQUIRES',
        from: 'service:crm7',
        to: 'env:SUPABASE_URL'
      });

      graph.addEdge({
        type: 'DEPENDS_ON',
        from: 'service:crm7',
        to: 'database:postgres'
      });

      graph.addEdge({
        type: 'CAUSED_BY',
        from: 'incident:101',
        to: 'env:SUPABASE_URL'
      });
    });

    it('should analyze risks for a service', async () => {
      const risks = await planner.analyzeRisks('service:crm7');

      expect(risks.service).toBe('CRM7 Service');
      expect(risks.dependencies).toContain('PostgreSQL');
      expect(risks.relatedIncidents).toHaveLength(1);
      expect(risks.relatedIncidents[0].number).toBe('101');
      expect(risks.riskScore).toBeGreaterThan(0);
    });

    it('should handle non-existent service', async () => {
      const risks = await planner.analyzeRisks('service:nonexistent');

      expect(risks.service).toBe('unknown');
      expect(risks.riskScore).toBe(0);
      expect(risks.dependencies).toHaveLength(0);
    });

    it('should calculate risk score based on multiple factors', async () => {
      // Add more connections to increase centrality
      graph.addNode({ id: 'service:auth', type: 'Service', properties: {} });
      graph.addEdge({ type: 'DEPENDS_ON', from: 'service:auth', to: 'service:crm7' });

      // Add more incidents
      graph.addNode({
        id: 'incident:102',
        type: 'Incident',
        properties: { number: '102' }
      });

      const risks = await planner.analyzeRisks('service:crm7');

      expect(risks.riskScore).toBeGreaterThan(50); // Should be high due to centrality and incidents
    });
  });

  describe('Action Recommendations', () => {
    beforeEach(() => {
      // Set up test scenario with pending tasks and incidents
      graph.addNode({
        id: 'task:deploy',
        type: 'Task',
        properties: { 
          name: 'Deploy to production',
          status: 'pending',
          description: 'Deploy CRM service to production'
        }
      });

      graph.addNode({
        id: 'incident:critical',
        type: 'Incident',
        properties: { 
          number: '999',
          status: 'open',
          severity: 'critical'
        }
      });

      graph.addNode({
        id: 'task:update',
        type: 'Task',
        properties: { 
          name: 'Update dependencies',
          status: 'pending'
        }
      });

      graph.addNode({
        id: 'service:crm',
        type: 'Service',
        properties: { name: 'CRM Service' }
      });

      // Add relationships to increase impact scores
      graph.addEdge({ type: 'AFFECTS', from: 'incident:critical', to: 'service:crm' });
      graph.addEdge({ type: 'RELATES_TO', from: 'task:deploy', to: 'service:crm' });
    });

    it('should suggest next actions based on context', async () => {
      const recommendations = await planner.suggestNextAction('deployment context');

      expect(recommendations).toHaveLength(2); // 2 tasks + incident
      expect(recommendations[0].priority).toBe('critical'); // Critical incident should be first
      expect(recommendations[0].action).toContain('incident');
    });

    it('should prioritize recommendations correctly', async () => {
      const recommendations = await planner.suggestNextAction('general context');

      // Should be sorted by priority and impact score
      for (let i = 0; i < recommendations.length - 1; i++) {
        const current = recommendations[i];
        const next = recommendations[i + 1];
        
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const currentPriority = priorityOrder[current.priority];
        const nextPriority = priorityOrder[next.priority];
        
        expect(currentPriority).toBeGreaterThanOrEqual(nextPriority);
      }
    });

    it('should include related entities in recommendations', async () => {
      const recommendations = await planner.suggestNextAction('service context');

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].relatedEntities).toBeDefined();
      expect(recommendations[0].relatedEntities.length).toBeGreaterThan(0);
    });

    it('should estimate effort levels', async () => {
      const recommendations = await planner.suggestNextAction('task context');

      recommendations.forEach(rec => {
        expect(['low', 'medium', 'high']).toContain(rec.estimatedEffort);
      });
    });
  });

  describe('Dependency Analysis', () => {
    beforeEach(() => {
      // Create a dependency chain: service1 -> db1 -> service2 -> db2
      graph.addNode({ id: 'service1', type: 'Service', properties: { name: 'Service 1' } });
      graph.addNode({ id: 'db1', type: 'Database', properties: { name: 'Database 1' } });
      graph.addNode({ id: 'service2', type: 'Service', properties: { name: 'Service 2' } });
      graph.addNode({ id: 'db2', type: 'Database', properties: { name: 'Database 2' } });

      graph.addEdge({ type: 'DEPENDS_ON', from: 'service1', to: 'db1' });
      graph.addEdge({ type: 'DEPENDS_ON', from: 'db1', to: 'service2' });
      graph.addEdge({ type: 'DEPENDS_ON', from: 'service2', to: 'db2' });

      // Add some dependents
      graph.addNode({ id: 'client1', type: 'Service', properties: { name: 'Client 1' } });
      graph.addNode({ id: 'client2', type: 'Service', properties: { name: 'Client 2' } });
      
      graph.addEdge({ type: 'DEPENDS_ON', from: 'client1', to: 'service1' });
      graph.addEdge({ type: 'DEPENDS_ON', from: 'client2', to: 'service1' });
    });

    it('should analyze direct dependencies', () => {
      const analysis = planner.analyzeDependencies('service1');

      expect(analysis.entity).toBe('Service 1');
      expect(analysis.directDependencies).toContain('db1');
      expect(analysis.directDependencies).toHaveLength(1);
    });

    it('should analyze transitive dependencies', () => {
      const analysis = planner.analyzeDependencies('service1');

      expect(analysis.transitiveDependencies).toContain('service2');
      expect(analysis.transitiveDependencies).toContain('db2');
      expect(analysis.transitiveDependencies.length).toBeGreaterThanOrEqual(2);
    });

    it('should identify dependents', () => {
      const analysis = planner.analyzeDependencies('service1');

      expect(analysis.dependents).toContain('client1');
      expect(analysis.dependents).toContain('client2');
      expect(analysis.dependents).toHaveLength(2);
    });

    it('should find critical path', () => {
      const analysis = planner.analyzeDependencies('service1');

      expect(analysis.criticalPath).toContain('service1');
      expect(analysis.criticalPath.length).toBeGreaterThan(1);
    });

    it('should identify risk factors', () => {
      // Add many dependencies to trigger risk factors
      for (let i = 0; i < 15; i++) {
        graph.addNode({ id: `dep${i}`, type: 'Service', properties: {} });
        graph.addEdge({ type: 'DEPENDS_ON', from: 'service1', to: `dep${i}` });
      }

      const analysis = planner.analyzeDependencies('service1');

      expect(analysis.riskFactors).toContain('High number of direct dependencies');
    });

    it('should handle non-existent entity', () => {
      expect(() => {
        planner.analyzeDependencies('nonexistent');
      }).toThrow('Entity nonexistent not found');
    });
  });

  describe('Impact Analysis', () => {
    beforeEach(() => {
      // Create impact scenario
      graph.addNode({ id: 'core-service', type: 'Service', properties: { name: 'Core Service' } });
      graph.addNode({ id: 'service-a', type: 'Service', properties: { name: 'Service A' } });
      graph.addNode({ id: 'service-b', type: 'Service', properties: { name: 'Service B' } });
      graph.addNode({ id: 'service-c', type: 'Service', properties: { name: 'Service C' } });
      graph.addNode({ id: 'user1', type: 'User', properties: { name: 'User 1' } });
      graph.addNode({ id: 'user2', type: 'User', properties: { name: 'User 2' } });

      // Create dependency chain
      graph.addEdge({ type: 'DEPENDS_ON', from: 'service-a', to: 'core-service' });
      graph.addEdge({ type: 'DEPENDS_ON', from: 'service-b', to: 'core-service' });
      graph.addEdge({ type: 'DEPENDS_ON', from: 'service-c', to: 'service-a' });
      graph.addEdge({ type: 'DEPENDS_ON', from: 'user1', to: 'service-a' });
      graph.addEdge({ type: 'DEPENDS_ON', from: 'user2', to: 'service-b' });
    });

    it('should analyze direct impact', () => {
      const analysis = planner.analyzeImpact('core-service');

      expect(analysis.entity).toBe('Core Service');
      expect(analysis.directImpact).toContain('service-a');
      expect(analysis.directImpact).toContain('service-b');
      expect(analysis.directImpact).toHaveLength(2);
    });

    it('should analyze cascading impact', () => {
      const analysis = planner.analyzeImpact('core-service');

      expect(analysis.cascadingImpact).toContain('service-c');
      expect(analysis.cascadingImpact).toContain('user1');
      expect(analysis.cascadingImpact).toContain('user2');
    });

    it('should identify affected services', () => {
      const analysis = planner.analyzeImpact('core-service');

      expect(analysis.affectedServices).toContain('service-a');
      expect(analysis.affectedServices).toContain('service-b');
      expect(analysis.affectedServices).toContain('service-c');
    });

    it('should identify affected users', () => {
      const analysis = planner.analyzeImpact('core-service');

      expect(analysis.affectedUsers).toContain('user1');
      expect(analysis.affectedUsers).toContain('user2');
    });

    it('should calculate risk level', () => {
      const analysis = planner.analyzeImpact('core-service');

      expect(['low', 'medium', 'high', 'critical']).toContain(analysis.riskLevel);
      expect(analysis.riskLevel).toBe('medium'); // Based on the test setup
    });

    it('should handle high impact scenarios', () => {
      // Add many more services and users to increase impact
      for (let i = 0; i < 25; i++) {
        graph.addNode({ id: `service-${i}`, type: 'Service', properties: {} });
        graph.addEdge({ type: 'DEPENDS_ON', from: `service-${i}`, to: 'core-service' });
      }

      for (let i = 0; i < 150; i++) {
        graph.addNode({ id: `user-${i}`, type: 'User', properties: {} });
        graph.addEdge({ type: 'DEPENDS_ON', from: `user-${i}`, to: 'core-service' });
      }

      const analysis = planner.analyzeImpact('core-service');

      expect(analysis.riskLevel).toBe('critical');
    });
  });

  describe('Configuration Gap Analysis', () => {
    beforeEach(() => {
      // Set up services with missing configurations
      graph.addNode({
        id: 'service:web',
        type: 'Service',
        properties: { name: 'Web Service' }
      });

      graph.addNode({
        id: 'config:database_url',
        type: 'Configuration',
        properties: { key: 'DATABASE_URL', critical: true }
      });

      graph.addNode({
        id: 'config:api_key',
        type: 'Configuration',
        properties: { key: 'API_KEY', critical: false }
      });

      // Service requires these configs but doesn't have them
      graph.addEdge({
        type: 'REQUIRES',
        from: 'service:web',
        to: 'config:database_url'
      });

      graph.addEdge({
        type: 'REQUIRES',
        from: 'service:web',
        to: 'config:api_key'
      });
    });

    it('should identify configuration gaps in recommendations', async () => {
      const recommendations = await planner.suggestNextAction('configuration');

      const configRecommendations = recommendations.filter(r => 
        r.action.includes('Configure missing setting')
      );

      expect(configRecommendations.length).toBeGreaterThan(0);
      expect(configRecommendations.some(r => r.action.includes('DATABASE_URL'))).toBe(true);
    });

    it('should prioritize critical configurations', async () => {
      const recommendations = await planner.suggestNextAction('configuration');

      const criticalConfigRec = recommendations.find(r => 
        r.action.includes('DATABASE_URL')
      );
      const nonCriticalConfigRec = recommendations.find(r => 
        r.action.includes('API_KEY')
      );

      if (criticalConfigRec && nonCriticalConfigRec) {
        expect(criticalConfigRec.priority).toBe('high');
        expect(nonCriticalConfigRec.priority).toBe('medium');
      }
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle circular dependency detection', () => {
      // Create circular dependency
      graph.addNode({ id: 'a', type: 'Service', properties: {} });
      graph.addNode({ id: 'b', type: 'Service', properties: {} });
      graph.addNode({ id: 'c', type: 'Service', properties: {} });

      graph.addEdge({ type: 'DEPENDS_ON', from: 'a', to: 'b' });
      graph.addEdge({ type: 'DEPENDS_ON', from: 'b', to: 'c' });
      graph.addEdge({ type: 'DEPENDS_ON', from: 'c', to: 'a' });

      const analysis = planner.analyzeDependencies('a');

      expect(analysis.riskFactors).toContain('Potential circular dependency detected');
    });

    it('should identify single points of failure', () => {
      graph.addNode({ id: 'main', type: 'Service', properties: {} });
      graph.addNode({ id: 'critical-dep', type: 'Service', properties: {} });

      // Only main depends on critical-dep (single point of failure)
      graph.addEdge({ type: 'DEPENDS_ON', from: 'main', to: 'critical-dep' });

      const analysis = planner.analyzeDependencies('main');

      expect(analysis.riskFactors).toContain('Has single points of failure in dependencies');
    });

    it('should handle empty graph gracefully', async () => {
      const recommendations = await planner.suggestNextAction('empty context');
      const risks = await planner.analyzeRisks('nonexistent');

      expect(recommendations).toHaveLength(0);
      expect(risks.riskScore).toBe(0);
    });
  });
});