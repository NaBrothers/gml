import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScatterController
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { CurvePoint } from '../../shared/types';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScatterController
);

interface CurveChartProps {
  points: CurvePoint[];
  onPointUpdate: (updatedPoints: CurvePoint[]) => void;
  width?: number;
  height?: number;
  readonly?: boolean;
}

const CurveChart: React.FC<CurveChartProps> = ({
  points,
  onPointUpdate,
  width = 800,
  height = 400,
  readonly = false
}) => {
  const chartRef = useRef<ChartJS<'scatter'>>(null);
  const [editingPointIndex, setEditingPointIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editPosition, setEditPosition] = useState<{ x: number; y: number } | null>(null);

  // 准备图表数据
  const chartData = {
    datasets: [
      {
        label: '段位积分',
        data: points.map(point => ({ x: point.x, y: point.y })),
        backgroundColor: points.map((point, index) => 
          editingPointIndex === index ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)'
        ),
        borderColor: points.map((point, index) => 
          editingPointIndex === index ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
        ),
        borderWidth: 2,
        pointRadius: 4, // 默认点大小减小
        pointHoverRadius: 8, // 悬浮时变大
        showLine: true,
        tension: 0.3,
        fill: false
      }
    ]
  };

  // 图表配置
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'point' as const
    },
    plugins: {
      legend: {
        display: true,
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
            const pointIndex = context[0].dataIndex;
            const point = points[pointIndex];
            return point ? point.rankName : '';
          },
          label: (context: any) => {
            const pointIndex = context.dataIndex;
            const point = points[pointIndex];
            if (!point) return '';
            return [
              `段位序号: ${point.x}`,
              `积分: ${point.y.toLocaleString()}`,
              `段位: ${point.rankName}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: '段位序号',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          stepSize: 1
        }
      },
      y: {
        type: 'linear' as const,
        title: {
          display: true,
          text: '积分',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          callback: function(value: any) {
            return typeof value === 'number' ? value.toLocaleString() : value;
          }
        }
      }
    },
    onHover: (event: any, elements: any[]) => {
      if (readonly) return;
      
      const canvas = event.native?.target;
      if (canvas) {
        canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    },
    onClick: (event: any, elements: any[]) => {
      if (readonly || elements.length === 0) return;
      
      const pointIndex = elements[0].index;
      if (typeof pointIndex === 'number') {
        const chart = chartRef.current;
        if (!chart) return;
        
        const point = points[pointIndex];
        setEditingPointIndex(pointIndex);
        setEditValue(point.y.toString());
        
        // 计算编辑框位置 - 使用相对于图表容器的位置
        const canvasPosition = chart.getDatasetMeta(0).data[pointIndex];
        const pixelPosition = canvasPosition.getProps(['x', 'y'], true);
        
        setEditPosition({
          x: pixelPosition.x,
          y: pixelPosition.y - 100
        });
      }
    }
  };

  // 处理编辑值提交
  const handleEditSubmit = useCallback(() => {
    if (editingPointIndex === null) return;
    
    const newValue = parseInt(editValue);
    if (isNaN(newValue) || newValue < 0) {
      setEditValue(points[editingPointIndex].y.toString());
      return;
    }
    
    const updatedPoints = points.map((point, index) => {
      if (index === editingPointIndex) {
        return { ...point, y: newValue };
      }
      return point;
    });
    
    onPointUpdate(updatedPoints);
    setEditingPointIndex(null);
    setEditValue('');
    setEditPosition(null);
  }, [editingPointIndex, editValue, points, onPointUpdate]);

  // 处理编辑取消
  const handleEditCancel = useCallback(() => {
    setEditingPointIndex(null);
    setEditValue('');
    setEditPosition(null);
  }, []);

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (editingPointIndex !== null) {
        if (event.key === 'Enter') {
          handleEditSubmit();
        } else if (event.key === 'Escape') {
          handleEditCancel();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingPointIndex, handleEditSubmit, handleEditCancel]);

  // 处理点击外部区域取消编辑
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingPointIndex !== null && editPosition) {
        const target = event.target as HTMLElement;
        if (!target.closest('.edit-input-container')) {
          handleEditCancel();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingPointIndex, editPosition, handleEditCancel]);

  if (points.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p>暂无段位数据</p>
          <p className="text-sm mt-2">请先加载段位配置</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div style={{ width, height }}>
        <Scatter
          ref={chartRef}
          data={chartData}
          options={chartOptions}
        />
      </div>
      
      {/* 编辑输入框 */}
      {editingPointIndex !== null && editPosition && (
        <div 
          className="edit-input-container absolute z-10"
          style={{
            left: editPosition.x - 50,
            top: editPosition.y,
          }}
        >
          <div className="bg-white border-2 border-blue-500 rounded-lg shadow-lg p-2">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              autoFocus
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1"
            />
            <div className="flex justify-between mt-1">
              <button
                onClick={handleEditSubmit}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                确定
              </button>
              <button
                onClick={handleEditCancel}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          </div>
          {/* 箭头指示器 */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500"></div>
          </div>
        </div>
      )}
      
      {/* 操作提示 */}
      {!readonly && editingPointIndex === null && (
        <div className="absolute bottom-2 left-2 bg-gray-800 text-white px-3 py-1 rounded-md text-xs opacity-75">
          点击数据点直接编辑积分值
        </div>
      )}
    </div>
  );
};

export default CurveChart;