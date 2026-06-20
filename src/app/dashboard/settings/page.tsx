'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/components/LanguageProvider';
import { Settings, Bell, Mic, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { t } = useTranslation();
  
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [biometricMock, setBiometricMock] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-blue-600 flex items-center gap-2">
          <Settings size={24} />
          {t('nav.settings')}
        </h1>
        <p className="text-xs text-muted-foreground">Manage your notifications, accessibility preferences, and security settings.</p>
      </div>

      <div className="glass-premium p-6 rounded-3xl border border-border/50 space-y-6">
        
        {/* SMS alerts */}
        <div className="flex items-center justify-between p-4 glass rounded-2xl">
          <div className="flex gap-3 items-start">
            <Bell size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-foreground">SMS Alerts</h3>
              <p className="text-[10px] text-muted-foreground leading-normal">Receive immediate transaction and confirmation details via text messages.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={smsAlerts}
            onChange={(e) => setSmsAlerts(e.target.checked)}
            className="w-10 h-5 bg-secondary rounded-full appearance-none cursor-pointer checked:bg-blue-600 relative transition-all before:content-[''] before:absolute before:h-4 before:w-4 before:bg-slate-900 before:rounded-full before:top-0.5 before:left-0.5 checked:before:left-5 before:transition-all border border-border/50"
          />
        </div>

        {/* Speech feedback */}
        <div className="flex items-center justify-between p-4 glass rounded-2xl">
          <div className="flex gap-3 items-start">
            <Mic size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-foreground">Speech Feedback (TTS)</h3>
              <p className="text-[10px] text-muted-foreground leading-normal">Read out savings balances, deposit confirmations, and tips using text-to-speech voice assistant.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={voiceFeedback}
            onChange={(e) => setVoiceFeedback(e.target.checked)}
            className="w-10 h-5 bg-secondary rounded-full appearance-none cursor-pointer checked:bg-blue-600 relative transition-all before:content-[''] before:absolute before:h-4 before:w-4 before:bg-slate-950 before:rounded-full before:top-0.5 before:left-0.5 checked:before:left-5 before:transition-all border border-border/50"
          />
        </div>

        {/* Biometrics */}
        <div className="flex items-center justify-between p-4 glass rounded-2xl">
          <div className="flex gap-3 items-start">
            <ShieldAlert size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-foreground">Biometric Login</h3>
              <p className="text-[10px] text-muted-foreground leading-normal">Enable fingerprints or face unlock instead of typing 4-digit PIN (if supported by device).</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={biometricMock}
            onChange={(e) => setBiometricMock(e.target.checked)}
            className="w-10 h-5 bg-secondary rounded-full appearance-none cursor-pointer checked:bg-blue-600 relative transition-all before:content-[''] before:absolute before:h-4 before:w-4 before:bg-slate-950 before:rounded-full before:top-0.5 before:left-0.5 checked:before:left-5 before:transition-all border border-border/50"
          />
        </div>

        <div className="border-t border-border/50 pt-4 text-center">
          <Link
            href="/dashboard/profile"
            className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Manage User Profile & PIN Settings
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
