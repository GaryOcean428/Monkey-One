import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Split, Code2, GitBranch, Play, Save, Settings2 } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { InsightPanel } from './InsightPanel';
import { ModelSelector } from './ModelSelector';
import { PerformanceMetrics } from './PerformanceMetrics';
import { useCodeProcessor } from '@/hooks/useCodeProcessor';
import { Button } from '../ui/button';

export function CodingWorkspace() {
  const [code, setCode] = useState('');
  const [showInsights, setShowInsights] = useState(true);
  const { processCodingTask, isProcessing } = useCodeProcessor();

  const handleProcess = async () => {
    if (!code.trim()) return;
    const result = await processCodingTask(code);
    setCode(result.code);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ModelSelector />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <GitBranch className="w-4 h-4 mr-2" />
                main
              </Button>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
            >
              <Split className="w-4 h-4 mr-2" />
              {showInsights ? 'Hide' : 'Show'} Insights
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleProcess}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Code2 className="w-4 h-4 mr-2" />
                </motion.div>
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? 'Processing...' : 'Run'}
            </Button>
            <Button variant="ghost" size="sm">
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 ${showInsights ? 'w-2/3' : 'w-full'}`}>
          <CodeEditor
            value={code}
            onChange={setCode}
            language="typescript"
            theme="vs-dark"
          />
        </div>
        
        {showInsights && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-1/3 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800"
          >
            <div className="h-full flex flex-col">
              <InsightPanel />
              <PerformanceMetrics />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}