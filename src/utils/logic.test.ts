import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateGoal,
  validateAction,
  calculateStreak,
  calculatePillarHealth,
} from './logic.ts';
import { ActionItem } from '../types/harada.ts';

test('validateGoal detects complete measurable goal', () => {
  const result = validateGoal(
    'Свободно говорить на английском на уровне C1 и сдать IELTS Academic не ниже 7.5',
    '2027-12-31'
  );
  assert.equal(result.hasResult, true);
  assert.equal(result.hasMeasure, true);
  assert.equal(result.hasDate, true);
  assert.equal(result.isValid, true);
  assert.equal(result.suggestions.length, 0);
});

test('validateGoal flags missing deadline and metrics in vague goal', () => {
  const result = validateGoal('Хочу учить английский');
  assert.equal(result.hasMeasure, false);
  assert.equal(result.hasDate, false);
  assert.equal(result.isValid, false);
  assert.ok(result.suggestions.length >= 2);
});

test('validateAction accepts actionable habit with volume', () => {
  const result = validateAction('20 новых слов в день в приложении');
  assert.equal(result.isActionable, true);
  assert.equal(result.hasQuantity, true);
  assert.equal(result.isWeak, false);
});

test('validateAction detects weak non-actionable formulation', () => {
  const result = validateAction('стать увереннее при общении');
  assert.equal(result.isWeak, true);
  assert.ok(result.tip !== undefined);
  assert.match(result.tip, /зоне вашего контроля/i);
});

test('calculateStreak counts consecutive days and handles forgiveness', () => {
  const completed = [
    '2026-10-14',
    '2026-10-15',
    '2026-10-16',
    // 2026-10-17 missed!
    '2026-10-18',
    '2026-10-19',
  ];
  const withForgiveness = calculateStreak(completed, '2026-10-19', true);
  assert.equal(withForgiveness.currentStreak, 5); // 19, 18, (17 forgiven), 16, 15, 14 = 5 days
  assert.equal(withForgiveness.forgivenessUsedInCurrentWeek, true);

  const withoutForgiveness = calculateStreak(completed, '2026-10-19', false);
  assert.equal(withoutForgiveness.currentStreak, 2); // 19, 18 only
});

test('calculatePillarHealth warns when completion is under 30% over 14 days', () => {
  const mockAction: ActionItem = {
    id: 'a1',
    pillarId: 'p1',
    position: 1,
    text: '20 минут чтения',
    isRoutine: true,
    frequency: 'daily',
  };

  const checks: Record<string, boolean> = {
    'a1_2026-10-19': true,
    'a1_2026-10-18': true,
  };

  const health = calculatePillarHealth('p1', [mockAction], checks, '2026-10-19', 14);
  assert.equal(health.needsLoadReduction, true);
  assert.ok(health.percentage < 30);
});
