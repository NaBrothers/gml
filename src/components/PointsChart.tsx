import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PointsChartProps {
  chartData: {
    pointsHistory: Array<{
      date: string;
      pointsBefore: number;
      pointsAfter: number;
      pointsChange: number;
      rankBefore: string;
      rankAfter: string;
    }>;
    gameResults: Array<{
      date: string;
      position: number;
      pointsChange: number;
      finalScore: number;
    }>;
  };
}

const PointsChart: React.FC<PointsChartProps> = ({ chartData }) => {
  // 准备积分变化图表数据
  const pointsData = {
    labels: chartData.pointsHistory.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: '积分',
        data: chartData.pointsHistory.map(item => item.pointsAfter),
        borderColor: 'rgb(236, 72, 153)', // pink-500
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(236, 72, 153)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  // 准备对局结果图表数据
  const gameResultsData = {
    labels: chartData.gameResults.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: '积分变化',
        data: chartData.gameResults.map(item => item.pointsChange),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            const date = new Date(chartData.pointsHistory[index]?.date || chartData.gameResults[index]?.date);
            return date.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280'
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    elements: {
      line: {
        borderJoinStyle: 'round' as const
      }
    }
  };

  const gameResultsOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          ...chartOptions.plugins.tooltip.callbacks,
          label: (context: any) => {
            const value = context.parsed.y;
            const index = context.dataIndex;
            const gameResult = chartData.gameResults[index];
            return [
              `积分变化: ${value >= 0 ? '+' : ''}${value}`,
              `排名: ${gameResult.position}位`,
              `最终分数: ${gameResult.finalScore.toLocaleString()}`
            ];
          }
        }
      }
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        beginAtZero: true
      }
    }
  };

  if (chartData.pointsHistory.length === 0 && chartData.gameResults.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p>暂无数据可展示</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 积分变化图表 */}
      {chartData.pointsHistory.length > 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            📈 积分变化趋势
          </h3>
          <div className="h-80">
            <Line data={pointsData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* 对局结果图表 */}
      {chartData.gameResults.length > 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🎯 对局积分变化
          </h3>
          <div className="h-80">
            <Line data={gameResultsData} options={gameResultsOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsChart;