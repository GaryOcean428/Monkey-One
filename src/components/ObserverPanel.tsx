import React from 'react';
import { BasePanel } from './panels/BasePanel';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';
import { useObserver } from '../hooks/useObserver';

export function ObserverPanel() {
  const { insights, isLoading, error, markInsightHelpful } = useObserver();

  return (
    <BasePanel
      title="Observer"
      description="AI insights and observations"
      isLoading={isLoading}
      error={error}
    >
      <div className="space-y-4">
        {insights.length === 0 ? (
          <Card className="p-8 text-center">
            <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Insights Yet</h3>
            <p className="text-muted-foreground">
              The AI observer will generate insights as it analyzes agent behavior
            </p>
          </Card>
        ) : (
          insights.map((insight) => (
            <Card key={insight.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      insight.type === 'pattern' ? 'default' :
                      insight.type === 'performance' ? 'destructive' :
                      'secondary'
                    }>
                      {insight.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(insight.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markInsightHelpful(insight.id, true)}
                    disabled={insight.helpful === true}
                  >
                    <ThumbsUp className={`w-4 h-4 ${
                      insight.helpful === true ? 'text-green-500' : ''
                    }`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markInsightHelpful(insight.id, false)}
                    disabled={insight.helpful === false}
                  >
                    <ThumbsDown className={`w-4 h-4 ${
                      insight.helpful === false ? 'text-red-500' : ''
                    }`} />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 bg-gray-100 rounded-full dark:bg-gray-800">
                  <div
                    className="h-1 bg-blue-500 rounded-full"
                    style={{ width: `${insight.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {(insight.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </BasePanel>
  );
}