import React, { useState } from 'react';
import { BasePanel } from './panels/BasePanel';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';
import { useObserver } from '../hooks/useObserver';
import { cn } from '../lib/utils';
import styles from './ObserverPanel.module.css';

export function ObserverPanel() {
  const { insights, learningMetrics, isActive, analyzeCodebase, provideFeedback } = useObserver();
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      await analyzeCodebase();
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceClass = (confidence: number) => {
    const roundedConfidence = Math.round(confidence * 10) * 10;
    return styles[`confidence${roundedConfidence}`] || styles.confidence100;
  };

  return (
    <BasePanel title="Code Observer" icon={Lightbulb}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Analyze Codebase'}
          </Button>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => provideFeedback(insight.id, true)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => provideFeedback(insight.id, false)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-gray-100 rounded-full dark:bg-gray-800">
                    <div
                      className={cn(
                        styles.confidenceBar,
                        getConfidenceClass(insight.confidence)
                      )}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(insight.confidence * 100)}%
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No insights available. Click "Analyze Codebase" to begin.
          </div>
        )}
      </div>
    </BasePanel>
  );
}