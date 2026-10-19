import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HaradaGrid } from './components/Grid/HaradaGrid.tsx';
import { TrackerView } from './components/Tracker/TrackerView.tsx';
import { WizardModal } from './components/Wizard/WizardModal.tsx';
import { TemplatesModal } from './components/Templates/TemplatesModal.tsx';
import { ExportModal } from './components/Export/ExportModal.tsx';
import { PWAInstallModal } from './components/PWA/PWAInstallModal.tsx';
import { OfflineBanner } from './components/PWA/OfflineBanner.tsx';
import { MobileNav } from './components/MobileNav.tsx';
import { HaradaState, Goal } from './types/harada.ts';
import { loadHaradaState, saveHaradaState, loadAllGoals } from './utils/storage.ts';

export default function App() {
  const [state, setState] = useState<HaradaState>(() => loadHaradaState());
  const [allGoals, setAllGoals] = useState<Goal[]>(() => loadAllGoals());
  const [activeTab, setActiveTab] = useState<'grid' | 'tracker' | 'review' | 'metrics'>('grid');

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  // Theme mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('harada_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('harada_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('harada_theme', 'light');
    }
  }, [isDark]);

  // Synchronize state changes to localStorage
  const handleUpdateState = (newState: HaradaState) => {
    setState(newState);
    saveHaradaState(newState);
    setAllGoals(loadAllGoals());
  };

  const handleSelectGoal = (goalId: string) => {
    const loaded = loadHaradaState(goalId);
    setState(loaded);
  };

  // Today routine count for badge
  const todayStr = new Date().toISOString().slice(0, 10);
  const routines = state.actions.filter((a) => a.isRoutine);
  const completedToday = routines.filter((a) => state.checks[`${a.id}_${todayStr}`]).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-20 md:pb-8">
      {/* Offline Status Alert */}
      <OfflineBanner />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
        allGoals={allGoals}
        currentGoalId={state.goal.id}
        onSelectGoal={handleSelectGoal}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-2 sm:py-4">
        {activeTab === 'grid' && (
          <HaradaGrid
            state={state}
            onUpdateState={handleUpdateState}
            onOpenWizard={() => setIsWizardOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
          />
        )}

        {activeTab === 'tracker' && (
          <TrackerView
            state={state}
            onUpdateState={handleUpdateState}
            activeSubTab="today"
          />
        )}

        {activeTab === 'metrics' && (
          <TrackerView
            state={state}
            onUpdateState={handleUpdateState}
            activeSubTab="metrics"
          />
        )}

        {activeTab === 'review' && (
          <TrackerView
            state={state}
            onUpdateState={handleUpdateState}
            activeSubTab="review"
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        todayCount={{ completed: completedToday, total: routines.length }}
      />

      {/* Modals */}
      <WizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        currentState={state}
        onSaveState={handleUpdateState}
        onOpenExport={() => setIsExportOpen(true)}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleUpdateState}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        state={state}
      />

      <PWAInstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
}
