import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  Flame,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertTriangle,
  HeartHandshake,
  Sparkles,
  Plus,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { HaradaState, ActionItem, ResultMetric, WeeklyReview } from '../../types/harada.ts';
import { calculateStreak, calculatePillarHealth } from '../../utils/logic.ts';
import { getMondayOfWeek } from '../../utils/storage.ts';

interface TrackerViewProps {
  state: HaradaState;
  onUpdateState: (newState: HaradaState) => void;
  activeSubTab?: 'today' | 'streaks' | 'pillars' | 'metrics' | 'review';
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  state,
  onUpdateState,
  activeSubTab = 'today',
}) => {
  const [subTab, setSubTab] = useState<'today' | 'streaks' | 'pillars' | 'metrics' | 'review'>(
    activeSubTab
  );

  // Selected date for checklist: today or yesterday
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Weekly review form state
  const mondayStr = getMondayOfWeek(new Date()).toISOString().slice(0, 10);
  const existingReview = state.reviews.find((r) => r.weekStart === mondayStr);

  const [reviewWhatWorked, setReviewWhatWorked] = useState(existingReview?.whatWorked || '');
  const [reviewWhatHindered, setReviewWhatHindered] = useState(existingReview?.whatHindered || '');
  const [reviewWhatToChange, setReviewWhatToChange] = useState(existingReview?.whatToChange || '');
  const [isReviewSaved, setIsReviewSaved] = useState(Boolean(existingReview));

  // Metric entry modal state
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [selectedMetricId, setSelectedMetricId] = useState<string>(state.metrics[0]?.id || '');
  const [metricValueInput, setMetricValueInput] = useState<string>('');
  const [metricNoteInput, setMetricNoteInput] = useState<string>('');

  const routineActions = state.actions.filter((a) => a.isRoutine);

  // Check action handler
  const handleToggleCheck = (actionId: string) => {
    const key = `${actionId}_${selectedDate}`;
    const nextChecks = { ...state.checks, [key]: !state.checks[key] };

    // Calculate completed count for celebration
    const completedTodayCount = routineActions.filter((a) =>
      a.id === actionId ? !state.checks[key] : nextChecks[`${a.id}_${selectedDate}`]
    ).length;

    if (completedTodayCount === routineActions.length && routineActions.length > 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    onUpdateState({ ...state, checks: nextChecks });
  };

  // Toggle forgiveness mode
  const handleToggleForgiveness = () => {
    onUpdateState({ ...state, forgivenessEnabled: !state.forgivenessEnabled });
  };

  // Save weekly review
  const handleSaveReview = () => {
    const updatedReviews = [...state.reviews.filter((r) => r.weekStart !== mondayStr)];
    updatedReviews.unshift({
      id: `review_${state.goal.id}_${Date.now()}`,
      goalId: state.goal.id,
      weekStart: mondayStr,
      whatWorked: reviewWhatWorked,
      whatHindered: reviewWhatHindered,
      whatToChange: reviewWhatToChange,
      completedAt: new Date().toISOString(),
    });

    onUpdateState({ ...state, reviews: updatedReviews });
    setIsReviewSaved(true);
    confetti({ particleCount: 50, spread: 60 });
  };

  // Add metric entry
  const handleAddMetricEntry = () => {
    const val = parseFloat(metricValueInput);
    if (isNaN(val)) return;

    const newMetrics = state.metrics.map((m) => {
      if (m.id === selectedMetricId) {
        return {
          ...m,
          entries: [
            ...m.entries,
            {
              id: `entry_${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              value: val,
              note: metricNoteInput.trim() || undefined,
            },
          ],
        };
      }
      return m;
    });

    onUpdateState({ ...state, metrics: newMetrics });
    setIsAddEntryOpen(false);
    setMetricValueInput('');
    setMetricNoteInput('');
  };

  // Calculate day completion rate
  const completedCount = routineActions.filter(
    (a) => state.checks[`${a.id}_${selectedDate}`]
  ).length;
  const dayProgressPct =
    routineActions.length > 0 ? Math.round((completedCount / routineActions.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-4">
      {/* Tracker Sub-navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setSubTab('today')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            subTab === 'today'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Сегодня ({completedCount}/{routineActions.length})</span>
        </button>

        <button
          onClick={() => setSubTab('streaks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            subTab === 'streaks'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Серии</span>
        </button>

        <button
          onClick={() => setSubTab('pillars')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            subTab === 'pillars'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Здоровье опор</span>
        </button>

        <button
          onClick={() => setSubTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            subTab === 'metrics'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Результат</span>
        </button>

        <button
          onClick={() => setSubTab('review')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            subTab === 'review'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span>Обзор PDCA</span>
        </button>
      </div>

      {/* SUBTAB 1: TODAY (Чек-лист рутин) */}
      {subTab === 'today' && (
        <div className="space-y-6">
          {/* Daily Progress Banner */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Ежедневный прогресс
                </span>
                <span>·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedDate === todayStr ? 'Сегодня' : 'Вчера'} ({selectedDate})
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {dayProgressPct}% выполнено
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {completedCount} из {routineActions.length} рутин закрыто
              </p>
            </div>

            {/* Date Switcher: Today vs Yesterday */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  selectedDate === todayStr
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Сегодня
              </button>
              <button
                onClick={() => setSelectedDate(yesterdayStr)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  selectedDate === yesterdayStr
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Вчера (догнать)
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2.5 transition-all duration-300 rounded-full"
              style={{ width: `${dayProgressPct}%` }}
            />
          </div>

          {/* Routine items checklist */}
          {routineActions.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Рутины ещё не выбраны
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Откройте «Матрицу 8×8» и отметьте флажки рутин на опорных карточках или пройдите «Мастер целей».
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {routineActions.map((act) => {
                const pillar = state.pillars.find((p) => p.id === act.pillarId);
                const isChecked = Boolean(state.checks[`${act.id}_${selectedDate}`]);

                return (
                  <div
                    key={act.id}
                    onClick={() => handleToggleCheck(act.id)}
                    className={`min-h-[58px] p-4 rounded-2xl border transition-all flex items-center justify-between gap-3.5 cursor-pointer active:scale-[0.99] ${
                      isChecked
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="shrink-0 text-emerald-600 dark:text-emerald-400">
                        {isChecked ? (
                          <CheckCircle2 className="w-6 h-6 fill-emerald-100 dark:fill-emerald-950" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block truncate">
                          {pillar ? pillar.title : 'Опора'}
                        </span>
                        <p
                          className={`text-sm sm:text-base font-semibold leading-tight transition-all ${
                            isChecked
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {act.text}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {act.frequency === 'daily'
                          ? 'Ежедневно'
                          : act.frequency === 'weekly_4'
                          ? '4 р/нед'
                          : act.frequency === 'weekly_3'
                          ? '3 р/нед'
                          : '2 р/нед'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: STREAKS (Серии) */}
      {subTab === 'streaks' && (
        <div className="space-y-6">
          {/* Forgiveness Mode Card */}
          <div className="p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Режим «Одно прощение в неделю»
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Один пропущенный день в неделю не сбрасывает вашу серию рутины до нуля. Это защищает от выгорания и помогает вернуться в ритм.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={state.forgivenessEnabled}
                onChange={handleToggleForgiveness}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Streaks List */}
          <div className="space-y-3">
            {routineActions.map((act) => {
              const pillar = state.pillars.find((p) => p.id === act.pillarId);
              // Extract checked dates for this action
              const completedDates = Object.entries(state.checks)
                .filter(([k, v]) => k.startsWith(act.id + '_') && v)
                .map(([k]) => k.replace(act.id + '_', ''));

              const streakInfo = calculateStreak(
                completedDates,
                todayStr,
                state.forgivenessEnabled
              );

              return (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      {pillar?.title || 'Опора'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {act.text}
                    </h4>
                    {streakInfo.forgivenessUsedInCurrentWeek && (
                      <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                        <HeartHandshake className="w-3 h-3" /> Использовано прощение на этой неделе
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-base font-bold text-amber-600 dark:text-amber-400">
                        <Flame className="w-4 h-4 fill-amber-500" />
                        <span className="font-mono">{streakInfo.currentStreak}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">дней серия</span>
                    </div>

                    <div className="text-center border-l border-slate-200 dark:border-slate-800 pl-3">
                      <span className="text-base font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {streakInfo.longestStreak}
                      </span>
                      <span className="text-[10px] text-slate-400 block">рекорд</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: PILLARS HEALTH (Процент по опорам и совет о разгрузке) */}
      {subTab === 'pillars' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Баланс опор метода Харада:
            </span>
            <p>
              Если опора выполняется менее чем на 30% в течение 2 недель, приложение мягко предлагает уменьшить объём действий или снизить частоту, чтобы сохранить устойчивость.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {state.pillars.map((pillar) => {
              const health = calculatePillarHealth(
                pillar.id,
                state.actions,
                state.checks,
                todayStr,
                14
              );

              return (
                <div
                  key={pillar.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    health.needsLoadReduction
                      ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      ОПОРА {pillar.position}
                    </span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                      {health.percentage}%
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {pillar.title}
                  </h4>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        health.percentage >= 60
                          ? 'bg-emerald-500'
                          : health.percentage >= 30
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${health.percentage}%` }}
                    />
                  </div>

                  {health.needsLoadReduction && (
                    <div className="p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <p>
                        Выполнение менее 30% за 2 недели. <strong>Совет:</strong> уменьшите объём рутин по этой опоре, а не давите на себя.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 4: METRICS (Показатели результата) */}
      {subTab === 'metrics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Динамика ключевых показателей цели
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Замеры вносятся раз в неделю или месяц (балл пробного теста, вес, словарный запас).
              </p>
            </div>

            <button
              onClick={() => setIsAddEntryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Внести замер</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {state.metrics.map((metric) => {
              const latestEntry = metric.entries[metric.entries.length - 1];
              const currentValue = latestEntry ? latestEntry.value : metric.initialValue || 0;
              const progressPct =
                metric.targetValue > 0
                  ? Math.min(100, Math.round((currentValue / metric.targetValue) * 100))
                  : 0;

              return (
                <div
                  key={metric.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Показатель
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {metric.title}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950">
                      Цель: {metric.targetValue} {metric.unit}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {currentValue}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{metric.unit}</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold ml-auto">
                      {progressPct}% к цели
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* History of entries */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      История замеров:
                    </span>
                    {metric.entries.length === 0 ? (
                      <p className="text-xs text-slate-400">Нет записей</p>
                    ) : (
                      <div className="space-y-1">
                        {metric.entries.slice(-3).map((e) => (
                          <div
                            key={e.id}
                            className="text-xs flex items-center justify-between text-slate-600 dark:text-slate-300"
                          >
                            <span>{e.date}</span>
                            <span className="font-bold font-mono">
                              {e.value} {metric.unit} {e.note && `· ${e.note}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Entry Modal */}
          {isAddEntryOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Внести новый замер
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Показатель
                  </label>
                  <select
                    value={selectedMetricId}
                    onChange={(e) => setSelectedMetricId(e.target.value)}
                    className="w-full text-sm p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {state.metrics.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Значение
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={metricValueInput}
                    onChange={(e) => setMetricValueInput(e.target.value)}
                    placeholder="Например: 7.0 или 85"
                    className="w-full text-base p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Заметка (опционально)
                  </label>
                  <input
                    type="text"
                    value={metricNoteInput}
                    onChange={(e) => setMetricNoteInput(e.target.value)}
                    placeholder="Например: полный пробник IELTS"
                    className="w-full text-sm p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAddEntryOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleAddMetricEntry}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 5: WEEKLY REVIEW (Недельный обзор PDCA) */}
      {subTab === 'review' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Цикл PDCA: Plan → Do → Check → Act
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Недельный обзор (Неделя от {mondayStr})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Раз в неделю ответьте на 3 вопроса. Это позволяет скорректировать действия и не повторять ошибки.
              </p>
            </div>

            {/* Question 1 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                1. Что получилось на этой неделе?
              </label>
              <textarea
                rows={2}
                value={reviewWhatWorked}
                onChange={(e) => {
                  setReviewWhatWorked(e.target.value);
                  setIsReviewSaved(false);
                }}
                placeholder="Какие рутины дались легко? Какие победы произошли?"
                className="w-full text-base p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Question 2 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                2. Что помешало или вызвало сбой?
              </label>
              <textarea
                rows={2}
                value={reviewWhatHindered}
                onChange={(e) => {
                  setReviewWhatHindered(e.target.value);
                  setIsReviewSaved(false);
                }}
                placeholder="Что отвлекло? В какое время суток произошел срыв?"
                className="w-full text-base p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Question 3 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                3. Что конкретно изменить в рутинах на следующую неделю?
              </label>
              <textarea
                rows={2}
                value={reviewWhatToChange}
                onChange={(e) => {
                  setReviewWhatToChange(e.target.value);
                  setIsReviewSaved(false);
                }}
                placeholder="Перенести время? Уменьшить объём? Добавить триггер привычки?"
                className="w-full text-base p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {isReviewSaved ? (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Обзор сохранён в истории
                </span>
              ) : (
                <span className="text-xs text-slate-400">Несохранённые изменения</span>
              )}

              <button
                onClick={handleSaveReview}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
              >
                Сохранить итоги недели
              </button>
            </div>
          </div>

          {/* Review History */}
          {state.reviews.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Архив недельных обзоров
              </h4>

              <div className="space-y-3">
                {state.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                      Неделя от {rev.weekStart}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Получилось:</strong> {rev.whatWorked}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Помешало:</strong> {rev.whatHindered}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Что изменить:</strong> {rev.whatToChange}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
