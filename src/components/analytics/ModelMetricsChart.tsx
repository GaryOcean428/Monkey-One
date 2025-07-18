import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { useMonitoring } from '../../hooks/useMonitoring';
import type { ModelMetrics } from '../../lib/types/models';
import type { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { Button } from '../ui/button';
import { Filter, RefreshCw, SortAsc, SortDesc } from 'lucide-react';

interface MetricsChartProps {
  modelName?: string;
  className?: string;
}

export const ModelMetricsChart: React.FC<MetricsChartProps> = ({ modelName, className }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { getMetrics } = useMonitoring();
  const [filterModel, setFilterModel] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const updateChart = () => {
    if (!chartRef.current) return;

    const metrics = getMetrics(modelName);
    const metricsData: [string, ModelMetrics][] = modelName 
      ? [[modelName, metrics as ModelMetrics]]
      : Array.from((metrics as Map<string, ModelMetrics>).entries());

    const filteredMetricsData = filterModel
      ? metricsData.filter(([name]) => name === filterModel)
      : metricsData;

    const sortedMetricsData = filteredMetricsData.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[1].totalRequests - b[1].totalRequests;
      } else {
        return b[1].totalRequests - a[1].totalRequests;
      }
    });

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const chartData: ChartData = {
      labels: modelName ? ['Metrics'] : sortedMetricsData.map(([name]) => name),
      datasets: [
        {
          label: 'Requests/min',
          data: sortedMetricsData.map(([, m]) => m.totalRequests),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
        {
          label: 'Error Rate (%)',
          data: sortedMetricsData.map(([, m]) => m.errorRate * 100),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Cache Hit Rate (%)',
          data: sortedMetricsData.map(([, m]) => m.cacheHitRate * 100),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    };

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${value.toFixed(2)}${label.includes('%') ? '%' : ''}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value + (this.chart.data.datasets[0].label?.includes('%') ? '%' : '');
            }
          }
        }
      }
    };

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options
    });
  };

  useEffect(() => {
    updateChart();
    const interval = setInterval(updateChart, 5000);

    return () => {
      clearInterval(interval);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [modelName, getMetrics, filterModel, sortOrder]);

  return (
    <div className={className}>
      <div className="flex justify-between mb-4">
        <Button variant="outline" size="sm" onClick={updateChart}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Metrics
        </Button>
        <Button variant="outline" size="sm" onClick={() => setFilterModel(filterModel ? null : modelName)}>
          <Filter className="w-4 h-4 mr-2" />
          {filterModel ? 'Clear Filter' : 'Filter by Model'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
          Sort by Value
        </Button>
      </div>
      <canvas ref={chartRef} />
    </div>
  );
};
