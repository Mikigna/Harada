import React, { useState } from 'react';
import { X, Check, BookOpen, ArrowRight, Target, Sparkles } from 'lucide-react';
import { TEMPLATES } from '../../data/templates.ts';
import { TemplateData, HaradaState } from '../../types/harada.ts';
import { createInitialGoalFromTemplate } from '../../utils/storage.ts';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (newState: HaradaState) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData>(TEMPLATES[0]);

  if (!isOpen) return null;

  const handleApply = () => {
    const newState = createInitialGoalFromTemplate(selectedTemplate);
    onSelectTemplate(newState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Библиотека готовых квадратов Харада
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть библиотеку"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left templates list, Right preview */}
        <div className="flex-1 overflow-y-auto grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Templates Selector */}
          <div className="p-4 sm:p-5 space-y-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Выберите квадрат:
            </span>
            {TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {tpl.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {tpl.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Template Full Preview */}
          <div className="md:col-span-2 p-5 sm:p-6 overflow-y-auto space-y-5">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {selectedTemplate.category}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedTemplate.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <strong>Главная цель:</strong> {selectedTemplate.goalTitle}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <span>Срок: {selectedTemplate.targetDate}</span>
                <span>·</span>
                <span>Показатель: {selectedTemplate.targetMetric}</span>
                <span>·</span>
                <span>
                  Рутин:{' '}
                  {selectedTemplate.pillars.flatMap((p) => p.actions).filter((a) => a.isRoutine)
                    .length}
                </span>
              </div>
            </div>

            {/* 8 Pillars with actions preview */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                8 опор и ключевые действия (64 действия):
              </span>

              <div className="grid sm:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto pr-1">
                {selectedTemplate.pillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5"
                  >
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {pillar.title}
                    </span>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {pillar.actions.slice(0, 4).map((a, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-1.5 truncate">
                          <span className="text-slate-400 font-mono shrink-0">{aIdx + 1}.</span>
                          <span className="truncate">{a.text}</span>
                          {a.isRoutine && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                              ★
                            </span>
                          )}
                        </li>
                      ))}
                      {pillar.actions.length > 4 && (
                        <li className="text-[11px] text-slate-400 italic">
                          + ещё {pillar.actions.length - 4} действий
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
          >
            Отмена
          </button>

          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
          >
            <span>Использовать этот квадрат</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
