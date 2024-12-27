import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { useMonitoring } from '../../hooks/useMonitoring';
import type { ModelMetrics } from '../../lib/types/models';
import type { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';

interface MetricsChartProps {
  modelName?: string;
  className?: string;
}

export const ModelMetricsChart: React.FC<MetricsChartProps> = ({ modelName, className }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { getMetrics } = useMonitoring();

  useEffect(() => {
    const updateChart = () => {
      if (!chartRef.current) return;

      const metrics = getMetrics(modelName);
      const metricsData: [string, ModelMetrics][] = modelName 
        ? [[modelName, metrics as ModelMetrics]]
        : Array.from((metrics as Map<string, ModelMetrics>).entries());

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      const chartData: ChartData = {
        labels: modelName ? ['Metrics'] : metricsData.map(([name]) => name),
        datasets: [
          {
            label: 'Requests/min',
            data: metricsData.map(([, m]) => m.totalRequests),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          },
          {
            label: 'Error Rate (%)',
            data: metricsData.map(([, m]) => m.errorRate * 100),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Cache Hit Rate (%)',
            data: metricsData.map(([, m]) => m.cacheHitRate * 100),
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

    updateChart();
    const interval = setInterval(updateChart, 5000);

    return () => {
      clearInterval(interval);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [modelName, getMetrics]);

  return (
    <div className={className}>
      <canvas ref={chartRef} />
    </div>
  );
};
