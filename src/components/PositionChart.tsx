import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(ArcElement, Tooltip, Legend);

interface PositionChartProps {
  gameResults: Array<{
    position: number;
    pointsChange: number;
    finalScore: number;
    date: string;
  }>;
}

const PositionChart: React.FC<PositionChartProps> = ({ gameResults }) => {
  // 计算各名次的次数
  const positionCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0
  };

  gameResults.forEach(result => {
    if (result.position >= 1 && result.position <= 4) {
      positionCounts[result.position as keyof typeof positionCounts]++;
    }
  });

  const totalGames = gameResults.length;

  // 计算平均分数
  const averageScores = {
    1: 0,
    2: 0,
    3: 0,
    4: 0
  };

  Object.keys(positionCounts).forEach(pos => {
    const position = parseInt(pos) as keyof typeof positionCounts;
    const gamesAtPosition = gameResults.filter(r => r.position === position);
    if (gamesAtPosition.length > 0) {
      const totalScore = gamesAtPosition.reduce((sum, game) => sum + game.finalScore, 0);
      averageScores[position] = Math.round(totalScore / gamesAtPosition.length);
    }
  });

  // 准备图表数据
  const data = {
    labels: ['一位', '二位', '三位', '四位'],
    datasets: [
      {
        data: [positionCounts[1], positionCounts[2], positionCounts[3], positionCounts[4]],
        backgroundColor: [
          '#fbbf24', // 金色 - 一位
          '#60a5fa', // 蓝色 - 二位
          '#34d399', // 绿色 - 三位
          '#f87171'  // 红色 - 四位
        ],
        borderColor: [
          '#f59e0b',
          '#3b82f6',
          '#10b981',
          '#ef4444'
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1.2,
    cutout: '50%', // 创建环形图效果
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14
          },
          boxWidth: 10,
          boxHeight: 10,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const count = data.datasets[0].data[i];
                const percentage = totalGames > 0 ? ((count / totalGames) * 100).toFixed(0) : '0';
                const avgScore = averageScores[(i + 1) as keyof typeof averageScores];
                return {
                  text: `${count}回${label} ${percentage}% 均点${avgScore.toLocaleString()}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: data.datasets[0].borderWidth,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
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
          label: (context: any) => {
            const position = context.dataIndex + 1;
            const count = context.parsed;
            const percentage = totalGames > 0 ? ((count / totalGames) * 100).toFixed(1) : '0';
            const avgScore = averageScores[position as keyof typeof averageScores];
            return [
              `${count}回 (${percentage}%)`,
              `平均分数: ${avgScore.toLocaleString()}`
            ];
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    }
  };

  if (totalGames === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          🏆 名次分布
        </h3>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p>暂无对局数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        🏆 名次分布
        <span className="text-sm font-normal text-gray-500 ml-2">({totalGames} 局)</span>
      </h3>
      <div className="h-[400px] sm:h-[450px] md:h-[400px] flex flex-col">
        <div className="flex-1 flex items-center justify-center px-2">
          <div className="w-full h-full max-w-none">
            <Doughnut data={data} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionChart;