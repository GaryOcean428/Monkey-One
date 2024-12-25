import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { useMonitoring } from '../../hooks/useMonitoring';

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
      const data = modelName ? [metrics] : Array.from((metrics as Map<string, any>).entries());

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: modelName ? ['Metrics'] : data.map(([name]) => name),
          datasets: [
            {
              label: 'Requests/min',
              data: modelName ? [metrics.totalRequests] : data.map(([, m]) => m.totalRequests),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
            {
              label: 'Error Rate (%)',
              data: modelName ? [metrics.errorRate * 100] : data.map(([, m]) => m.errorRate * 100),
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
              label: 'Cache Hit Rate (%)',
              data: modelName ? [metrics.cacheHitRate * 100] : data.map(([, m]) => m.cacheHitRate * 100),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Model Performance Metrics',
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${value.toFixed(2)}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    };

    updateChart();
    const interval = setInterval(updateChart, 5000); // Update every 5 seconds

    return () => {
      clearInterval(interval);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [modelName]);

  return <canvas ref={chartRef} className={className} />;
};
