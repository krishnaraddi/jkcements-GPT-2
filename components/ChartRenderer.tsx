import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { ChartData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartRendererProps {
  chartData: ChartData;
}

// Pre-defined color palettes for charts, with JK Cement blue as the primary color
const backgroundColors = [
  'rgba(0, 93, 170, 0.7)',  // JK Blue
  'rgba(239, 68, 68, 0.7)',
  'rgba(245, 158, 11, 0.7)',
  'rgba(34, 197, 94, 0.7)',
  'rgba(168, 85, 247, 0.7)',
  'rgba(236, 72, 153, 0.7)',
  'rgba(22, 163, 74, 0.7)',
];

const borderColors = [
  'rgba(0, 93, 170, 1)', // JK Blue
  'rgba(239, 68, 68, 1)',
  'rgba(245, 158, 11, 1)',
  'rgba(34, 197, 94, 1)',
  'rgba(168, 85, 247, 1)',
  'rgba(236, 72, 153, 1)',
  'rgba(22, 163, 74, 1)',
];


export const ChartRenderer: React.FC<ChartRendererProps> = ({ chartData }) => {
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: '#cbd5e1' // slate-300
        }
      },
      title: {
        display: true,
        text: chartData.title,
        color: '#f1f5f9', // slate-100
        font: {
            size: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8', // slate-400
        },
        grid: {
          color: '#475569', // slate-600
        },
      },
      y: {
        ticks: {
          color: '#94a3b8', // slate-400
        },
        grid: {
          color: '#475569', // slate-600
        },
      },
    },
  };

  const pieOptions = { ...options, scales: undefined };

  const dataWithColors = {
    ...chartData.data,
    datasets: chartData.data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor ?? (chartData.type === 'pie' ? backgroundColors : backgroundColors[index % backgroundColors.length]),
      borderColor: dataset.borderColor ?? (chartData.type === 'pie' ? borderColors : borderColors[index % borderColors.length]),
      borderWidth: dataset.borderWidth ?? 1,
    })),
  };

  const getChartComponent = () => {
    switch (chartData.type) {
      case 'bar':
        return <Bar options={options} data={dataWithColors} />;
      case 'line':
        return <Line options={options} data={dataWithColors} />;
      case 'pie':
        return <Pie options={pieOptions} data={dataWithColors} />;
      default:
        return <p className="text-red-400">Unsupported chart type: {chartData.type}</p>;
    }
  };

  return (
    <div className="h-64 md:h-80 w-full">
        {getChartComponent()}
    </div>
  )
};