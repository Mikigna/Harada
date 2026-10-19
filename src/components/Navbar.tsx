import React from 'react';
import { Target, Sparkles, Download, BookOpen, CheckSquare, PlusCircle, Moon, Sun, Smartphone } from 'lucide-react';
import { Goal } from '../types/harada.ts';

interface NavbarProps {
  activeTab: 'grid' | 'tracker' | 'review' | 'metrics';
  setActiveTab: (tab: 'grid' | 'tracker' | 'review' | 'metrics') => void;
  onOpenWizard: () => void;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
  onOpenInstall: () => void;
  allGoals: Goal[];
  currentGoalId: string;
  onSelectGoal: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenWizard,
  onOpenTemplates,
  onOpenExport,
  onOpenInstall,
  allGoals,
  currentGoalId,
  onSelectGoal,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Квадрат Харада
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:inline">
              Матрица 8×8 и трекер
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'grid'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Матрица 8×8
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'tracker'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Трекер рутин
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Результаты
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'review'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Обзор PDCA
          </button>
        </nav>

        {/* Zone 3: Actions (Goals Switcher, Master CTA, Export, Install) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Multiple goals selector */}
          {allGoals.length > 1 && (
            <select
              value={currentGoalId}
              onChange={(e) => onSelectGoal(e.target.value)}
              aria-label="Выбрать цель"
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[120px] sm:max-w-[150px] truncate"
            >
              {allGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title || 'Безымянная цель'}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onOpenTemplates}
            title="Примеры квадратов"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Примеры</span>
          </button>

          <button
            onClick={onOpenExport}
            title="Скачать или поделиться квадратом"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Экспорт</span>
          </button>

          <button
            onClick={onOpenInstall}
            title="Установить PWA"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">Установить PWA</span>
          </button>

          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Мастер 7 шагов</span>
          </button>

          <button
            onClick={onToggleTheme}
            aria-label="Переключить тему"
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
