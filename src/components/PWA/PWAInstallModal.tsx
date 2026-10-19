import React from 'react';
import { X, Smartphone, Download, Share, PlusSquare, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Установка приложения на телефон
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть окно установки"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Приложение уже установлено!
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              «Квадрат Харада» работает в полноэкранном режиме с поддержкой работы без интернета.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Guide */
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              На iPhone и iPad приложение устанавливается через браузер <strong>Safari</strong>:
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    1. Нажмите «Поделиться»
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Иконка со стрелкой вверх в нижней панели браузера Safari.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    2. Выберите «На экран „Домой“»
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Прокрутите список действий вниз и нажмите «На экран «Домой» (Add to Home Screen).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    3. Нажмите «Добавить»
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Иконка приложения появится на домашнем экране и будет открываться без интерфейса браузера.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : isInstallable ? (
          /* Android / Chrome One-Tap Install */
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Установите «Квадрат Харада» как полноценное приложение: мгновенный доступ с домашнего экрана, быстрый запуск и работа офлайн.
            </p>

            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Установить приложение</span>
            </button>
          </div>
        ) : (
          /* Generic or already installed in browser */
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <p>
              Чтобы установить приложение, откройте меню браузера (три точки в углу экрана) и выберите пункт <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <span className="font-bold block text-slate-700 dark:text-slate-300">Преимущества PWA:</span>
              <p>• Работа без интернета в метро и поездках</p>
              <p>• Быстрый запуск в один тап</p>
              <p>• Не занимает много памяти</p>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
