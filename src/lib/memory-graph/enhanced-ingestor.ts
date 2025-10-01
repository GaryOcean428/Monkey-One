/**
 * Enhanced Ingestor Agent with ML Integration
 * 
 * Combines traditional regex-based extraction with machine learning
 * enhanced patterns for improved accuracy and context awareness.
 */

import { IngestorAgent } from './ingestor-agent';
import { MLEntityExtractor } from './ml-extractor';
import type { MemoryGraph } from './memory-graph';
import type { EntityExtraction, RelationshipExtraction } from './types';

interface EnhancedIngestionOptions {
  useML?: boolean;
  confidence?: number;
  domain?: string;
  batchSize?: number;
  enableLearning?: boolean;
}

interface IngestionResult {
  entitiesExtracted: number;
  relationshipsExtracted: number;
  confidence: number;
  processingTime: number;
  method: 'traditional' | 'ml' | 'hybrid';
}

export class EnhancedIngestorAgent extends IngestorAgent {
  private mlExtractor: MLEntityExtractor;
  private learningEnabled: boolean = true;
  private ingestionHistory: IngestionResult[] = [];

  constructor(graph: MemoryGraph) {
    super(graph);
    this.mlExtractor = new MLEntityExtractor();
  }

  async ingestTextEnhanced(
    text: string, 
    source: string, 
    options: EnhancedIngestionOptions = {}
  ): Promise<IngestionResult> {
    const startTime = Date.now();
    const {
      useML = true,
      confidence = 0.7,
      domain,
      enableLearning = this.learningEnabled
    } = options;

    let entities: EntityExtraction[] = [];
    let relationships: RelationshipExtraction[] = [];
    let method: 'traditional' | 'ml' | 'hybrid' = 'traditional';

    if (useML) {
      // Use ML-enhanced extraction
      const mlResult = this.mlExtractor.extractWithContext(text, {
        domain,
        confidence,
        source
      });

      // Combine with traditional extraction for hybrid approach
      const traditionalEntities = this.extractEntities(text);
      const traditionalRelationships = this.extractRelationships(text, traditionalEntities);

      // Merge and deduplicate results
      entities = this.mergeEntities(mlResult.entities, traditionalEntities, confidence);
      relationships = this.mergeRelationships(
        mlResult.relationships, 
        traditionalRelationships, 
        entities
      );

      method = traditionalEntities.length > 0 ? 'hybrid' : 'ml';
    } else {
      // Use traditional extraction only
      entities = this.extractEntities(text);
      relationships = this.extractRelationships(text, entities);
    }

    // Filter by confidence threshold
    const filteredEntities = entities.filter(e => 
      (e.properties.confidence || 1.0) >= confidence
    );
    const filteredRelationships = relationships.filter(r => 
      (r.properties?.confidence || 1.0) >= confidence
    );

    // Add to graph
    for (const entity of filteredEntities) {
      this.graph.addNode({
        id: entity.id,
        type: entity.type,
        properties: {
          ...entity.properties,
          extractionMethod: method,
          source
        },
        metadata: { 
          createdBy: 'EnhancedIngestorAgent', 
          source,
          confidence: entity.properties.confidence
        }
      });
    }

    for (const rel of filteredRelationships) {
      this.graph.addEdge({
        type: rel.type,
        from: rel.from,
        to: rel.to,
        properties: {
          ...rel.properties,
          extractionMethod: method,
          source
        }
      });
    }

    const processingTime = Date.now() - startTime;
    const avgConfidence = this.calculateAverageConfidence(filteredEntities, filteredRelationships);

    const result: IngestionResult = {
      entitiesExtracted: filteredEntities.length,
      relationshipsExtracted: filteredRelationships.length,
      confidence: avgConfidence,
      processingTime,
      method
    };

    this.ingestionHistory.push(result);
    return result;
  }

  private mergeEntities(
    mlEntities: EntityExtraction[], 
    traditionalEntities: EntityExtraction[],
    confidenceThreshold: number
  ): EntityExtraction[] {
    const merged = new Map<string, EntityExtraction>();
    
    // Add ML entities first (higher priority)
    mlEntities.forEach(entity => {
      if ((entity.properties.confidence || 0) >= confidenceThreshold) {
        merged.set(entity.id, entity);
      }
    });
    
    // Add traditional entities if not already present or if they have higher confidence
    traditionalEntities.forEach(entity => {
      const existing = merged.get(entity.id);
      const entityConfidence = entity.properties.confidence || 0.8; // Default confidence for traditional
      
      if (!existing || entityConfidence > (existing.properties.confidence || 0)) {
        merged.set(entity.id, {
          ...entity,
          properties: {
            ...entity.properties,
            confidence: entityConfidence,
            extractedBy: existing ? 'hybrid' : 'traditional'
          }
        });
      }
    });
    
    return Array.from(merged.values());
  }

  private mergeRelationships(
    mlRelationships: RelationshipExtraction[],
    traditionalRelationships: RelationshipExtraction[],
    entities: EntityExtraction[]
  ): RelationshipExtraction[] {
    const merged = new Map<string, RelationshipExtraction>();
    const entityIds = new Set(entities.map(e => e.id));
    
    // Helper to create relationship key
    const getRelKey = (rel: RelationshipExtraction) => `${rel.from}-${rel.type}-${rel.to}`;
    
    // Add ML relationships
    mlRelationships.forEach(rel => {
      if (entityIds.has(rel.from) && entityIds.has(rel.to)) {
        merged.set(getRelKey(rel), rel);
      }
    });
    
    // Add traditional relationships
    traditionalRelationships.forEach(rel => {
      if (entityIds.has(rel.from) && entityIds.has(rel.to)) {
        const key = getRelKey(rel);
        const existing = merged.get(key);
        const relConfidence = rel.properties?.confidence || 0.8;
        
        if (!existing || relConfidence > (existing.properties?.confidence || 0)) {
          merged.set(key, {
            ...rel,
            properties: {
              ...rel.properties,
              confidence: relConfidence,
              extractedBy: existing ? 'hybrid' : 'traditional'
            }
          });
        }
      }
    });
    
    return Array.from(merged.values());
  }

  private calculateAverageConfidence(
    entities: EntityExtraction[], 
    relationships: RelationshipExtraction[]
  ): number {
    const allConfidences = [
      ...entities.map(e => e.properties.confidence || 0.8),
      ...relationships.map(r => r.properties?.confidence || 0.8)
    ];
    
    return allConfidences.length > 0 
      ? allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length
      : 0;
  }

  // Batch processing with ML enhancement
  async ingestMultipleTextsEnhanced(
    texts: Array<{ content: string; source: string; domain?: string }>,
    options: EnhancedIngestionOptions = {}
  ): Promise<IngestionResult[]> {
    const { batchSize = 10 } = options;
    const results: IngestionResult[] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(({ content, source, domain }) =>
          this.ingestTextEnhanced(content, source, { ...options, domain })
        )
      );
      
      results.push(...batchResults);
    }
    
    return results;
  }

  // Learning from feedback
  async learnFromFeedback(
    text: string,
    correctEntities: EntityExtraction[],
    correctRelationships: RelationshipExtraction[]
  ): Promise<void> {
    if (!this.learningEnabled) return;
    
    // Update ML extractor with feedback
    this.mlExtractor.updateFromFeedback(text, correctEntities, correctRelationships);
    
    // Store feedback for future analysis
    // In a real implementation, this could be persisted to a database
  }

  // Performance analysis
  getPerformanceMetrics(): {
    totalIngestions: number;
    averageProcessingTime: number;
    averageConfidence: number;
    methodDistribution: Record<string, number>;
    recentTrends: {
      entitiesPerIngestion: number;
      relationshipsPerIngestion: number;
      confidenceTrend: number;
    };
  } {
    const history = this.ingestionHistory;
    
    if (history.length === 0) {
      return {
        totalIngestions: 0,
        averageProcessingTime: 0,
        averageConfidence: 0,
        methodDistribution: {},
        recentTrends: {
          entitiesPerIngestion: 0,
          relationshipsPerIngestion: 0,
          confidenceTrend: 0
        }
      };
    }
    
    const totalProcessingTime = history.reduce((sum, r) => sum + r.processingTime, 0);
    const totalConfidence = history.reduce((sum, r) => sum + r.confidence, 0);
    
    const methodDistribution = history.reduce((acc, r) => {
      acc[r.method] = (acc[r.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Recent trends (last 10 ingestions)
    const recent = history.slice(-10);
    const recentEntities = recent.reduce((sum, r) => sum + r.entitiesExtracted, 0);
    const recentRelationships = recent.reduce((sum, r) => sum + r.relationshipsExtracted, 0);
    const recentConfidence = recent.reduce((sum, r) => sum + r.confidence, 0);
    
    return {
      totalIngestions: history.length,
      averageProcessingTime: totalProcessingTime / history.length,
      averageConfidence: totalConfidence / history.length,
      methodDistribution,
      recentTrends: {
        entitiesPerIngestion: recent.length > 0 ? recentEntities / recent.length : 0,
        relationshipsPerIngestion: recent.length > 0 ? recentRelationships / recent.length : 0,
        confidenceTrend: recent.length > 0 ? recentConfidence / recent.length : 0
      }
    };
  }

  // Get ML extractor statistics
  getMLStats() {
    return this.mlExtractor.getExtractionStats();
  }

  // Enable/disable learning
  setLearningEnabled(enabled: boolean): void {
    this.learningEnabled = enabled;
  }

  // Clear ingestion history
  clearHistory(): void {
    this.ingestionHistory = [];
  }

  // Export configuration for model persistence
  exportConfiguration(): {
    learningEnabled: boolean;
    ingestionHistory: IngestionResult[];
    mlStats: ReturnType<MLEntityExtractor['getExtractionStats']>;
  } {
    return {
      learningEnabled: this.learningEnabled,
      ingestionHistory: this.ingestionHistory,
      mlStats: this.getMLStats()
    };
  }
}