# Merge Improvements Documentation

## Overview

This document describes the improvements made to the merge functionality across the Monkey-One codebase. These improvements enhance how the system combines solutions, entities, relationships, and code improvements from multiple sources.

## Improvements Made

### 1. CodeProcessor - Enhanced Solution Merging

**File**: `src/lib/llm/CodeProcessor.ts`

#### What Changed

The `combineAndImproveSolutions` method now:

1. **Considers Multiple Top Solutions**: Instead of only using the single best solution, the system now examines the top 3 solutions (with score >= 0.5) to extract valuable insights from multiple sources.

2. **Intelligent Suggestion Deduplication**: New `deduplicateSuggestions` method removes duplicate or very similar suggestions using Jaccard similarity (80% threshold).

3. **String Similarity Calculation**: New `calculateStringSimilarity` method uses word-based Jaccard similarity to identify duplicate suggestions.

4. **Enhanced Metadata Tracking**: Solutions now track:
   - `mergedFrom`: Array of model names that contributed to the final solution
   - `suggestionsApplied`: Count of unique suggestions incorporated

#### Benefits

- **Better Quality**: Incorporates insights from multiple high-performing solutions
- **No Duplication**: Eliminates redundant suggestions that would confuse the improvement process
- **Transparency**: Clear tracking of which models and suggestions contributed to final solution
- **Efficiency**: Reduces token usage by removing duplicate suggestions

#### Example Usage

```typescript
const processor = new CodeProcessor();
const solution = await processor.processCodingTask(
  "Implement a binary search algorithm",
  context
);

console.log(solution.metadata.mergedFrom); // ['qwen', 'groq']
console.log(solution.metadata.suggestionsApplied); // 5
```

### 2. EnhancedIngestor - Advanced Entity and Relationship Merging

**File**: `src/lib/memory-graph/enhanced-ingestor.ts`

#### What Changed

Both `mergeEntities` and `mergeRelationships` methods now include:

1. **Conflict Detection**: Tracks all conflicts between ML and traditional extraction methods
2. **Intelligent Conflict Resolution**: 
   - Similar confidence (< 0.1 diff): Merges properties and averages confidence
   - High confidence difference: Uses higher confidence source
   - Very close confidence (< 0.15 for relationships): Marks as "verified" when both agree

3. **Property Merging**: New `mergeProperties` method intelligently combines non-conflicting properties from both sources

4. **Source Tracking**: All entities and relationships now track:
   - `extractedBy`: 'ml', 'traditional', or 'hybrid'
   - `sources`: Array of extraction methods used
   - `verified`: Boolean flag when multiple methods agree

5. **Conflict Logging**: New `logMergeConflicts` method stores conflict information for analysis and learning

#### Benefits

- **Higher Accuracy**: Leverages strengths of both ML and traditional methods
- **Better Confidence**: Verified entities (confirmed by multiple methods) get confidence boost
- **Richer Metadata**: Comprehensive tracking of extraction sources and methods
- **Learning Capability**: Conflict logs can be used to improve extraction methods over time

#### Example Usage

```typescript
const ingestor = new EnhancedIngestorAgent(graph);
const result = await ingestor.ingestTextEnhanced(text, source, {
  useML: true,
  confidence: 0.7
});

console.log(result.method); // 'hybrid'
console.log(result.confidence); // 0.85
```

### 3. SelfImprovementManager - Merge Quality Assessment

**File**: `src/lib/improvement/SelfImprovementManager.ts`

#### What Changed

Added three new methods:

1. **`assessMergeQuality`**: Comprehensive quality assessment before merging
   - Checks for merge conflicts
   - Evaluates risk, complexity, and impact metrics
   - Generates actionable recommendations
   - Returns quality score (0-1) and merge readiness

2. **`mergeImprovement`**: Safe merging with quality gates
   - Requires minimum quality score (0.6) unless forced
   - Supports squash merging
   - Includes quality score in merge commit message
   - Updates suggestion status automatically

3. **Performance Impact Estimation**: Integrates with ModelPerformanceTracker to estimate performance impact

#### Quality Score Components

- **No Conflicts** (30%): Clean merge without conflicts
- **Low Risk** (25%): Based on risk level metric
- **High Impact** (25%): Based on estimated improvement impact
- **Low Complexity** (20%): Based on change complexity

#### Benefits

- **Risk Mitigation**: Prevents low-quality improvements from being merged
- **Transparency**: Clear quality metrics and recommendations
- **Automation**: Automated quality checks reduce manual review burden
- **Traceability**: Quality scores recorded in merge commits

#### Example Usage

```typescript
const manager = SelfImprovementManager.getInstance();
await manager.initialize();

// Assess before merging
const assessment = await manager.assessMergeQuality(suggestionId);
console.log(assessment);
// {
//   canMerge: true,
//   quality: 0.78,
//   conflicts: [],
//   recommendations: ['High estimated impact - proceed with merge']
// }

// Merge if quality is sufficient
if (assessment.canMerge) {
  await manager.mergeImprovement(suggestionId, { squash: true });
}
```

### 4. GitClient - Conflict Detection and Safe Merging

**File**: `src/lib/clients/GitClient.ts`

#### What Changed

Added two new methods:

1. **`checkMergeConflicts`**: Detects merge conflicts before attempting merge
   - Performs dry-run merge
   - Returns list of conflicting files
   - Aborts cleanly after check

2. **`mergeBranch`**: Safe branch merging with options
   - Supports squash merging
   - Custom commit messages
   - Automatic push to remote
   - Proper error handling

#### Benefits

- **Safety**: Detect conflicts before attempting merge
- **Flexibility**: Support for different merge strategies
- **Automation**: Handles entire merge workflow
- **Reliability**: Proper cleanup on errors

### 5. ModelPerformanceTracker - Performance Impact Estimation

**File**: `src/lib/llm/ModelPerformanceTracker.ts`

#### What Changed

Added `estimateImpact` method that:

1. Analyzes affected files to estimate performance impact
2. Uses file type and naming heuristics
3. Returns normalized score (-1 to 1)
4. Integrates with merge quality assessment

#### Impact Scoring

- **Performance/Optimization files**: +0.3 (likely positive)
- **Cache/Memory files**: +0.2 (potentially positive)
- **Test files**: +0.05 (minimal impact)
- **Config files**: +0.1 (may help)
- **Other files**: 0 (neutral/unknown)

## Best Practices

### When Combining Solutions

1. Always use the enhanced `combineAndImproveSolutions` method
2. Include context from multiple models for better results
3. Check `metadata.mergedFrom` to understand solution origins
4. Monitor `suggestionsApplied` count for quality insights

### When Merging Entities/Relationships

1. Use `useML: true` for hybrid approach
2. Set appropriate confidence thresholds (0.7 recommended)
3. Review conflict logs periodically for method improvements
4. Pay attention to `verified` flag for high-confidence entities

### When Merging Code Improvements

1. Always run `assessMergeQuality` before merging
2. Set minimum quality threshold appropriate for your project
3. Review recommendations carefully
4. Use squash merging for cleaner history
5. Never force merge without understanding the risks

## Configuration

### CodeProcessor

```typescript
// Default models used for solution generation
private models: string[] = ['qwen', 'groq'];

// Minimum score to consider a solution
const MIN_SOLUTION_SCORE = 0.5;

// Maximum number of top solutions to consider
const MAX_TOP_SOLUTIONS = 3;

// Similarity threshold for deduplication
const SIMILARITY_THRESHOLD = 0.8;
```

### EnhancedIngestor

```typescript
// Default confidence threshold
const DEFAULT_CONFIDENCE = 0.7;

// Confidence difference threshold for property merging
const MERGE_THRESHOLD = 0.1;

// Confidence difference threshold for verification
const VERIFY_THRESHOLD = 0.15;
```

### SelfImprovementManager

```typescript
// Minimum quality score for automatic merge
const MIN_MERGE_QUALITY = 0.6;

// Quality score weights
const QUALITY_WEIGHTS = {
  hasNoConflicts: 0.3,
  lowRisk: 0.25,
  highImpact: 0.25,
  lowComplexity: 0.2
};
```

## Monitoring and Metrics

### Key Metrics to Track

1. **Solution Merge Success Rate**: Percentage of solutions that successfully incorporate multiple sources
2. **Entity Conflict Rate**: Percentage of entities that had conflicts during merging
3. **Relationship Verification Rate**: Percentage of relationships verified by multiple methods
4. **Merge Quality Scores**: Distribution of quality scores for code improvements
5. **Performance Impact**: Actual vs. estimated performance impact

### Logging

All merge operations include detailed logging:

```typescript
// CodeProcessor
logger.debug('Merged solution from models:', mergedFrom);

// EnhancedIngestor
logger.debug('Merge conflicts detected:', conflictInfo);

// SelfImprovementManager
logger.info('Merge quality score:', quality);
```

## Future Enhancements

1. **Machine Learning for Merge Decisions**: Use historical merge outcomes to train better merge strategies
2. **Adaptive Confidence Thresholds**: Automatically adjust thresholds based on accuracy metrics
3. **Conflict Resolution Strategies**: Implement multiple strategies for different conflict types
4. **Merge Pattern Recognition**: Identify patterns in successful merges
5. **Automated Performance Testing**: Run actual performance tests after merges

## Troubleshooting

### Low Quality Scores

If merge quality scores are consistently low:

1. Check if risk levels are appropriately calibrated
2. Verify complexity calculations match actual complexity
3. Review impact estimations against actual outcomes
4. Consider adjusting quality weight distribution

### High Conflict Rates

If entity/relationship conflict rates are high:

1. Review confidence threshold settings
2. Check if ML model needs retraining
3. Verify traditional extraction patterns
4. Analyze conflict logs for systematic issues

### Failed Merges

If merges fail despite passing quality checks:

1. Review git conflict resolution logic
2. Check for race conditions in multi-branch scenarios
3. Verify network connectivity for remote operations
4. Examine git client error logs

## Conclusion

These merge improvements provide a robust foundation for combining insights from multiple sources while maintaining quality and traceability. The system now intelligently handles conflicts, deduplicates suggestions, tracks sources, and ensures only high-quality improvements are merged.
