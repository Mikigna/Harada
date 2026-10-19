import * as XLSX from 'xlsx';
import { HaradaState } from '../types/harada.ts';

export function exportHaradaXlsx(state: HaradaState, filename = 'harada-square.xlsx'): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Квадрат (Flat structured table)
  const squareData: (string | number)[][] = [
    ['КВАДРАТ ХАРАДА 8×8'],
    ['Цель:', state.goal.title],
    ['Срок:', state.goal.targetDate || '—'],
    ['Показатель:', state.goal.targetMetric || '—'],
    [],
    ['Номер опоры', 'Название опоры', 'Номер действия', 'Действие', 'Рутина (да/нет)', 'Частота'],
  ];

  state.pillars.forEach((p, pIdx) => {
    const actions = state.actions.filter((a) => a.pillarId === p.id);
    actions.forEach((act, aIdx) => {
      squareData.push([
        `Опора ${pIdx + 1}`,
        p.title,
        `${pIdx + 1}.${aIdx + 1}`,
        act.text || '—',
        act.isRoutine ? 'Да' : 'Нет',
        act.isRoutine
          ? act.frequency === 'daily'
            ? 'Ежедневно'
            : act.frequency === 'weekly_4'
            ? '4 раза в неделю'
            : act.frequency === 'weekly_3'
            ? '3 раза в неделю'
            : '2 раза в неделю'
          : '—',
      ]);
    });
  });

  const wsSquare = XLSX.utils.aoa_to_sheet(squareData);
  XLSX.utils.book_append_sheet(wb, wsSquare, 'Квадрат');

  // Sheet 2: Рутины
  const routineActions = state.actions.filter((a) => a.isRoutine);
  const routineData: (string | number)[][] = [
    ['ВЫБРАННЫЕ РУТИНЫ И ПРИВЫЧКИ'],
    ['Цель:', state.goal.title],
    [],
    ['№', 'Опора', 'Действие (рутина)', 'Частота', 'Серия (дней)'],
  ];

  routineActions.forEach((act, idx) => {
    const pillar = state.pillars.find((p) => p.id === act.pillarId);
    routineData.push([
      idx + 1,
      pillar ? pillar.title : '—',
      act.text,
      act.frequency === 'daily'
        ? 'Ежедневно'
        : act.frequency === 'weekly_4'
        ? '4 раза в неделю'
        : act.frequency === 'weekly_3'
        ? '3 раза в неделю'
        : '2 раза в неделю',
      '-',
    ]);
  });

  const wsRoutines = XLSX.utils.aoa_to_sheet(routineData);
  XLSX.utils.book_append_sheet(wb, wsRoutines, 'Рутины');

  // Sheet 3: Недельный обзор PDCA
  const reviewData: (string | number)[][] = [
    ['НЕДЕЛЬНЫЕ ОБЗОРЫ PDCA'],
    [],
    ['Неделя (Пн)', 'Что получилось', 'Что помешало', 'Что изменить в рутинах', 'Дата записи'],
  ];

  state.reviews.forEach((r) => {
    reviewData.push([
      r.weekStart,
      r.whatWorked,
      r.whatHindered,
      r.whatToChange,
      r.completedAt ? r.completedAt.slice(0, 10) : '—',
    ]);
  });

  const wsReview = XLSX.utils.aoa_to_sheet(reviewData);
  XLSX.utils.book_append_sheet(wb, wsReview, 'Обзор PDCA');

  XLSX.writeFile(wb, filename);
}

export function exportHaradaCsv(state: HaradaState, filename = 'harada-actions.csv'): void {
  const rows: string[] = ['Опора,Номер действия,Действие,Рутина,Частота'];

  state.pillars.forEach((p, pIdx) => {
    const actions = state.actions.filter((a) => a.pillarId === p.id);
    actions.forEach((act, aIdx) => {
      const cleanPillar = `"${p.title.replace(/"/g, '""')}"`;
      const cleanAct = `"${act.text.replace(/"/g, '""')}"`;
      const isRoutine = act.isRoutine ? 'Да' : 'Нет';
      const freq = act.isRoutine ? act.frequency : '';
      rows.push(`${cleanPillar},${pIdx + 1}.${aIdx + 1},${cleanAct},${isRoutine},${freq}`);
    });
  });

  const csvContent = '\uFEFF' + rows.join('\n'); // add BOM for Excel Cyrillic support
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportHaradaJson(state: HaradaState, filename = 'harada-backup.json'): void {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
