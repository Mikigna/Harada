import jsPDF from 'jspdf';
import { HaradaState } from '../types/harada.ts';
import { renderHaradaToCanvas } from './exportPng.ts';

export async function downloadHaradaPdf(state: HaradaState, filename = 'harada-square.pdf'): Promise<void> {
  // A4 Landscape dimensions in mm: 297 x 210
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Render Page 1: 8x8 Harada Mandala Grid from canvas to guarantee 100% flawless Cyrillic rendering
  const canvas = renderHaradaToCanvas(state, 2480, 1754);
  const imgData = canvas.toDataURL('image/png', 0.95);

  // Fit image into 297x210 mm page with 5mm margin
  pdf.addImage(imgData, 'PNG', 5, 5, 287, 200, undefined, 'FAST');

  // Page 2: Detailed Routines Checklist & Weekly Tracking Sheet
  pdf.addPage('a4', 'landscape');

  // We can render Page 2 onto a clean canvas as well to guarantee perfect Cyrillic rendering across all devices!
  const page2Canvas = document.createElement('canvas');
  page2Canvas.width = 2480;
  page2Canvas.height = 1754;
  const ctx = page2Canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 2480, 1754);

    // Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ЛИСТ РУТИН И ЕЖЕДНЕВНЫЙ ТРЕКЕР УСПЕХА', 60, 70);

    ctx.fillStyle = '#475569';
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Цель: ${state.goal.title}`, 60, 115);
    ctx.fillText(`Срок: ${state.goal.targetDate || '—'}  |  Метод: Харада 8×8 (Harada Target Chart)`, 60, 150);

    // Divider
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(60, 180, 2360, 3);

    // Table Header
    const tableTop = 220;
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(60, tableTop, 2360, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('№', 80, tableTop + 32);
    ctx.fillText('Опора Харада', 140, tableTop + 32);
    ctx.fillText('Рутина / Привычка (действие)', 560, tableTop + 32);
    ctx.fillText('Частота', 1560, tableTop + 32);
    ctx.textAlign = 'center';
    ctx.fillText('Пн', 1820, tableTop + 32);
    ctx.fillText('Вт', 1900, tableTop + 32);
    ctx.fillText('Ср', 1980, tableTop + 32);
    ctx.fillText('Чт', 2060, tableTop + 32);
    ctx.fillText('Пт', 2140, tableTop + 32);
    ctx.fillText('Сб', 2220, tableTop + 32);
    ctx.fillText('Вс', 2300, tableTop + 32);

    // Routines rows
    const routineActions = state.actions.filter((a) => a.isRoutine);
    let rowY = tableTop + 50;

    routineActions.forEach((act, idx) => {
      const pillar = state.pillars.find((p) => p.id === act.pillarId);
      const isEven = idx % 2 === 0;

      ctx.fillStyle = isEven ? '#f8fafc' : '#ffffff';
      ctx.fillRect(60, rowY, 2360, 60);

      // Border bottom
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(60, rowY + 60, 2360, 1);

      ctx.fillStyle = '#1e293b';
      ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(String(idx + 1), 80, rowY + 37);

      ctx.fillStyle = '#4338ca';
      ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(pillar ? pillar.title : '—', 140, rowY + 37);

      ctx.fillStyle = '#0f172a';
      ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
      const truncatedText = act.text.length > 70 ? act.text.slice(0, 67) + '...' : act.text;
      ctx.fillText(truncatedText, 560, rowY + 37);

      ctx.fillStyle = '#64748b';
      ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
      const freqLabel =
        act.frequency === 'daily'
          ? 'Ежедневно'
          : act.frequency === 'weekly_4'
          ? '4 раза в неделю'
          : act.frequency === 'weekly_3'
          ? '3 раза в неделю'
          : act.frequency === 'weekly_2'
          ? '2 раза в неделю'
          : '1 раз в неделю';
      ctx.fillText(freqLabel, 1560, rowY + 37);

      // Checkboxes for Monday to Sunday
      const daysX = [1820, 1900, 1980, 2060, 2140, 2220, 2300];
      daysX.forEach((dx) => {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(dx - 14, rowY + 16, 28, 28);
      });

      rowY += 61;
    });

    // PDCA rules box at the bottom
    const pdcaY = Math.max(rowY + 40, 1420);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(60, pdcaY, 2360, 220);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, pdcaY, 2360, 220);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ПРАВИЛА И ЦИКЛ PDCA (PLAN - DO - CHECK - ACT):', 90, pdcaY + 45);

    ctx.fillStyle = '#475569';
    ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('1. Серии с прощением: пропуск одного дня в неделю не обнуляет серию — восстанавливайте темп на следующий день.', 90, pdcaY + 85);
    ctx.fillText('2. Мягкая балансировка: если опора выполнена менее чем на 30% за 2 недели, снизьте нагрузку и скорректируйте объём.', 90, pdcaY + 125);
    ctx.fillText('3. Недельный обзор: каждое воскресенье фиксируйте 3 пункта — что получилось, что помешало и что изменить в рутинах.', 90, pdcaY + 165);

    const page2Img = page2Canvas.toDataURL('image/png', 0.95);
    pdf.addImage(page2Img, 'PNG', 5, 5, 287, 200, undefined, 'FAST');
  }

  // Generate output blob
  const pdfBlob = pdf.output('blob');

  // Try Web Share API with file support first
  if (navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], filename, { type: 'application/pdf' })] })) {
    try {
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      await navigator.share({
        title: 'Квадрат Харада (PDF)',
        text: `Квадрат Харада и трекер рутин для цели: ${state.goal.title}`,
        files: [file],
      });
      return;
    } catch (e) {
      console.log('PDF share cancelled or failed, falling back to download', e);
    }
  }

  // Fallback direct download
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
