import { HaradaState } from '../types/harada.ts';

// Helper to wrap text into multiple lines on canvas
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 4
): string[] {
  if (!text) return [''];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) {
        break;
      }
    }
  }
  lines.push(currentLine);
  return lines;
}

// 8 surrounding relative offsets around a center cell in a 3x3 block:
// [0,0]=top-left, [1,0]=top, [2,0]=top-right, [0,1]=left, [2,1]=right, [0,2]=bottom-left, [1,2]=bottom, [2,2]=bottom-right
const SURROUNDING_OFFSETS: [number, number][] = [
  [0, 0], // 1: top-left
  [1, 0], // 2: top
  [2, 0], // 3: top-right
  [2, 1], // 4: right
  [2, 2], // 5: bottom-right
  [1, 2], // 6: bottom
  [0, 2], // 7: bottom-left
  [0, 1], // 8: left
];

// Block positions for the 8 outer blocks around center block (1,1) in a 3x3 supergrid:
const BLOCK_OFFSETS: [number, number][] = [
  [0, 0], // Pillar 1: top-left block
  [1, 0], // Pillar 2: top block
  [2, 0], // Pillar 3: top-right block
  [2, 1], // Pillar 4: right block
  [2, 2], // Pillar 5: bottom-right block
  [1, 2], // Pillar 6: bottom block
  [0, 2], // Pillar 7: bottom-left block
  [0, 1], // Pillar 8: left block
];

export function renderHaradaToCanvas(state: HaradaState, width = 2480, height = 1754): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  // Background
  ctx.fillStyle = '#f8fafc'; // light slate
  ctx.fillRect(0, 0, width, height);

  // Top header banner
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, 140);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 140, width, 2);

  // Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('КВАДРАТ ХАРАДА — МАТРИЦА ЦЕЛЕЙ И ДЕЙСТВИЙ 8×8', 60, 60);

  // Goal & Deadline subtitle
  ctx.fillStyle = '#475569';
  ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
  const goalText = `Цель: ${state.goal.title || 'Не указана'}`;
  ctx.fillText(goalText.slice(0, 110) + (goalText.length > 110 ? '...' : ''), 60, 105);

  const dateText = `Срок: ${state.goal.targetDate || '—'}  |  Рутин: ${state.actions.filter((a) => a.isRoutine).length}/64`;
  ctx.textAlign = 'right';
  ctx.fillText(dateText, width - 60, 105);

  // Mandala grid coordinates
  const marginX = 60;
  const marginTop = 170;
  const gridW = width - marginX * 2;
  const gridH = height - marginTop - 50;
  const cellSize = Math.min(gridW / 9, gridH / 9);

  const startX = marginX + (gridW - cellSize * 9) / 2;
  const startY = marginTop + (gridH - cellSize * 9) / 2;

  // Render 9 superblocks (each 3x3 cells)
  for (let superRow = 0; superRow < 3; superRow++) {
    for (let superCol = 0; superCol < 3; superCol++) {
      const isCenterBlock = superRow === 1 && superCol === 1;
      const bX = startX + superCol * cellSize * 3;
      const bY = startY + superRow * cellSize * 3;

      // Draw superblock outer border
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.strokeRect(bX, bY, cellSize * 3, cellSize * 3);

      if (isCenterBlock) {
        // Center block: Center is Goal, 8 surrounding cells are the 8 Pillars
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const cX = bX + c * cellSize;
            const cY = bY + r * cellSize;

            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1;
            ctx.strokeRect(cX, cY, cellSize, cellSize);

            if (r === 1 && c === 1) {
              // Main Goal Center Cell
              ctx.fillStyle = '#fef3c7'; // warm amber background
              ctx.fillRect(cX + 1, cY + 1, cellSize - 2, cellSize - 2);

              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 3;
              ctx.strokeRect(cX + 2, cY + 2, cellSize - 4, cellSize - 4);

              ctx.fillStyle = '#b45309';
              ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('ГЛАВНАЯ ЦЕЛЬ', cX + cellSize / 2, cY + 30);

              ctx.fillStyle = '#1e293b';
              ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
              const lines = wrapText(ctx, state.goal.title || 'Цель не задана', cellSize - 24, 5);
              const startTextY = cY + (cellSize - lines.length * 22) / 2 + 16;
              lines.forEach((line, lIdx) => {
                ctx.fillText(line, cX + cellSize / 2, startTextY + lIdx * 22);
              });
            } else {
              // One of the 8 Pillars in center block
              const pIndex = SURROUNDING_OFFSETS.findIndex(([oc, or]) => oc === c && or === r);
              const pillar = state.pillars[pIndex];

              ctx.fillStyle = '#e0e7ff'; // light indigo background
              ctx.fillRect(cX + 1, cY + 1, cellSize - 2, cellSize - 2);

              ctx.fillStyle = '#4338ca';
              ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(`ОПОРА ${pIndex + 1}`, cX + cellSize / 2, cY + 25);

              ctx.fillStyle = '#1e1b4b';
              ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
              const pTitle = pillar ? pillar.title : `Опора ${pIndex + 1}`;
              const lines = wrapText(ctx, pTitle, cellSize - 20, 4);
              const startTextY = cY + (cellSize - lines.length * 20) / 2 + 14;
              lines.forEach((line, lIdx) => {
                ctx.fillText(line, cX + cellSize / 2, startTextY + lIdx * 20);
              });
            }
          }
        }
      } else {
        // Outer superblock: corresponds to one pillar
        const pIndex = BLOCK_OFFSETS.findIndex(([oc, or]) => oc === superCol && or === superRow);
        const pillar = state.pillars[pIndex];
        const pillarActions = state.actions.filter((a) => a.pillarId === pillar?.id);

        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const cX = bX + c * cellSize;
            const cY = bY + r * cellSize;

            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1;
            ctx.strokeRect(cX, cY, cellSize, cellSize);

            if (r === 1 && c === 1) {
              // Center of outer block is the Pillar Header
              ctx.fillStyle = '#ede9fe'; // violet tint
              ctx.fillRect(cX + 1, cY + 1, cellSize - 2, cellSize - 2);

              ctx.fillStyle = '#6d28d9';
              ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(`ОПОРА ${pIndex + 1}`, cX + cellSize / 2, cY + 25);

              ctx.fillStyle = '#1e1b4b';
              ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
              const pTitle = pillar ? pillar.title : `Опора ${pIndex + 1}`;
              const lines = wrapText(ctx, pTitle, cellSize - 20, 4);
              const startTextY = cY + (cellSize - lines.length * 20) / 2 + 14;
              lines.forEach((line, lIdx) => {
                ctx.fillText(line, cX + cellSize / 2, startTextY + lIdx * 20);
              });
            } else {
              // One of 8 Actions for this pillar
              const aIndex = SURROUNDING_OFFSETS.findIndex(([oc, or]) => oc === c && or === r);
              const action = pillarActions[aIndex];

              const isRoutine = action?.isRoutine;
              ctx.fillStyle = isRoutine ? '#f0fdf4' : '#ffffff'; // soft emerald tint for routines
              ctx.fillRect(cX + 1, cY + 1, cellSize - 2, cellSize - 2);

              // Action badge / number
              ctx.fillStyle = isRoutine ? '#166534' : '#64748b';
              ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
              ctx.textAlign = 'left';
              const label = `${pIndex + 1}.${aIndex + 1}${isRoutine ? ' ★ РУТИНА' : ''}`;
              ctx.fillText(label, cX + 10, cY + 22);

              // Action text
              ctx.fillStyle = '#334155';
              ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
              ctx.textAlign = 'center';
              const aText = action ? action.text : '';
              const lines = wrapText(ctx, aText || '—', cellSize - 18, 5);
              const startTextY = cY + (cellSize - lines.length * 17) / 2 + 14;
              lines.forEach((line, lIdx) => {
                ctx.fillText(line, cX + cellSize / 2, startTextY + lIdx * 17);
              });
            }
          }
        }
      }
    }
  }

  return canvas;
}

export async function downloadHaradaPng(state: HaradaState, filename = 'harada-mandala.png'): Promise<void> {
  const canvas = renderHaradaToCanvas(state);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Failed to create PNG blob');

  // Check if Web Share API with file support is available
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'image/png' })] })) {
    try {
      const file = new File([blob], filename, { type: 'image/png' });
      await navigator.share({
        title: 'Квадрат Харада',
        text: `Квадрат Харада для цели: ${state.goal.title}`,
        files: [file],
      });
      return;
    } catch (e) {
      console.log('Share canceled or failed, falling back to download', e);
    }
  }

  // Fallback download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
