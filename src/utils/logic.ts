import { ActionItem } from '../types/harada.ts';

export interface GoalValidationResult {
  hasResult: boolean;
  hasMeasure: boolean;
  hasDate: boolean;
  isValid: boolean;
  suggestions: string[];
}

export function validateGoal(title: string, targetDate?: string): GoalValidationResult {
  const clean = (title || '').trim().toLowerCase();
  const suggestions: string[] = [];

  // Check 1: Outcome / result (action verb or outcome phrase)
  const resultPatterns = [
    /сдать|поступить|выучить|достичь|запустить|заработать|пробежать|похудеть|набрать|увеличить|создать|освоить|научиться|открыть|купить|построить|выйти на|написать|закрыть|говорить/i,
  ];
  const hasResult = resultPatterns.some((pattern) => pattern.test(clean)) || clean.length > 15;

  if (!hasResult) {
    suggestions.push('Уточните результат: с какого действия начнётся цель (например: «Сдать IELTS», «Поступить на бюджет», «Выйти на доход»)?');
  }

  // Check 2: Measurability / criteria (numbers, grades, levels, percentage)
  const measurePatterns = [
    /\d+([.,]\d+)?/, // any number
    /c1|c2|b2|ielts|toefl|hsk|n1|n2|егэ|огэ|грант|бюджет|процент|руб|долл|\$|€|%|кг|км/i,
  ];
  const hasMeasure = measurePatterns.some((pattern) => pattern.test(clean));

  if (!hasMeasure) {
    suggestions.push('Добавьте число или измеримый критерий: балл, уровень, сумму или процент (например: «не ниже 7.5», «на уровень C1», «15 км»).');
  }

  // Check 3: Date / deadline
  const dateInText = /202\d|203\d|январ|феврал|март|апрел|ма[ейя]|июн|июл|август|сентябр|октябр|ноябр|декабр|к концу|до \d|через \d/i.test(clean);
  const hasDate = Boolean((targetDate && targetDate.trim().length > 0) || dateInText);

  if (!hasDate) {
    suggestions.push('Укажите точный срок: день, месяц или год дедлайна (например: «до 31 декабря 2027 года»).');
  }

  const isValid = hasResult && hasMeasure && hasDate;

  return {
    hasResult,
    hasMeasure,
    hasDate,
    isValid,
    suggestions,
  };
}

export interface ActionValidationResult {
  isActionable: boolean;
  hasQuantity: boolean;
  isWeak: boolean;
  tip?: string;
}

export function validateAction(text: string): ActionValidationResult {
  const clean = (text || '').trim().toLowerCase();
  if (!clean) {
    return { isActionable: false, hasQuantity: false, isWeak: false };
  }

  // Detect vague / non-actionable "desires" or "mindset" statements
  const weakPatterns = [
    /стать увереннее|быть увереннее|больше стараться|стараться|меньше переживать|не бояться|хотеть|думать о хорошем|быть лучше|любить себя|верить в себя/i,
  ];
  const isWeak = weakPatterns.some((pattern) => pattern.test(clean));

  // Check for actionable verbs anywhere in the text or after initial numbers (e.g. "20 новых слов", "30 минут бега")
  const actionVerbPattern = /[а-яa-z]+/i;
  const isActionable = !isWeak && actionVerbPattern.test(clean) && clean.length >= 3;

  // Check for volume/frequency/duration: numbers, minutes, hours, days, repetition words
  const quantityPattern = /\d+|минут|час|раз|дн|недел|месяц|слов|страниц|юнит|задач|ежедневно|каждый день|регулярно|утром|вечером/i;
  const hasQuantity = quantityPattern.test(clean);

  let tip: string | undefined;
  if (isWeak) {
    tip = 'Формулировка не в зоне вашего контроля. Замените внутреннее состояние конкретным действием (например: не «стать увереннее», а «записывать 2-минутное голосовое сообщение каждый день»).';
  } else if (!hasQuantity) {
    tip = 'Добавьте объём или время: сколько раз, минут или страниц (например: «15 минут в день», «2 задачи в неделю»).';
  }

  return {
    isActionable,
    hasQuantity,
    isWeak,
    tip,
  };
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  forgivenessUsedInCurrentWeek: boolean;
}

export function calculateStreak(
  completedDates: string[],
  todayStr: string,
  allowForgiveness: boolean = true
): StreakResult {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, forgivenessUsedInCurrentWeek: false };
  }

  const dateSet = new Set(completedDates);
  const today = new Date(todayStr + 'T12:00:00Z');

  let currentStreak = 0;
  let cursor = new Date(today);
  const todayKey = cursor.toISOString().slice(0, 10);

  let missedDaysInWeek = 0;
  let daysInRollingWeek = 0;

  if (!dateSet.has(todayKey)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    daysInRollingWeek++;

    if (dateSet.has(key)) {
      currentStreak++;
    } else {
      if (allowForgiveness && missedDaysInWeek === 0 && daysInRollingWeek <= 7) {
        missedDaysInWeek++;
      } else {
        break;
      }
    }

    if (daysInRollingWeek >= 7) {
      daysInRollingWeek = 0;
      missedDaysInWeek = 0;
    }

    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const sortedDates = Array.from(dateSet).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const currDate = new Date(dStr + 'T12:00:00Z');
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays === 2 && allowForgiveness) {
        tempStreak += 2;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currDate;
  }

  return {
    currentStreak: Math.max(currentStreak, 0),
    longestStreak: Math.max(longestStreak, currentStreak),
    forgivenessUsedInCurrentWeek: missedDaysInWeek > 0,
  };
}

export interface PillarHealth {
  pillarId: string;
  totalChecks: number;
  expectedChecks: number;
  percentage: number;
  needsLoadReduction: boolean;
}

export function calculatePillarHealth(
  pillarId: string,
  actions: ActionItem[],
  checks: Record<string, boolean>,
  todayStr: string,
  daysLookback: number = 14
): PillarHealth {
  const pillarActions = actions.filter((a) => a.pillarId === pillarId && a.isRoutine);
  if (pillarActions.length === 0) {
    return {
      pillarId,
      totalChecks: 0,
      expectedChecks: 0,
      percentage: 100,
      needsLoadReduction: false,
    };
  }

  const today = new Date(todayStr + 'T12:00:00Z');
  let totalDone = 0;
  let totalExpected = 0;

  for (let i = 0; i < daysLookback; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const dateKey = d.toISOString().slice(0, 10);

    for (const action of pillarActions) {
      totalExpected++;
      if (checks[`${action.id}_${dateKey}`]) {
        totalDone++;
      }
    }
  }

  const percentage = totalExpected > 0 ? Math.round((totalDone / totalExpected) * 100) : 100;
  const needsLoadReduction = daysLookback >= 14 && totalExpected >= 14 && percentage < 30;

  return {
    pillarId,
    totalChecks: totalDone,
    expectedChecks: totalExpected,
    percentage,
    needsLoadReduction,
  };
}
