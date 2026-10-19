import { Goal, Pillar, ActionItem, ResultMetric, WeeklyReview, HaradaState, TemplateData } from '../types/harada.ts';
import { TEMPLATES } from '../data/templates.ts';

const STORAGE_KEY_GOALS = 'harada_goals_v1';
const STORAGE_KEY_ACTIVE_ID = 'harada_active_goal_id_v1';
const STORAGE_KEY_PREFIX = 'harada_state_';

export function createInitialGoalFromTemplate(template: TemplateData): HaradaState {
  const goalId = 'goal_' + Date.now();
  const goal: Goal = {
    id: goalId,
    title: template.goalTitle,
    targetMetric: template.targetMetric,
    targetDate: template.targetDate,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const pillars: Pillar[] = [];
  const actions: ActionItem[] = [];

  template.pillars.forEach((p, pIndex) => {
    const pillarId = `pillar_${goalId}_${pIndex + 1}`;
    pillars.push({
      id: pillarId,
      goalId,
      position: pIndex + 1,
      title: p.title,
    });

    p.actions.forEach((a, aIndex) => {
      actions.push({
        id: `action_${pillarId}_${aIndex + 1}`,
        pillarId,
        position: aIndex + 1,
        text: a.text,
        isRoutine: Boolean(a.isRoutine),
        frequency: a.frequency || 'daily',
      });
    });
  });

  const metrics: ResultMetric[] = template.metrics.map((m, mIndex) => ({
    id: `metric_${goalId}_${mIndex + 1}`,
    goalId,
    title: m.title,
    unit: m.unit,
    targetValue: m.targetValue,
    initialValue: m.initialValue,
    entries: m.initialValue
      ? [
          {
            id: `entry_${Date.now()}_${mIndex}`,
            date: new Date().toISOString().slice(0, 10),
            value: m.initialValue,
            note: 'Стартовое значение',
          },
        ]
      : [],
  }));

  // Seed sample completed checks for the last few days to make the demo immediately vibrant
  const checks: Record<string, boolean> = {};
  const today = new Date();
  const routineActions = actions.filter((a) => a.isRoutine);

  for (let d = 0; d < 5; d++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - d);
    const dateStr = checkDate.toISOString().slice(0, 10);
    routineActions.forEach((act, idx) => {
      // 80% completion rate for realistic demo
      if ((idx + d) % 4 !== 0) {
        checks[`${act.id}_${dateStr}`] = true;
      }
    });
  }

  const reviews: WeeklyReview[] = [
    {
      id: `review_${goalId}_1`,
      goalId,
      weekStart: getMondayOfWeek(new Date()).toISOString().slice(0, 10),
      whatWorked: 'Стабильно повторял карточки по 15 минут каждое утро, начал читать адаптированную статью.',
      whatHindered: 'В четверг был аврал по работе, пропустил аудио-подкаст.',
      whatToChange: 'Слушать подкаст во время утренней прогулки, а не откладывать на вечер.',
      completedAt: new Date().toISOString(),
    },
  ];

  return {
    goal,
    pillars,
    actions,
    metrics,
    reviews,
    checks,
    forgivenessEnabled: true,
  };
}

export function createEmptyGoal(title: string = '', targetDate: string = ''): HaradaState {
  const goalId = 'goal_' + Date.now();
  const goal: Goal = {
    id: goalId,
    title,
    targetMetric: '',
    targetDate,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const pillars: Pillar[] = [];
  const actions: ActionItem[] = [];

  for (let i = 1; i <= 8; i++) {
    const pillarId = `pillar_${goalId}_${i}`;
    pillars.push({
      id: pillarId,
      goalId,
      position: i,
      title: `Опора ${i}`,
    });

    for (let j = 1; j <= 8; j++) {
      actions.push({
        id: `action_${pillarId}_${j}`,
        pillarId,
        position: j,
        text: '',
        isRoutine: false,
        frequency: 'daily',
      });
    }
  }

  return {
    goal,
    pillars,
    actions,
    metrics: [],
    reviews: [],
    checks: {},
    forgivenessEnabled: true,
  };
}

export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function loadAllGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GOALS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load goals list', e);
  }
  return [];
}

export function loadHaradaState(goalId?: string): HaradaState {
  try {
    const activeId = goalId || localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (activeId) {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + activeId);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    console.error('Failed to load state', e);
  }

  // Fallback: seed with first template (English C1 IELTS 7.5)
  const initial = createInitialGoalFromTemplate(TEMPLATES[0]);
  saveHaradaState(initial);
  return initial;
}

export function saveHaradaState(state: HaradaState): void {
  try {
    const goalId = state.goal.id;
    state.goal.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_PREFIX + goalId, JSON.stringify(state));
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, goalId);

    // Update goals index
    const goals = loadAllGoals();
    const existingIndex = goals.findIndex((g) => g.id === goalId);
    if (existingIndex >= 0) {
      goals[existingIndex] = state.goal;
    } else {
      goals.push(state.goal);
    }
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export function deleteGoal(goalId: string): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + goalId);
    const goals = loadAllGoals().filter((g) => g.id !== goalId);
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
    if (goals.length > 0) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, goals[0].id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }
  } catch (e) {
    console.error('Failed to delete goal', e);
  }
}
