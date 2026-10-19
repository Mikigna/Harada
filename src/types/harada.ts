export interface Goal {
  id: string;
  title: string;
  targetMetric: string;
  targetDate: string; // YYYY-MM-DD
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Pillar {
  id: string;
  goalId: string;
  position: number; // 1 to 8
  title: string;
}

export interface ActionItem {
  id: string;
  pillarId: string;
  position: number; // 1 to 8
  text: string;
  isRoutine: boolean;
  frequency: 'daily' | 'weekly_4' | 'weekly_3' | 'weekly_2' | 'weekly_1';
  weekQuota?: number;
}

export interface RoutineCheck {
  id: string;
  actionId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
  updatedAt: string;
}

export interface ResultMetric {
  id: string;
  goalId: string;
  title: string;
  unit: string;
  targetValue: number;
  initialValue?: number;
  entries: ResultEntry[];
}

export interface ResultEntry {
  id: string;
  date: string; // YYYY-MM-DD
  value: number;
  note?: string;
}

export interface WeeklyReview {
  id: string;
  goalId: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  whatWorked: string;
  whatHindered: string;
  whatToChange: string;
  completedAt: string;
}

export interface HaradaState {
  goal: Goal;
  pillars: Pillar[];
  actions: ActionItem[];
  metrics: ResultMetric[];
  reviews: WeeklyReview[];
  checks: Record<string, boolean>; // key: `${actionId}_${date}`
  forgivenessEnabled: boolean;
}

export interface TemplateData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  goalTitle: string;
  targetMetric: string;
  targetDate: string;
  pillars: {
    title: string;
    actions: {
      text: string;
      isRoutine?: boolean;
      frequency?: 'daily' | 'weekly_4' | 'weekly_3' | 'weekly_2' | 'weekly_1';
    }[];
  }[];
  metrics: {
    title: string;
    unit: string;
    targetValue: number;
    initialValue?: number;
  }[];
}
