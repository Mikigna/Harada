import React from 'react';
import { Grid3X3, CheckSquare, TrendingUp, Sparkles } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'grid' | 'tracker' | 'review' | 'metrics';
  setActiveTab: (tab: 'grid' | 'tracker' | 'review' | 'metrics') => void;
  todayCount: { completed: number; total: number };
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  todayCount,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 safe-bottom">
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
            activeTab === 'grid'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Grid3X3 className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Матрица</span>
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
            activeTab === 'tracker'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Трекер</span>
          {todayCount.total > 0 && todayCount.completed < todayCount.total && (
            <span className="absolute top-1 right-5 w-2 h-2 rounded-full bg-indigo-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
            activeTab === 'metrics'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Результат</span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
            activeTab === 'review'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">PDCA Обзор</span>
        </button>
      </div>
    </div>
  );
};
