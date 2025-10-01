/**
 * Ingestor Agent Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryGraph } from '../../../lib/memory-graph/memory-graph';
import { IngestorAgent } from '../../../lib/memory-graph/ingestor-agent';

describe('IngestorAgent', () => {
  let graph: MemoryGraph;
  let ingestor: IngestorAgent;

  beforeEach(() => {
    graph = new MemoryGraph();
    ingestor = new IngestorAgent(graph);
  });

  describe('Text Ingestion', () => {
    it('should extract service entities from text', async () => {
      const text = "The crm7 service handles customer data and the auth service manages authentication.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const services = graph.query({ nodeType: 'Service' });
      expect(services.nodes).toHaveLength(2);
      
      const serviceNames = services.nodes.map(n => n.properties.name);
      expect(serviceNames).toContain('crm7');
      expect(serviceNames).toContain('auth');
    });

    it('should extract environment variables from text', async () => {
      const text = "The service requires SUPABASE_URL and DATABASE_PASSWORD environment variables.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const configs = graph.query({ nodeType: 'Configuration' });
      expect(configs.nodes).toHaveLength(2);
      
      const configKeys = configs.nodes.map(n => n.properties.key);
      expect(configKeys).toContain('SUPABASE_URL');
      expect(configKeys).toContain('DATABASE_PASSWORD');
    });

    it('should extract incidents from text', async () => {
      const text = "Issue #123 was resolved and incident INC-456 is still open.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const incidents = graph.query({ nodeType: 'Incident' });
      expect(incidents.nodes).toHaveLength(2);
      
      const incidentNumbers = incidents.nodes.map(n => n.properties.number);
      expect(incidentNumbers).toContain('123');
      expect(incidentNumbers).toContain('456');
    });

    it('should extract databases from text', async () => {
      const text = "The postgres database stores user data and redis database handles caching.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const databases = graph.query({ nodeType: 'Database' });
      expect(databases.nodes).toHaveLength(2);
      
      const dbNames = databases.nodes.map(n => n.properties.name);
      expect(dbNames).toContain('postgres');
      expect(dbNames).toContain('redis');
    });

    it('should extract APIs from text', async () => {
      const text = "The payment api handles transactions and the user api manages profiles.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const apis = graph.query({ nodeType: 'API' });
      expect(apis.nodes).toHaveLength(2);
      
      const apiNames = apis.nodes.map(n => n.properties.name);
      expect(apiNames).toContain('payment');
      expect(apiNames).toContain('user');
    });

    it('should extract users and teams from text', async () => {
      const text = "Developer john and team alpha are working on this project.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const users = graph.query({ nodeType: 'User' });
      expect(users.nodes).toHaveLength(2);
      
      const userNames = users.nodes.map(n => n.properties.name);
      expect(userNames).toContain('john');
      expect(userNames).toContain('alpha');
    });

    it('should extract environments from text', async () => {
      const text = "Deploy to production environment and test in staging environment.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const environments = graph.query({ nodeType: 'Environment' });
      expect(environments.nodes).toHaveLength(2);
      
      const envNames = environments.nodes.map(n => n.properties.name);
      expect(envNames).toContain('production');
      expect(envNames).toContain('staging');
    });
  });

  describe('Relationship Extraction', () => {
    it('should extract "requires" relationships', async () => {
      const text = "The crm7 service requires SUPABASE_URL configuration.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const result = graph.query({});
      const requiresEdges = result.edges.filter(e => e.type === 'REQUIRES');
      
      expect(requiresEdges).toHaveLength(1);
      expect(requiresEdges[0].from).toContain('service:crm7');
      expect(requiresEdges[0].to).toContain('env:SUPABASE_URL');
    });

    it('should extract "depends on" relationships', async () => {
      const text = "The auth service depends on postgres database.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const result = graph.query({});
      const dependsEdges = result.edges.filter(e => e.type === 'DEPENDS_ON');
      
      expect(dependsEdges).toHaveLength(1);
      expect(dependsEdges[0].from).toContain('service:auth');
      expect(dependsEdges[0].to).toContain('database:postgres');
    });

    it('should extract "connects to" relationships', async () => {
      const text = "The api service connects to redis database.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const result = graph.query({});
      const connectsEdges = result.edges.filter(e => e.type === 'CONNECTS_TO');
      
      expect(connectsEdges).toHaveLength(1);
      expect(connectsEdges[0].from).toContain('service:api');
      expect(connectsEdges[0].to).toContain('database:redis');
    });

    it('should extract "deployed to" relationships', async () => {
      const text = "The crm service deployed to production environment.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const result = graph.query({});
      const deployedEdges = result.edges.filter(e => e.type === 'DEPLOYED_TO');
      
      expect(deployedEdges).toHaveLength(1);
      expect(deployedEdges[0].from).toContain('service:crm');
      expect(deployedEdges[0].to).toContain('environment:production');
    });

    it('should extract "caused by" relationships', async () => {
      const text = "The outage caused by database failure.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const result = graph.query({});
      const causedByEdges = result.edges.filter(e => e.type === 'CAUSED_BY');
      
      expect(causedByEdges).toHaveLength(1);
      expect(causedByEdges[0].properties?.confidence).toBeGreaterThan(0);
    });

    it('should extract "manages" relationships', async () => {
      const text = "The admin service manages user database.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const result = graph.query({});
      const managesEdges = result.edges.filter(e => e.type === 'MANAGES');
      
      expect(managesEdges).toHaveLength(1);
      expect(managesEdges[0].from).toContain('service:admin');
      expect(managesEdges[0].to).toContain('database:user');
    });

    it('should extract "owns" relationships', async () => {
      const text = "The team owns payment service.";
      
      await ingestor.ingestText(text, 'test-source');
      
      const result = graph.query({});
      const ownsEdges = result.edges.filter(e => e.type === 'OWNS');
      
      expect(ownsEdges).toHaveLength(1);
      expect(ownsEdges[0].from).toContain('user:team');
      expect(ownsEdges[0].to).toContain('service:payment');
    });
  });

  describe('Structured Data Ingestion', () => {
    it('should ingest structured entities and relationships', async () => {
      const data = {
        entities: [
          {
            id: 'custom-service',
            type: 'Service' as const,
            properties: { name: 'Custom Service', version: '1.0' }
          },
          {
            id: 'custom-db',
            type: 'Database' as const,
            properties: { name: 'Custom DB', type: 'postgresql' }
          }
        ],
        relationships: [
          {
            type: 'DEPENDS_ON' as const,
            from: 'custom-service',
            to: 'custom-db',
            properties: { strength: 0.9 }
          }
        ]
      };

      await ingestor.ingestStructuredData(data, 'structured-source');

      const service = graph.getNode('custom-service');
      const db = graph.getNode('custom-db');
      const edge = graph.getEdge('custom-service-DEPENDS_ON-custom-db');

      expect(service).toBeDefined();
      expect(service?.properties.version).toBe('1.0');
      expect(db).toBeDefined();
      expect(db?.properties.type).toBe('postgresql');
      expect(edge).toBeDefined();
      expect(edge?.properties?.strength).toBe(0.9);
    });
  });

  describe('Advanced Features', () => {
    it('should extract entities with context', () => {
      const text = "The payment service handles transactions.";
      const context = {
        domain: 'e-commerce',
        source: 'architecture-docs',
        timestamp: new Date('2024-01-01')
      };

      const entities = ingestor.extractEntitiesWithContext(text, context);

      expect(entities).toHaveLength(1);
      expect(entities[0].properties.domain).toBe('e-commerce');
      expect(entities[0].properties.sourceContext).toBe('architecture-docs');
      expect(entities[0].properties.extractedAt).toEqual(context.timestamp);
    });

    it('should handle batch processing', async () => {
      const texts = [
        { content: "Service A depends on Database X", source: 'doc1' },
        { content: "Service B requires API_KEY config", source: 'doc2' },
        { content: "Service C connects to Redis cache", source: 'doc3' }
      ];

      await ingestor.ingestMultipleTexts(texts, { batchSize: 2 });

      const services = graph.query({ nodeType: 'Service' });
      const configs = graph.query({ nodeType: 'Configuration' });
      const databases = graph.query({ nodeType: 'Database' });

      expect(services.nodes.length).toBeGreaterThanOrEqual(3);
      expect(configs.nodes.length).toBeGreaterThanOrEqual(1);
      expect(databases.nodes.length).toBeGreaterThanOrEqual(2);
    });

    it('should provide extraction statistics', () => {
      // Add some test data first
      graph.addNode({ id: 'test1', type: 'Service', properties: {} });
      graph.addNode({ id: 'test2', type: 'Database', properties: {} });
      graph.addEdge({ type: 'DEPENDS_ON', from: 'test1', to: 'test2' });

      const stats = ingestor.getExtractionStats();

      expect(stats.totalEntitiesExtracted).toBe(2);
      expect(stats.totalRelationshipsExtracted).toBe(1);
      expect(stats.entityTypeDistribution.Service).toBe(1);
      expect(stats.entityTypeDistribution.Database).toBe(1);
    });
  });

  describe('Complex Text Processing', () => {
    it('should handle complex deployment scenario', async () => {
      const complexText = `
        The crm7 service requires SUPABASE_URL and SUPABASE_ANON_KEY environment variables.
        It depends on postgres database and connects to redis cache.
        The service is deployed to production environment and managed by team alpha.
        Issue #101 was caused by missing SUPABASE_URL configuration.
        Developer john owns the payment api which connects to the same postgres database.
      `;

      await ingestor.ingestText(complexText, 'deployment-scenario');

      // Verify entities
      const services = graph.query({ nodeType: 'Service' });
      const configs = graph.query({ nodeType: 'Configuration' });
      const databases = graph.query({ nodeType: 'Database' });
      const environments = graph.query({ nodeType: 'Environment' });
      const users = graph.query({ nodeType: 'User' });
      const incidents = graph.query({ nodeType: 'Incident' });
      const apis = graph.query({ nodeType: 'API' });

      expect(services.nodes.length).toBeGreaterThanOrEqual(1);
      expect(configs.nodes.length).toBeGreaterThanOrEqual(2);
      expect(databases.nodes.length).toBeGreaterThanOrEqual(2);
      expect(environments.nodes.length).toBeGreaterThanOrEqual(1);
      expect(users.nodes.length).toBeGreaterThanOrEqual(2);
      expect(incidents.nodes.length).toBeGreaterThanOrEqual(1);
      expect(apis.nodes.length).toBeGreaterThanOrEqual(1);

      // Verify relationships
      const allEdges = graph.query({}).edges;
      const relationshipTypes = allEdges.map(e => e.type);
      
      expect(relationshipTypes).toContain('REQUIRES');
      expect(relationshipTypes).toContain('DEPENDS_ON');
      expect(relationshipTypes).toContain('CONNECTS_TO');
      expect(relationshipTypes).toContain('DEPLOYED_TO');
      expect(relationshipTypes).toContain('MANAGES');
      expect(relationshipTypes).toContain('CAUSED_BY');
      expect(relationshipTypes).toContain('OWNS');
    });

    it('should handle edge cases in text processing', async () => {
      const edgeCaseText = `
        Service-with-hyphens requires ENV_VAR_123.
        The API_v2 service connects to DB-cluster-01.
        Issue INC-2024-001 and bug #999 are related.
      `;

      await ingestor.ingestText(edgeCaseText, 'edge-cases');

      const result = graph.query({});
      
      // Should handle hyphens and numbers in names
      expect(result.nodes.some(n => n.properties.name?.includes('hyphens'))).toBe(true);
      expect(result.nodes.some(n => n.properties.key === 'ENV_VAR_123')).toBe(true);
      expect(result.nodes.some(n => n.properties.name?.includes('API_v2'))).toBe(true);
    });
  });
});