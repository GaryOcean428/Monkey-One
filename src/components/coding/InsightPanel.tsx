import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Code, GitCommit, RefreshCw, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '../ui/button';

export function InsightPanel() {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleRefresh = () => {
    // Logic to refresh the insights
  };

  const handleFilter = () => {
    // Logic to filter insights by type
  };

  const handleSort = () => {
    // Logic to sort insights by name
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="flex justify-between mb-4">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Insights
        </Button>
        <Button variant="outline" size="sm" onClick={handleFilter}>
          <Filter className="w-4 h-4 mr-2" />
          Filter by Type
        </Button>
        <Button variant="outline" size="sm" onClick={handleSort}>
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
          Sort by Name
        </Button>
      </div>
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Code Insights</h3>
      
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Code className="text-blue-500" size={20} />
            <h4 className="font-medium dark:text-white">Code Quality</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Complexity</span>
              <span className="text-sm font-medium dark:text-white">Low</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-600 rounded-full">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: '30%' }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <GitCommit className="text-purple-500" size={20} />
            <h4 className="font-medium dark:text-white">Model Consensus</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm dark:text-gray-300">Qwen and Granite agree on solution</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            <h4 className="font-medium dark:text-white">Suggestions</h4>
          </div>
          <ul className="space-y-2 text-sm dark:text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              Consider adding error handling
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              Add input validation
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
