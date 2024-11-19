import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, MessageSquare, ThumbsUp, ThumbsDown, Brain, Code, Zap, GitBranch } from 'lucide-react';
import { Button } from './ui/button';
import { useObserver } from '@/hooks/useObserver';
import { CodeInsight } from '@/types';

export function ObserverPanel() {
  const { insights, learningMetrics, analyzeCodebase, provideFeedback } = useObserver();
  const [selectedInsight, setSelectedInsight] = useState<CodeInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Periodically refresh insights
    const interval = setInterval(() => {
      analyzeCodebase();
    }, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [analyzeCodebase]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await analyzeCodebase();
    setIsAnalyzing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="text-purple-500" size={20} />
          <h2 className="text-lg font-semibold dark:text-white">Observer Agent</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="text-blue-500" size={16} />
            <h3 className="font-medium dark:text-white">Learning Progress</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Accuracy</span>
                <span className="text-gray-900 dark:text-white">
                  {(learningMetrics[0]?.accuracy * 100 || 0).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all"
                  style={{ width: `${learningMetrics[0]?.accuracy * 100 || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Pattern Recognition</span>
                <span className="text-gray-900 dark:text-white">
                  {(learningMetrics[0]?.patternScore * 100 || 0).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-green-500 rounded-full transition-all"
                  style={{ width: `${learningMetrics[0]?.patternScore * 100 || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-yellow-500" size={16} />
            <h3 className="font-medium dark:text-white">System Health</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Code Quality</span>
                <span className="text-gray-900 dark:text-white">85%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Performance</span>
                <span className="text-gray-900 dark:text-white">92%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-purple-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="text-gray-500" size={16} />
          <h3 className="font-medium dark:text-white">Latest Insights</h3>
        </div>

        <div className="space-y-3">
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                {insight.type === 'pattern' && <Code className="text-blue-500" size={16} />}
                {insight.type === 'performance' && <Zap className="text-yellow-500" size={16} />}
                {insight.type === 'solution' && <GitBranch className="text-green-500" size={16} />}
                <span className="font-medium dark:text-white capitalize">{insight.type} Insight</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  {(insight.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {insight.description}
              </p>

              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                  {insight.path}
                </code>
              </div>

              {insight.suggestion && (
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  Suggestion: {insight.suggestion}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => provideFeedback(insight.id, 'positive')}
                  className="text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <ThumbsUp size={16} className="mr-1" />
                  Helpful
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => provideFeedback(insight.id, 'negative')}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <ThumbsDown size={16} className="mr-1" />
                  Not Helpful
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}