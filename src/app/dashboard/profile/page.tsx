'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/components/LanguageProvider';
import { User, ShieldAlert, KeyRound, Globe } from 'lucide-react';

export default function ProfilePage() {
  const { t, language, setLanguage } = useTranslation();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const { data: logsData } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const res = await fetch('/api/audit-logs');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { name?: string; pin?: string }) => {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      return data;
    },
    onSuccess: () => {
      setSuccess('Profile updated successfully!');
      setPin('');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to update');
      setSuccess(null);
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload: any = {};
    if (name.trim() && name !== profileData?.user?.name) {
      payload.name = name.trim();
    }
    if (pin.trim()) {
      if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        setError(t('auth.errorPin'));
        return;
      }
      payload.pin = pin;
    }

    if (Object.keys(payload).length === 0) {
      setError('No changes made.');
      return;
    }

    updateMutation.mutate(payload);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm font-semibold animate-pulse text-blue-600">Loading profile...</div>
      </div>
    );
  }

  const currentUser = profileData?.user;
  const auditLogs = logsData?.logs || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      
      {/* Profile Settings Card */}
      <div className="md:col-span-1 glass-premium p-6 rounded-3xl border border-border/50 h-fit space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
            <User size={20} />
            Profile Settings
          </h2>
          <p className="text-xs text-muted-foreground">Manage your credentials, PIN, and preferences.</p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          
          {/* Name field */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('auth.name')}</label>
            <input
              type="text"
              placeholder={currentUser?.name || 'Enter name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-secondary/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-blue-600/50"
            />
          </div>

          {/* Phone (Read Only) */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('auth.phoneNumber')}</label>
            <input
              type="text"
              value={currentUser?.phone || ''}
              className="w-full px-4 py-2.5 bg-secondary/10 border border-border/30 rounded-xl text-sm text-muted-foreground cursor-not-allowed"
              disabled
            />
            <span className="text-[9px] text-muted-foreground">Phone number cannot be changed.</span>
          </div>

          {/* Change PIN */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Change 4-Digit PIN</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                <KeyRound size={16} />
              </span>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-xl text-sm tracking-widest focus:outline-none focus:border-blue-600/50"
              />
            </div>
          </div>

          {/* Preferred Language toggle */}
          <div className="space-y-1 pt-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('auth.language')}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  language === 'en'
                    ? 'bg-blue-600/10 border-blue-600/50 text-blue-600'
                    : 'border-border/50 bg-secondary/30 text-muted-foreground'
                }`}
              >
                <Globe size={14} />
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  language === 'hi'
                    ? 'bg-blue-600/10 border-blue-600/50 text-blue-600'
                    : 'border-border/50 bg-secondary/30 text-muted-foreground'
                }`}
              >
                <Globe size={14} />
                हिन्दी
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 mt-6"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Security Audit Trail */}
      <div className="md:col-span-2 glass-premium p-6 rounded-3xl border border-border/50 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
            <ShieldAlert size={20} />
            Security Audit Trail
          </h2>
          <p className="text-xs text-muted-foreground">A record of your recent security events, logins, and transaction actions.</p>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {auditLogs.length > 0 ? (
            auditLogs.map((log: any) => (
              <div key={log.id} className="p-3.5 glass rounded-xl text-xs flex justify-between items-start border border-border/30">
                <div className="space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      log.action === 'LOGIN' ? 'bg-emerald-500' : log.action === 'PIN_RESET' ? 'bg-blue-600' : 'bg-primary'
                    }`}></span>
                    {log.action}
                  </div>
                  <p className="text-muted-foreground text-[10px] leading-normal">{log.details}</p>
                </div>
                <div className="text-[10px] text-muted-foreground text-right shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-10">No audit logs found.</p>
          )}
        </div>
      </div>

    </div>
  );
}
