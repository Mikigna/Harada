import React, { useState } from 'react';
import {
  X,
  FileText,
  Image as ImageIcon,
  Table,
  FileSpreadsheet,
  Share2,
  Download,
  CheckCircle2,
  Smartphone,
  HelpCircle,
} from 'lucide-react';
import { HaradaState } from '../../types/harada.ts';
import { downloadHaradaPng } from '../../utils/exportPng.ts';
import { downloadHaradaPdf } from '../../utils/exportPdf.ts';
import { exportHaradaXlsx, exportHaradaCsv, exportHaradaJson } from '../../utils/exportSpreadsheet.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: HaradaState;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, state }) => {
  const [loadingFormat, setLoadingFormat] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (format: 'pdf' | 'png' | 'xlsx' | 'csv' | 'json') => {
    try {
      setLoadingFormat(format);
      const cleanTitle = (state.goal.title || 'harada-square')
        .slice(0, 30)
        .replace(/[^a-zа-я0-9]/gi, '_');

      if (format === 'pdf') {
        await downloadHaradaPdf(state, `${cleanTitle}.pdf`);
      } else if (format === 'png') {
        await downloadHaradaPng(state, `${cleanTitle}.png`);
      } else if (format === 'xlsx') {
        exportHaradaXlsx(state, `${cleanTitle}.xlsx`);
      } else if (format === 'csv') {
        exportHaradaCsv(state, `${cleanTitle}.csv`);
      } else if (format === 'json') {
        exportHaradaJson(state, `${cleanTitle}.json`);
      }

      setSuccessMsg(`Файл ${format.toUpperCase()} успешно сформирован`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      console.error('Export error', e);
      alert('Ошибка при экспорте файла. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoadingFormat(null);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Квадрат Харада',
          text: `Мой квадрат целей Харада: ${state.goal.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share dismissed', err);
      }
    } else {
      handleExport('png');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Экспорт и отправка квадрата Харада
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть экспорт"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formats Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Файлы генерируются прямо на устройстве (клиентская генерация) и работают полностью офлайн.
          </p>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {/* PDF A4 */}
            <div
              onClick={() => handleExport('pdf')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-800/60 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-red-600">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> PDF (A4 Альбомный)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950 font-bold">
                    P0
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Для печати на стену
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Лист 1: Квадрат 8×8 с опорами. Лист 2: Лист рутин и чек-лист на неделю.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-3 flex items-center gap-1">
                {loadingFormat === 'pdf' ? 'Формирование...' : 'Скачать PDF →'}
              </span>
            </div>

            {/* PNG */}
            <div
              onClick={() => handleExport('png')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-800/60 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> PNG (2480×1754 px)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 font-bold">
                    P0
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Для Telegram и заставки
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Высокое разрешение, чёткий текст от 9 pt, поддержка меню «Поделиться».
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-3 flex items-center gap-1">
                {loadingFormat === 'png' ? 'Формирование...' : 'Скачать PNG →'}
              </span>
            </div>

            {/* XLSX */}
            <div
              onClick={() => handleExport('xlsx')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-800/60 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4" /> Excel (.XLSX)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 font-bold">
                    P1
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Книга из 3 листов
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Листы «Квадрат», «Рутины» и «Обзор PDCA».
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-3 flex items-center gap-1">
                {loadingFormat === 'xlsx' ? 'Формирование...' : 'Скачать XLSX →'}
              </span>
            </div>

            {/* CSV */}
            <div
              onClick={() => handleExport('csv')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-800/60 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Table className="w-4 h-4" /> Плоский CSV
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                    P1
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Для Notion и таблиц
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Опора, номер действия, текст, признак рутины.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-3 flex items-center gap-1">
                {loadingFormat === 'csv' ? 'Экспорт...' : 'Скачать CSV →'}
              </span>
            </div>
          </div>

          {/* JSON Backup Button */}
          <div className="pt-2">
            <button
              onClick={() => handleExport('json')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            >
              <span>Полная резервная копия квадрата и трекера (JSON)</span>
              <span className="text-indigo-600 dark:text-indigo-400">Выгрузить .json →</span>
            </button>
          </div>

          {/* iPhone Safari Guidance Note from Technical Specification */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Smartphone className="w-4 h-4 text-indigo-500" />
              <span>Где искать скачанный файл на iPhone:</span>
            </div>
            <p>
              В браузере Safari файл сохраняется в системную папку <strong>«Файлы» → «Загрузки»</strong>. Либо используйте стандартную кнопку <strong>«Поделиться»</strong> в Safari и выберите «Сохранить в Файлы» или отправьте напрямую в Telegram/WhatsApp.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
          >
            Закрыть
          </button>

          <button
            onClick={handleNativeShare}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Системное меню «Поделиться»</span>
          </button>
        </div>
      </div>
    </div>
  );
};
