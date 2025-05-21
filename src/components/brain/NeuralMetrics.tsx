import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Filter, RefreshCw, SortAsc, SortDesc } from 'lucide-react';

interface NeuralMetricsProps {
  metrics: Array<{
    region: string;
    value: number;
  }>;
}

export function NeuralMetrics({ metrics }: NeuralMetricsProps) {
  const [filterRegion, setFilterRegion] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredMetrics = filterRegion
    ? metrics.filter(metric => metric.region === filterRegion)
    : metrics;

  const sortedMetrics = filteredMetrics.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.value - b.value;
    } else {
      return b.value - a.value;
    }
  });

  return (
    <Card className="p-4">
      <div className="flex justify-between mb-4">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Metrics
        </Button>
        <Button variant="outline" size="sm" onClick={() => setFilterRegion(filterRegion ? null : 'region')}>
          <Filter className="w-4 h-4 mr-2" />
          {filterRegion ? 'Clear Filter' : 'Filter by Region'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
          Sort by Value
        </Button>
      </div>
      <div className="space-y-2">
        {sortedMetrics.map((metric, index) => (
          <div key={index} className="flex justify-between">
            <span>{metric.region}</span>
            <span>{metric.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
