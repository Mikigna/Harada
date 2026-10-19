import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.ts';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shrink-0">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Офлайн-режим — данные сохраняются локально на вашем устройстве</span>
    </div>
  );
};
