/**
 * System Integration Test
 * 
 * Tests the complete memory graph system working together
 */

import { describe, it, expect } from 'vitest';
import { MemoryGraph, IngestorAgent, PlannerAgent } from '../../../lib/memory-graph';

describe('Memory Graph System Integration', () => {
  it('should work end-to-end with realistic data', async () => {
    // Initialize the system
    const graph = new MemoryGraph();
    const ingestor = new IngestorAgent(graph);
    const planner = new PlannerAgent(graph);
    
    // Ingest realistic deployment scenario
    await ingestor.ingestText(
      `The crm7 service requires SUPABASE_URL and DATABASE_PASSWORD configurations.
       It depends on postgres database and connects to redis cache.
       Issue #101 was caused by missing SUPABASE_URL in production environment.
       Developer john owns the payment service.`,
      'integration-test'
    );
    
    // Verify entities were extracted
    const stats = graph.getStats();
    expect(stats.nodeCount).toBeGreaterThan(5);
    expect(stats.edgeCount).toBeGreaterThan(0);
    
    // Verify specific entity types
    const services = graph.query({ nodeType: 'Service' });
    const configs = graph.query({ nodeType: 'Configuration' });
    const databases = graph.query({ nodeType: 'Database' });
    const incidents = graph.query({ nodeType: 'Incident' });
    const users = graph.query({ nodeType: 'User' });
    
    expect(services.nodes.length).toBeGreaterThan(0);
    expect(configs.nodes.length).toBeGreaterThan(0);
    expect(databases.nodes.length).toBeGreaterThan(0);
    expect(incidents.nodes.length).toBeGreaterThan(0);
    expect(users.nodes.length).toBeGreaterThan(0);
    
    // Test service names
    const serviceNames = services.nodes.map(n => n.properties.name);
    expect(serviceNames.some(name => name?.toLowerCase().includes('crm'))).toBe(true);
    expect(serviceNames.some(name => name?.toLowerCase().includes('payment'))).toBe(true);
    
    // Test configuration keys
    const configKeys = configs.nodes.map(n => n.properties.key);
    expect(configKeys).toContain('SUPABASE_URL');
    expect(configKeys).toContain('DATABASE_PASSWORD');
    
    // Test database names
    const dbNames = databases.nodes.map(n => n.properties.name);
    expect(dbNames.some(name => name?.toLowerCase().includes('postgres'))).toBe(true);
    expect(dbNames.some(name => name?.toLowerCase().includes('redis'))).toBe(true);
    
    // Test risk analysis
    const crmService = services.nodes.find(n => 
      n.properties.name?.toLowerCase().includes('crm')
    );
    
    if (crmService) {
      const risks = await planner.analyzeRisks(crmService.id);
      expect(risks.service).toBeDefined();
      expect(risks.riskScore).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(risks.relatedIncidents)).toBe(true);
      expect(Array.isArray(risks.dependencies)).toBe(true);
    }
    
    // Test recommendations
    const recommendations = await planner.suggestNextAction('test context');
    expect(Array.isArray(recommendations)).toBe(true);
    
    // Test serialization
    const serialized = graph.toJSON();
    expect(serialized).toBeDefined();
    expect(serialized.length).toBeGreaterThan(100);
    
    const newGraph = MemoryGraph.fromJSON(serialized);
    const newStats = newGraph.getStats();
    expect(newStats.nodeCount).toBe(stats.nodeCount);
    expect(newStats.edgeCount).toBe(stats.edgeCount);
    
    console.log('✅ System integration test passed!');
    console.log(`📊 Final stats: ${stats.nodeCount} nodes, ${stats.edgeCount} edges`);
    console.log(`🔧 Services: ${services.nodes.map(n => n.properties.name).join(', ')}`);
    console.log(`⚙️  Configs: ${configs.nodes.map(n => n.properties.key).join(', ')}`);
  });
  
  it('should handle structured data ingestion', async () => {
    const graph = new MemoryGraph();
    const ingestor = new IngestorAgent(graph);
    
    // Test structured data ingestion
    await ingestor.ingestStructuredData({
      entities: [
        {
          id: 'service:api-gateway',
          type: 'Service',
          properties: { name: 'API Gateway', version: '2.1.0' }
        },
        {
          id: 'db:main-postgres',
          type: 'Database',
          properties: { name: 'Main PostgreSQL', type: 'postgresql' }
        }
      ],
      relationships: [
        {
          type: 'DEPENDS_ON',
          from: 'service:api-gateway',
          to: 'db:main-postgres',
          properties: { strength: 0.9 }
        }
      ]
    }, 'structured-test');
    
    const service = graph.getNode('service:api-gateway');
    const database = graph.getNode('db:main-postgres');
    const edge = graph.getEdge('service:api-gateway-DEPENDS_ON-db:main-postgres');
    
    expect(service).toBeDefined();
    expect(service?.properties.version).toBe('2.1.0');
    expect(database).toBeDefined();
    expect(database?.properties.type).toBe('postgresql');
    expect(edge).toBeDefined();
    expect(edge?.properties?.strength).toBe(0.9);
  });
});