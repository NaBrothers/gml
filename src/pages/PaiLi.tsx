import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Target, Calculator, BarChart3 } from 'lucide-react';
import HeaderBar from '@/components/HeaderBar';
import ScrollToTop from '@/components/ScrollToTop';

// 懒加载Tab组件
const YakuGuide = lazy(() => import('@/components/YakuGuideTab'));
const TingPaiAnalyzer = lazy(() => import('@/components/TingPaiAnalyzer'));
const EfficiencyCalculator = lazy(() => import('@/components/EfficiencyCalculator'));
const TileStats = lazy(() => import('@/components/TileStats'));

export type TabType = 'yaku' | 'tingpai' | 'efficiency' | 'stats';

interface TabConfig {
  id: TabType;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  component: React.ComponentType;
}

const tabConfigs: TabConfig[] = [
  {
    id: 'yaku',
    name: '役种速查',
    icon: BookOpen,
    description: '38种役种详解',
    component: YakuGuide
  },
  {
    id: 'tingpai',
    name: '听牌分析',
    icon: Target,
    description: '智能分析',
    component: TingPaiAnalyzer
  },
  {
    id: 'efficiency',
    name: '效率计算',
    icon: Calculator,
    description: '数值计算',
    component: EfficiencyCalculator
  },
  {
    id: 'stats',
    name: '牌效统计',
    icon: BarChart3,
    description: '概率统计',
    component: TileStats
  }
];

interface PaiLiProps {
  defaultTab?: TabType;
}

const PaiLi: React.FC<PaiLiProps> = ({ defaultTab = 'yaku' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  // 从URL参数同步Tab状态
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && tabConfigs.some(config => config.id === tabParam)) {
      setActiveTab(tabParam);
    } else if (!searchParams.get('tab')) {
      // 如果URL中没有tab参数，设置默认值
      setSearchParams({ tab: defaultTab }, { replace: true });
    }
  }, [searchParams, defaultTab, setSearchParams]);

  // 切换Tab并更新URL
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // 获取当前Tab的组件
  const getCurrentTabComponent = () => {
    const currentConfig = tabConfigs.find(config => config.id === activeTab);
    return currentConfig?.component || YakuGuide;
  };

  const CurrentTabComponent = getCurrentTabComponent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <HeaderBar title="麻将牌理" />
      
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Tab导航 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            {/* 桌面端Tab导航 */}
            <div className="hidden md:grid md:grid-cols-4 gap-4">
              {tabConfigs.map((config) => {
                const Icon = config.icon;
                const isActive = activeTab === config.id;
                
                return (
                  <button
                    key={config.id}
                    onClick={() => handleTabChange(config.id)}
                    className={`
                      group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                      ${isActive 
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 text-white shadow-lg' 
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`
                        p-3 rounded-full transition-colors
                        ${isActive 
                          ? 'bg-white/20' 
                          : 'bg-purple-100 group-hover:bg-purple-200'
                        }
                      `}>
                        <Icon className={`
                          w-8 h-8 transition-colors
                          ${isActive 
                            ? 'text-white' 
                            : 'text-purple-600 group-hover:text-purple-700'
                          }
                        `} />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-lg">{config.name}</h3>
                        <p className={`
                          text-sm mt-1
                          ${isActive 
                            ? 'text-white/80' 
                            : 'text-gray-500 group-hover:text-purple-600'
                          }
                        `}>
                          {config.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* 激活指示器 */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 移动端Tab导航 */}
            <div className="md:hidden">
              {/* Tab选择器 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {tabConfigs.map((config) => {
                  const Icon = config.icon;
                  const isActive = activeTab === config.id;
                  
                  return (
                    <button
                      key={config.id}
                      onClick={() => handleTabChange(config.id)}
                      className={`
                        p-4 rounded-xl border-2 transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 text-white shadow-md' 
                          : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`
                          w-5 h-5
                          ${isActive ? 'text-white' : 'text-purple-600'}
                        `} />
                        <div className="text-left">
                          <h3 className="font-medium text-sm">{config.name}</h3>
                          <p className={`
                            text-xs mt-0.5
                            ${isActive ? 'text-white/80' : 'text-gray-500'}
                          `}>
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab内容区域 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <Suspense fallback={
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">加载中...</p>
                </div>
              </div>
            }>
              <CurrentTabComponent />
            </Suspense>
          </div>

          <ScrollToTop />
        </div>
      </div>
    </div>
  );
};

export default PaiLi;