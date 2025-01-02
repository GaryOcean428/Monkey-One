import React from 'react'
import { Line } from 'react-chartjs-2'

interface MetricsChartProps {
  data: {
    labels: string[]
    values: number[]
  }
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'System Metrics',
        data: data.values,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'System Performance'
      }
    }
  }

  return (
    <div className="w-full h-64">
      <Line data={chartData} options={options} />
    </div>
  )
}
