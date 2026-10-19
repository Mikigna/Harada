import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
  Edit3,
  Calendar,
  Layers,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { HaradaState, Pillar, ActionItem } from '../../types/harada.ts';
import { PillarZoomModal } from './PillarZoomModal.tsx';

interface HaradaGridProps {
  state: HaradaState;
  onUpdateState: (newState: HaradaState) => void;
  onOpenWizard: () => void;
  onOpenExport: () => void;
}

// Surrounding offsets around center cell in a 3x3 block:
const SURROUNDING_OFFSETS: [number, number][] = [
  [0, 0], // 1: top-left
  [1, 0], // 2: top
  [2, 0], // 3: top-right
  [2, 1], // 4: right
  [2, 2], // 5: bottom-right
  [1, 2], // 6: bottom
  [0, 2], // 7: bottom-left
  [0, 1], // 8: left
];

// Block positions for the 8 outer blocks around center block (1,1) in a 3x3 supergrid:
const BLOCK_OFFSETS: [number, number][] = [
  [0, 0], // Pillar 1: top-left
  [1, 0], // Pillar 2: top
  [2, 0], // Pillar 3: top-right
  [2, 1], // Pillar 4: right
  [2, 2], // Pillar 5: bottom-right
  [1, 2], // Pillar 6: bottom
  [0, 2], // Pillar 7: bottom-left
  [0, 1], // Pillar 8: left
];

export const HaradaGrid: React.FC<HaradaGridProps> = ({
  state,
  onUpdateState,
  onOpenWizard,
  onOpenExport,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'blocks' | 'full'>('blocks');
  const [activeZoomPillar, setActiveZoomPillar] = useState<Pillar | null>(null);

  const routineCount = state.actions.filter((a) => a.isRoutine).length;

  const handleUpdatePillarTitle = (pillarId: string, newTitle: string) => {
    const newPillars = state.pillars.map((p) =>
      p.id === pillarId ? { ...p, title: newTitle } : p
    );
    onUpdateState({ ...state, pillars: newPillars });
  };

  const handleUpdateAction = (
    actionId: string,
    text: string,
    isRoutine: boolean,
    frequency: ActionItem['frequency']
  ) => {
    const newActions = state.actions.map((act) =>
      act.id === actionId ? { ...act, text, isRoutine, frequency } : act
    );
    onUpdateState({ ...state, actions: newActions });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* Goal Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-[11px]">
                Метод Харада 8×8
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Срок: {state.goal.targetDate || 'Дедлайн не установлен'}
              </span>
              <span>·</span>
              <span>Рутины: {routineCount}/64</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {state.goal.title || 'Главная цель не сформулирована'}
            </h1>

            {state.goal.targetMetric && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Ключевой показатель:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {state.goal.targetMetric}
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setViewMode('blocks')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  viewMode === 'blocks'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Опоры 3×3
              </button>
              <button
                onClick={() => setViewMode('full')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  viewMode === 'full'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Матрица 8×8
              </button>
            </div>

            <button
              onClick={onOpenWizard}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Изменить цель</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Mobile-friendly 3x3 Supergrid of Blocks */}
      {viewMode === 'blocks' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Нажмите на любую из 8 опор, чтобы приблизить её 8 действий и настроить рутины
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Center Core Goal Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700/80 shadow-sm flex flex-col justify-between order-first sm:order-none lg:col-start-2 lg:row-start-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                    Ядро квадрата
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-100">
                  {state.goal.title || 'Главная цель'}
                </h3>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-300">
                <span>Срок: {state.goal.targetDate || '—'}</span>
                <button
                  onClick={onOpenWizard}
                  className="hover:underline flex items-center gap-1"
                >
                  Править цель →
                </button>
              </div>
            </div>

            {/* 8 Outer Pillar Cards */}
            {state.pillars.map((pillar, pIdx) => {
              const pillarActions = state.actions.filter((a) => a.pillarId === pillar.id);
              const pillarRoutines = pillarActions.filter((a) => a.isRoutine);
              const filledActions = pillarActions.filter((a) => a.text.trim().length > 0).length;

              return (
                <div
                  key={pillar.id}
                  onClick={() => setActiveZoomPillar(pillar)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        ОПОРА {pIdx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {filledActions}/8 действий
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {pillar.title}
                    </h4>

                    {/* Preview of first 3 actions */}
                    <div className="space-y-1.5 pt-1">
                      {pillarActions.slice(0, 3).map((act, idx) => (
                        <div
                          key={act.id}
                          className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 truncate"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span className="truncate">{act.text || '—'}</span>
                          {act.isRoutine && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                              ★
                            </span>
                          )}
                        </div>
                      ))}
                      {pillarActions.length > 3 && (
                        <p className="text-[11px] text-slate-400 italic">
                          + ещё {pillarActions.length - 3} действий
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                    <span className="text-indigo-600 dark:text-indigo-400">
                      Рутин: {pillarRoutines.length}
                    </span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 flex items-center gap-1 transition-colors">
                      Открыть блок 3×3 <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: Full 8x8 (9x9 mandala) Grid with Zoom Controls */
        <div className="space-y-4">
          {/* Zoom Toolbar */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Полноразмерная матрица Харада 9×9 (8 опор × 8 действий). Нажмите на клетку для правки.
            </span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.15))}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition text-slate-700 dark:text-slate-300"
                title="Уменьшить"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300 font-mono">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(1.6, zoomLevel + 0.15))}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition text-slate-700 dark:text-slate-300"
                title="Увеличить"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition text-slate-700 dark:text-slate-300"
                title="Сброс масштаба"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full Grid Container with horizontal and vertical overflow */}
          <div className="overflow-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-100 dark:bg-slate-950 p-4 max-h-[75vh]">
            <div
              className="grid grid-cols-3 gap-3 transition-transform origin-top-left"
              style={{
                width: `${1200 * zoomLevel}px`,
                transform: `scale(${zoomLevel})`,
              }}
            >
              {/* 3x3 Superblocks */}
              {[
                { sRow: 0, sCol: 0 },
                { sRow: 0, sCol: 1 },
                { sRow: 0, sCol: 2 },
                { sRow: 1, sCol: 0 },
                { isCenter: true },
                { sRow: 1, sCol: 2 },
                { sRow: 2, sCol: 0 },
                { sRow: 2, sCol: 1 },
                { sRow: 2, sCol: 2 },
              ].map((superBlock, sbIdx) => {
                if ('isCenter' in superBlock && superBlock.isCenter) {
                  // Center Superblock: Center is Goal, 8 surrounding are Pillars
                  return (
                    <div
                      key="center_superblock"
                      className="grid grid-cols-3 gap-1 p-1.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 shadow-md"
                    >
                      {[0, 1, 2].flatMap((r) =>
                        [0, 1, 2].map((c) => {
                          if (r === 1 && c === 1) {
                            // Center Goal Cell
                            return (
                              <div
                                key="goal_center_cell"
                                onClick={onOpenWizard}
                                className="aspect-square p-2 bg-gradient-to-tr from-amber-400 to-amber-500 text-amber-950 rounded-lg flex flex-col justify-center items-center text-center font-bold shadow-inner cursor-pointer hover:opacity-95 transition"
                              >
                                <span className="text-[10px] uppercase font-bold tracking-tight">
                                  Главная цель
                                </span>
                                <span className="text-xs line-clamp-3 leading-tight mt-1">
                                  {state.goal.title || 'Главная цель'}
                                </span>
                              </div>
                            );
                          }

                          // One of 8 Pillars in center block
                          const pIndex = SURROUNDING_OFFSETS.findIndex(
                            ([oc, or]) => oc === c && or === r
                          );
                          const pillar = state.pillars[pIndex];

                          return (
                            <div
                              key={`center_p_${pIndex}`}
                              onClick={() => pillar && setActiveZoomPillar(pillar)}
                              className="aspect-square p-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg flex flex-col justify-center items-center text-center shadow-xs cursor-pointer hover:border-indigo-500 transition"
                            >
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                Опора {pIndex + 1}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mt-0.5">
                                {pillar?.title || `Опора ${pIndex + 1}`}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                }

                // Outer Superblock
                const pIndex = BLOCK_OFFSETS.findIndex(
                  ([oc, or]) => oc === superBlock.sCol && or === superBlock.sRow
                );
                const pillar = state.pillars[pIndex];
                const pillarActions = state.actions.filter((a) => a.pillarId === pillar?.id);

                return (
                  <div
                    key={`outer_superblock_${sbIdx}`}
                    className="grid grid-cols-3 gap-1 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm"
                  >
                    {[0, 1, 2].flatMap((r) =>
                      [0, 1, 2].map((c) => {
                        if (r === 1 && c === 1) {
                          // Center of outer superblock is Pillar Title
                          return (
                            <div
                              key={`p_header_${pIndex}`}
                              onClick={() => pillar && setActiveZoomPillar(pillar)}
                              className="aspect-square p-2 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded-lg flex flex-col justify-center items-center text-center cursor-pointer hover:bg-indigo-100 transition"
                            >
                              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                ОПОРА {pIndex + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mt-0.5">
                                {pillar?.title || `Опора ${pIndex + 1}`}
                              </span>
                            </div>
                          );
                        }

                        // One of 8 Actions
                        const aIndex = SURROUNDING_OFFSETS.findIndex(
                          ([oc, or]) => oc === c && or === r
                        );
                        const action = pillarActions[aIndex];

                        return (
                          <div
                            key={`action_cell_${pIndex}_${aIndex}`}
                            onClick={() => pillar && setActiveZoomPillar(pillar)}
                            className={`aspect-square p-1.5 rounded-lg border text-left flex flex-col justify-between cursor-pointer hover:border-indigo-400 transition ${
                              action?.isRoutine
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-slate-400">
                                {pIndex + 1}.{aIndex + 1}
                              </span>
                              {action?.isRoutine && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  ★
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 line-clamp-3 leading-tight">
                              {action?.text || '—'}
                            </span>
                            <div />
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pillar Zoom Modal */}
      {activeZoomPillar && (
        <PillarZoomModal
          pillar={activeZoomPillar}
          actions={state.actions.filter((a) => a.pillarId === activeZoomPillar.id)}
          isOpen={Boolean(activeZoomPillar)}
          onClose={() => setActiveZoomPillar(null)}
          onUpdatePillarTitle={(title) => handleUpdatePillarTitle(activeZoomPillar.id, title)}
          onUpdateAction={handleUpdateAction}
        />
      )}
    </div>
  );
};
