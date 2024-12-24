import fs from 'fs';
import path from 'path';
import { AdvancedRouter } from './router';
import { XAIMessage } from './types';

interface SampleQuery {
  content: string;
  expectedTier: 'low' | 'mid' | 'high' | 'superior';
}

interface CalibrationResults {
  strongModelPercentage: number;
  optimalThreshold: number;
  accuracy: number;
  modelDistribution: {
    low: number;
    mid: number;
    high: number;
    superior: number;
  };
}

export class RouterCalibrator {
  private router: AdvancedRouter;
  private sampleQueries: SampleQuery[];

  constructor(sampleQueriesPath: string) {
    this.router = new AdvancedRouter();
    this.sampleQueries = this.loadSampleQueries(sampleQueriesPath);
  }

  private loadSampleQueries(filePath: string): SampleQuery[] {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Error loading sample queries:', error);
      return [];
    }
  }

  public calibrateThreshold(targetStrongPct: number = 0.5): CalibrationResults {
    let currentThreshold = 0.5;
    let bestThreshold = currentThreshold;
    let bestAccuracy = 0;
    let bestDistribution = { low: 0, mid: 0, high: 0, superior: 0 };

    // Binary search for optimal threshold
    let left = 0.1;
    let right = 0.9;
    
    while (left <= right) {
      currentThreshold = (left + right) / 2;
      this.router = new AdvancedRouter(currentThreshold);
      
      const results = this.evaluateThreshold();
      const strongPct = (results.distribution.high + results.distribution.superior) / this.sampleQueries.length;
      
      if (Math.abs(strongPct - targetStrongPct) < 0.05) {
        if (results.accuracy > bestAccuracy) {
          bestThreshold = currentThreshold;
          bestAccuracy = results.accuracy;
          bestDistribution = results.distribution;
        }
        break;
      } else if (strongPct < targetStrongPct) {
        right = currentThreshold - 0.05;
      } else {
        left = currentThreshold + 0.05;
      }
    }

    return {
      strongModelPercentage: targetStrongPct,
      optimalThreshold: bestThreshold,
      accuracy: bestAccuracy,
      modelDistribution: bestDistribution
    };
  }

  private evaluateThreshold(): { accuracy: number; distribution: Record<string, number> } {
    let correct = 0;
    const distribution = { low: 0, mid: 0, high: 0, superior: 0 };

    for (const query of this.sampleQueries) {
      const result = this.router.route(query.content, []);
      const modelTier = this.getModelTier(result.model.id);
      
      distribution[modelTier]++;
      
      if (modelTier === query.expectedTier) {
        correct++;
      }
    }

    return {
      accuracy: correct / this.sampleQueries.length,
      distribution
    };
  }

  private getModelTier(modelId: string): 'low' | 'mid' | 'high' | 'superior' {
    if (modelId.includes('groq-8b') || modelId.includes('3.2-1b')) return 'low';
    if (modelId.includes('3.2-3b')) return 'mid';
    if (modelId.includes('3.3-70b')) return 'high';
    return 'superior';
  }

  public async saveResults(results: CalibrationResults, outputPath: string): Promise<void> {
    try {
      await fs.promises.writeFile(
        outputPath,
        JSON.stringify(results, null, 2),
        'utf-8'
      );
      console.log(`Calibration results saved to ${outputPath}`);
    } catch (error) {
      console.error('Error saving calibration results:', error);
    }
  }
}

// Example usage
if (require.main === module) {
  const calibrator = new RouterCalibrator(path.join(__dirname, '../data/sample_queries.json'));
  const results = calibrator.calibrateThreshold(0.5);
  calibrator.saveResults(results, path.join(__dirname, '../data/calibration_results.json'))
    .then(() => console.log('Calibration complete'))
    .catch(console.error);
}
