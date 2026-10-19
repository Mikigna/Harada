import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Calendar,
  Layers,
  Repeat,
  Download,
} from 'lucide-react';
import { HaradaState, Pillar, ActionItem, Goal } from '../../types/harada.ts';
import { validateGoal, validateAction } from '../../utils/logic.ts';
import { TEMPLATES } from '../../data/templates.ts';
import { createInitialGoalFromTemplate, createEmptyGoal } from '../../utils/storage.ts';

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: HaradaState;
  onSaveState: (state: HaradaState) => void;
  onOpenExport: () => void;
}

export const WizardModal: React.FC<WizardModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onSaveState,
  onOpenExport,
}) => {
  const [step, setStep] = useState<number>(1);
  const [localState, setLocalState] = useState<HaradaState>(currentState);
  const [pillarStepIndex, setPillarStepIndex] = useState<number>(0); // 0 to 7 for Step 4
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  if (!isOpen) return null;

  const goalValidation = validateGoal(localState.goal.title, localState.goal.targetDate);

  const handleApplyTemplate = (tplId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === tplId);
    if (tpl) {
      const newState = createInitialGoalFromTemplate(tpl);
      setLocalState(newState);
      setSelectedTemplateId(tplId);
      setStep(2);
    }
  };

  const handleStartBlank = () => {
    const emptyState = createEmptyGoal('', '');
    setLocalState(emptyState);
    setStep(2);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.goal && parsed.pillars && parsed.actions) {
          setLocalState(parsed);
          setStep(2);
        } else {
          alert('Файл не содержит корректную структуру квадрата Харада');
        }
      } catch (err) {
        alert('Ошибка при чтении JSON файла');
      }
    };
    reader.readAsText(file);
  };

  // Step 3 Pillar changes
  const updatePillarTitle = (pIndex: number, newTitle: string) => {
    const newPillars = [...localState.pillars];
    newPillars[pIndex] = { ...newPillars[pIndex], title: newTitle };
    setLocalState({ ...localState, pillars: newPillars });
  };

  // Step 4 Action changes
  const updateActionText = (actionId: string, text: string) => {
    const newActions = localState.actions.map((act) =>
      act.id === actionId ? { ...act, text } : act
    );
    setLocalState({ ...localState, actions: newActions });
  };

  // Step 5 Routine toggle
  const toggleRoutine = (actionId: string) => {
    const newActions = localState.actions.map((act) =>
      act.id === actionId ? { ...act, isRoutine: !act.isRoutine } : act
    );
    setLocalState({ ...localState, actions: newActions });
  };

  const updateRoutineFrequency = (actionId: string, frequency: ActionItem['frequency']) => {
    const newActions = localState.actions.map((act) =>
      act.id === actionId ? { ...act, frequency } : act
    );
    setLocalState({ ...localState, actions: newActions });
  };

  const handleFinishWizard = () => {
    onSaveState(localState);
    onClose();
  };

  const activeRoutinesCount = localState.actions.filter((a) => a.isRoutine).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Wizard Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              {step}/7
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {step === 1 && 'Шаг 1: Выбор старта'}
                {step === 2 && 'Шаг 2: Главная цель'}
                {step === 3 && 'Шаг 3: Восемь опор'}
                {step === 4 && `Шаг 4: Действия для опоры ${pillarStepIndex + 1}/8`}
                {step === 5 && 'Шаг 5: Выбор рутин для трекера'}
                {step === 6 && 'Шаг 6: Просмотр готового квадрата'}
                {step === 7 && 'Шаг 7: Запуск трекера и экспорт'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Автосохранение на каждом шаге
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть мастер"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {/* Wizard Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* STEP 1: Выбор старта */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Как вы хотите начать сборку квадрата?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Мастер проведёт вас по шагам. Вы можете выбрать готовый пример с 64 действиями или собрать свой квадрат с нуля.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl.id)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-800/60 cursor-pointer transition-all hover:shadow-md group"
                  >
                    <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                      <span>{tpl.category}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {tpl.subtitle}
                    </p>
                    <span className="inline-block mt-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      8 опор · 64 действия · готовые рутины
                    </span>
                  </div>
                ))}

                {/* Start from scratch */}
                <div
                  onClick={handleStartBlank}
                  className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Индивидуально
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      Начать с нуля
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Ввести собственную главную цель, опоры и действия шаг за шагом с проверками.
                    </p>
                  </div>
                  <span className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    Собрать свой квадрат <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Import JSON */}
                <label className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/40 cursor-pointer transition-all flex flex-col justify-between">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Резервная копия
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      Импортировать свой квадрат
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Загрузить сохранённый ранее JSON-файл квадрата и продолжить работу.
                    </p>
                  </div>
                  <span className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Выбрать файл .json →
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Главная цель */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Сформулируйте вашу главную цель
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Метод Харада требует формулу: <strong className="text-indigo-600 dark:text-indigo-400">«что + насколько/критерий + к какой дате»</strong>.
                </p>
              </div>

              {/* Goal Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Формулировка цели
                </label>
                <textarea
                  rows={3}
                  value={localState.goal.title}
                  onChange={(e) =>
                    setLocalState({
                      ...localState,
                      goal: { ...localState.goal, title: e.target.value },
                    })
                  }
                  placeholder="Например: Свободно говорить на английском на уровне C1 и сдать IELTS Academic не ниже 7.5 до 31 декабря 2027 года"
                  className="w-full text-base p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Target Date Input */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Точный дедлайн (срок)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={localState.goal.targetDate}
                      onChange={(e) =>
                        setLocalState({
                          ...localState,
                          goal: { ...localState.goal, targetDate: e.target.value },
                        })
                      }
                      className="w-full text-base px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ключевой показатель (балл, сумма, вес)
                  </label>
                  <input
                    type="text"
                    value={localState.goal.targetMetric}
                    onChange={(e) =>
                      setLocalState({
                        ...localState,
                        goal: { ...localState.goal, targetMetric: e.target.value },
                      })
                    }
                    placeholder="Например: 7.5 IELTS / 90 баллов"
                    className="w-full text-base px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 3 Criteria Validation Indicators */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Проверка критериев измеримости:
                </span>
                <div className="grid sm:grid-cols-3 gap-2">
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
                      goalValidation.hasResult
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {goalValidation.hasResult ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    )}
                    <span>1. Есть результат (что)</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
                      goalValidation.hasMeasure
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {goalValidation.hasMeasure ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    )}
                    <span>2. Есть число/критерий</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
                      goalValidation.hasDate
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {goalValidation.hasDate ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    )}
                    <span>3. Есть точный срок</span>
                  </div>
                </div>

                {goalValidation.suggestions.length > 0 && (
                  <div className="pt-2 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    {goalValidation.suggestions.map((s, idx) => (
                      <p key={idx} className="flex items-start gap-1.5">
                        <span className="font-bold">•</span> {s}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Восемь опор */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Определите 8 опор цели
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Опоры — это 8 ключевых направлений (hard skills, soft skills, среда, режим, психологический настрой). Необязательно заполнять все сразу: незаполненные клетки помечаются «вернуться позже».
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {localState.pillars.map((pillar, idx) => (
                  <div
                    key={pillar.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 space-y-1.5"
                  >
                    <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Опора {idx + 1}
                    </label>
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => updatePillarTitle(idx, e.target.value)}
                      placeholder={`Название опоры ${idx + 1} (или оставить пустым)`}
                      className="w-full text-base px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Действия на опору (1 экран на опору) */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Опора {pillarStepIndex + 1} из 8:
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {localState.pillars[pillarStepIndex]?.title || `Опора ${pillarStepIndex + 1}`}
                  </h3>
                </div>
                {/* Pillar switcher */}
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={pillarStepIndex === 0}
                    onClick={() => setPillarStepIndex(pillarStepIndex - 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {pillarStepIndex + 1} / 8
                  </span>
                  <button
                    disabled={pillarStepIndex === 7}
                    onClick={() => setPillarStepIndex(pillarStepIndex + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Введите до 8 конкретных действий. Каждое действие проверяется на критерий «в зоне моего контроля» (глагол, объём, частота).
              </p>

              {/* 8 Actions for this pillar */}
              <div className="space-y-3">
                {localState.actions
                  .filter((a) => a.pillarId === localState.pillars[pillarStepIndex]?.id)
                  .map((action, aIdx) => {
                    const validation = validateAction(action.text);
                    return (
                      <div
                        key={action.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Действие {pillarStepIndex + 1}.{aIdx + 1}
                          </label>
                          {action.text && validation.isWeak && (
                            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Слабая формулировка
                            </span>
                          )}
                          {action.text && !validation.isWeak && validation.isActionable && (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> В зоне контроля
                            </span>
                          )}
                        </div>

                        <input
                          type="text"
                          value={action.text}
                          onChange={(e) => updateActionText(action.id, e.target.value)}
                          placeholder="Глагол + объём/частота (например: 15 минут карточек в день)"
                          className="w-full text-base px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

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
          )}

          {/* STEP 5: Выбор рутин */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Отметьте рутины для ежедневного трекера
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Из 64 действий выберите те, которые будете делать регулярно.
                  </p>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${
                    activeRoutinesCount >= 5 && activeRoutinesCount <= 8
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}
                >
                  Выбрано: {activeRoutinesCount} (норма 5–8)
                </div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto space-y-2.5 pr-1">
                {localState.pillars.map((pillar) => {
                  const pillarActions = localState.actions.filter(
                    (a) => a.pillarId === pillar.id && a.text.trim().length > 0
                  );
                  if (pillarActions.length === 0) return null;

                  return (
                    <div key={pillar.id} className="space-y-1.5">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block px-1">
                        {pillar.title}
                      </span>
                      {pillarActions.map((action) => (
                        <div
                          key={action.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            action.isRoutine
                              ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={action.isRoutine}
                              onChange={() => toggleRoutine(action.id)}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                              {action.text}
                            </span>
                          </label>

                          {action.isRoutine && (
                            <select
                              value={action.frequency}
                              onChange={(e) =>
                                updateRoutineFrequency(
                                  action.id,
                                  e.target.value as ActionItem['frequency']
                                )
                              }
                              className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200"
                            >
                              <option value="daily">Ежедневно</option>
                              <option value="weekly_4">4 раза в неделю</option>
                              <option value="weekly_3">3 раза в неделю</option>
                              <option value="weekly_2">2 раза в неделю</option>
                              <option value="weekly_1">1 раз в неделю</option>
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Просмотр готового квадрата */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Ваш квадрат Харада собран
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Проверьте структуру. 8 опор окружают главную цель, а каждое действие привязано к своей опоре.
                </p>
              </div>

              {/* 3x3 Preview Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-md mx-auto aspect-square">
                {/* 3x3 summary */}
                {[
                  localState.pillars[0],
                  localState.pillars[1],
                  localState.pillars[2],
                  localState.pillars[7],
                  { isCenter: true, title: localState.goal.title },
                  localState.pillars[3],
                  localState.pillars[6],
                  localState.pillars[5],
                  localState.pillars[4],
                ].map((item, idx) => {
                  if ('isCenter' in item && item.isCenter) {
                    return (
                      <div
                        key="center"
                        className="bg-amber-400 dark:bg-amber-500 rounded-xl p-2 flex flex-col justify-center items-center text-center shadow-md text-amber-950 font-bold"
                      >
                        <span className="text-[10px] uppercase tracking-wide opacity-80">Цель</span>
                        <span className="text-xs font-bold line-clamp-3 leading-tight mt-0.5">
                          {item.title || 'Главная цель'}
                        </span>
                      </div>
                    );
                  }
                  const pillar = item as Pillar;
                  return (
                    <div
                      key={pillar?.id || idx}
                      className="bg-white dark:bg-slate-900 rounded-xl p-2 flex flex-col justify-center items-center text-center shadow-sm border border-slate-200 dark:border-slate-700"
                    >
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                        {pillar?.title?.slice(0, 15) || `Опора ${idx + 1}`}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">8 действий</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Запуск трекера и экспорт */}
          {step === 7 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Квадрат готов к работе!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1.5">
                  Выбранные {activeRoutinesCount} рутин автоматически добавлены в ежедневный трекер. Вы можете скачать квадрат прямо сейчас или перейти к отметкам.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                <button
                  onClick={() => {
                    handleFinishWizard();
                    onOpenExport();
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold transition"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>Скачать квадрат</span>
                </button>

                <button
                  onClick={handleFinishWizard}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition"
                >
                  <span>Начать трекер</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            disabled={step === 1}
            onClick={() => {
              if (step === 4 && pillarStepIndex > 0) {
                setPillarStepIndex(pillarStepIndex - 1);
              } else {
                setStep(Math.max(1, step - 1));
              }
            }}
            className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded-lg transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>

          {step < 7 ? (
            <button
              onClick={() => {
                if (step === 4 && pillarStepIndex < 7) {
                  setPillarStepIndex(pillarStepIndex + 1);
                } else {
                  setStep(step + 1);
                }
              }}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
            >
              <span>Далее</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishWizard}
              className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
            >
              Готово
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
