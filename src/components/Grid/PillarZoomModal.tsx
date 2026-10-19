import React from 'react';
import { X, CheckSquare, Square, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Pillar, ActionItem } from '../../types/harada.ts';
import { validateAction } from '../../utils/logic.ts';

interface PillarZoomModalProps {
  pillar: Pillar;
  actions: ActionItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdatePillarTitle: (newTitle: string) => void;
  onUpdateAction: (actionId: string, text: string, isRoutine: boolean, frequency: ActionItem['frequency']) => void;
}

export const PillarZoomModal: React.FC<PillarZoomModalProps> = ({
  pillar,
  actions,
  isOpen,
  onClose,
  onUpdatePillarTitle,
  onUpdateAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Опора {pillar.position} из 8
            </span>
            <input
              type="text"
              value={pillar.title}
              onChange={(e) => onUpdatePillarTitle(e.target.value)}
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:outline-none focus:border-indigo-500 w-full"
            />
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть окно опоры"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions list */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            8 действий опоры. Отметьте флажок рутины, чтобы добавить действие в ежедневный трекер.
          </p>

          <div className="space-y-3">
            {actions.map((act, idx) => {
              const validation = validateAction(act.text);
              return (
                <div
                  key={act.id}
                  className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                    act.isRoutine
                      ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Действие {pillar.position}.{idx + 1}
                    </span>

                    <div className="flex items-center gap-3">
                      {act.text && validation.isWeak && (
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Слабая формулировка
                        </span>
                      )}
                      {act.text && !validation.isWeak && validation.isActionable && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> В зоне контроля
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateAction(act.id, act.text, !act.isRoutine, act.frequency)
                        }
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                          act.isRoutine
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {act.isRoutine ? (
                          <CheckSquare className="w-3.5 h-3.5" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                        <span>{act.isRoutine ? 'Рутина в трекере' : 'Сделать рутиной'}</span>
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={act.text}
                    onChange={(e) =>
                      onUpdateAction(act.id, e.target.value, act.isRoutine, act.frequency)
                    }
                    placeholder="Например: 15 минут карточек со словами"
                    className="w-full text-base p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {act.isRoutine && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Частота выполнения:
                      </span>
                      <select
                        value={act.frequency}
                        onChange={(e) =>
                          onUpdateAction(
                            act.id,
                            act.text,
                            act.isRoutine,
                            e.target.value as ActionItem['frequency']
                          )
                        }
                        className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200"
                      >
                        <option value="daily">Ежедневно</option>
                        <option value="weekly_4">4 раза в неделю</option>
                        <option value="weekly_3">3 раза в неделю</option>
                        <option value="weekly_2">2 раза в неделю</option>
                        <option value="weekly_1">1 раз в неделю</option>
                      </select>
                    </div>
                  )}

                  {validation.tip && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                      💡 Совет: {validation.tip}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
          >
            Сохранить и закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
