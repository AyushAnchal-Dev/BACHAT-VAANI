'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { useTranslation } from './LanguageProvider';

export function StreakFlame({ days }: { days: number }) {
  const { t } = useTranslation();
  const active = days > 0;
  
  return (
    <div className={`flex items-center gap-4 p-5 rounded-xl border transition-all ${
      active 
        ? 'border-accent/30 bg-accent/5' 
        : 'border-border bg-card'
    }`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
        active 
          ? 'bg-accent/10 text-accent' 
          : 'bg-secondary text-muted-foreground'
      }`}>
        <Flame size={24} className={active ? 'fill-accent/20' : ''} />
      </div>
      <div>
        <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          {t('rewards.streakTitle') || 'Current Streak'}
        </div>
        <div className={`text-2xl font-extrabold mt-0.5 ${active ? 'text-accent' : 'text-muted-foreground'}`}>
          {days} {days === 1 ? 'Day' : 'Days'}
        </div>
      </div>
    </div>
  );
}
