'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/components/LanguageProvider';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Mic } from 'lucide-react';

export default function VoiceAssistantPage() {
  const { t } = useTranslation();

  const { data: profileData, refetch, isLoading: profileLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const { data: tipData } = useQuery({
    queryKey: ['tip'],
    queryFn: async () => {
      const res = await fetch('/api/tips');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const user = profileData?.user;
  const tip = tipData?.tip;

  if (profileLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blue-600 flex items-center justify-center gap-2">
          <Mic size={28} />
          {t('nav.voice')}
        </h1>
        <p className="text-xs text-muted-foreground">Talk to BachatVaani in English or Hindi to make deposits, read tips, or check your balance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: commands cheatsheet */}
        <div className="md:col-span-1 glass-premium p-6 rounded-3xl border border-border/50 space-y-4">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Example Commands</h3>
          
          <div className="space-y-3 text-xs leading-normal">
            <div className="p-3 bg-secondary/30 rounded-xl border border-border/30">
              <div className="font-semibold text-foreground">Save Wages</div>
              <p className="text-muted-foreground mt-1">"Save 50 rupees"</p>
              <p className="text-blue-600 font-medium mt-0.5">"50 rupaye bachat karo"</p>
            </div>
            
            <div className="p-3 bg-secondary/30 rounded-xl border border-border/30">
              <div className="font-semibold text-foreground">Check Balance</div>
              <p className="text-muted-foreground mt-1">"Show my balance"</p>
              <p className="text-blue-600 font-medium mt-0.5">"Mera balance batao"</p>
            </div>
            
            <div className="p-3 bg-secondary/30 rounded-xl border border-border/30">
              <div className="font-semibold text-foreground">Listen Daily Tip</div>
              <p className="text-muted-foreground mt-1">"Play financial tip"</p>
              <p className="text-blue-600 font-medium mt-0.5">"Aaj ki tip sunao"</p>
            </div>
          </div>
        </div>

        {/* Right column: VoiceAssistant component */}
        <div className="md:col-span-2">
          <VoiceAssistant
            currentBalance={user?.currentBalance}
            dailyTip={tip}
            onSaveSuccess={refetch}
          />
        </div>
      </div>
    </div>
  );
}
