'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/components/LanguageProvider';
import { StreakFlame } from '@/components/StreakFlame';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Wallet, Calendar, ArrowUpRight, ArrowDownRight, Award, Compass, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { t, language } = useTranslation();

  const { data: profileData, refetch: refetchProfile, isLoading: profileLoading } = useQuery({
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

  const { data: transData } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('/api/savings');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await fetch('/api/goals');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  if (profileLoading) {
    return <LoadingScreen />;
  }

  const user = profileData?.user;
  const tip = tipData?.tip;
  const transactions = transData?.transactions?.slice(0, 5) || [];
  const activeGoal = goalsData?.goals?.[0];

  const activeGoalPercent = activeGoal ? Math.min(100, Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)) : 0;
  const activeGoalRemaining = activeGoal ? Math.max(0, activeGoal.targetAmount - activeGoal.currentAmount) : 0;
  const activeGoalCompleted = activeGoalRemaining === 0;

  const getEstimatedCompletion = (current: number, target: number, deadlineDate: string) => {
    const remaining = target - current;
    if (remaining <= 0) return 'Completed';

    const monthlySaved = user?.monthlySaved || 0;
    const currentDay = new Date().getDate();
    const dailyRate = monthlySaved / currentDay;

    if (dailyRate > 0) {
      const daysToComplete = Math.ceil(remaining / dailyRate);
      const estDate = new Date();
      estDate.setDate(estDate.getDate() + daysToComplete);
      return estDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    return new Date(deadlineDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const activeGoalEstCompletion = activeGoal ? getEstimatedCompletion(activeGoal.currentAmount, activeGoal.targetAmount, activeGoal.deadline) : '';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-foreground">
            {t('dashboard.welcome', { name: user?.name || '' })}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Cohort: Gopalpur A • Role: {user?.role}
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="px-4 py-2 border border-blue-600/30 bg-blue-600/5 text-blue-500 rounded-lg text-xs font-bold hover:bg-blue-600/10 transition-all"
          >
            Enter Admin Portal
          </Link>
        )}
      </div>

      {/* Grid overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Savings Card */}
        <div className="fintech-card p-6 bg-card flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('dashboard.totalSavings')}</div>
            <div className="text-3xl font-extrabold mt-0.5 text-foreground">₹{user?.currentBalance}</div>
          </div>
        </div>

        {/* Monthly Savings Card */}
        <div className="fintech-card p-6 bg-card flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('dashboard.thisMonthSavings')}</div>
            <div className="text-3xl font-extrabold mt-0.5 text-foreground">₹{user?.monthlySaved}</div>
          </div>
        </div>

        {/* Streak Days Flame */}
        <StreakFlame days={user?.streakDays || 0} />
      </div>

      {/* Main Section split layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left column: Voice Assistant and Active Goal */}
        <div className="md:col-span-4 space-y-6">
          <VoiceAssistant
            currentBalance={user?.currentBalance}
            dailyTip={tip}
            onSaveSuccess={refetchProfile}
          />

          {/* Active Goal */}
          <div className="fintech-card p-6 bg-card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-2">
              <Compass size={16} />
              {t('dashboard.savingsGoal')}
            </h3>

            {activeGoal ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">{activeGoal.title}</span>
                  <span className="text-muted-foreground">₹{activeGoal.currentAmount} / ₹{activeGoal.targetAmount}</span>
                </div>
                <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden border border-border/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${activeGoalCompleted ? 'bg-accent' : 'bg-blue-600'}`}
                    style={{ width: `${activeGoalPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-bold">
                  <span>Progress</span>
                  <span>{activeGoalPercent}%</span>
                </div>

                {!activeGoalCompleted && (
                  <div className="pt-2 border-t border-border/50 flex flex-col gap-1 text-[10px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Remaining Amount:</span>
                      <span className="font-bold text-accent">₹{activeGoalRemaining.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-blue-500">
                      <span>Est. Completion:</span>
                      <span className="font-bold">{activeGoalEstCompletion}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-muted-foreground">{t('goals.noGoals')}</p>
                <Link
                  href="/dashboard/goals"
                  className="inline-block px-4 py-2 border border-border bg-secondary/50 hover:bg-secondary text-xs font-bold rounded-lg transition-all"
                >
                  Create Goal
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Tip, Badges, Ledger */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Daily tip banner */}
          <div className="fintech-card p-6 bg-card relative overflow-hidden flex gap-4 items-start border-l-4 border-l-blue-600">
            <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              <Lightbulb size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500">{t('dashboard.tips')}</h4>
              <p className="text-xs leading-normal text-foreground">
                {language === 'hi' ? tip?.contentHi : tip?.contentEn}
              </p>
            </div>
          </div>

          {/* Badges unlocked */}
          <div className="fintech-card p-6 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-2">
                <Award size={16} />
                {t('rewards.badgesEarned')}
              </h3>
              <Link href="/dashboard/rewards" className="text-[10px] font-bold text-blue-500 hover:underline">
                View All →
              </Link>
            </div>

            {user?.rewards && user.rewards.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.rewards.map((r: any) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent/25 bg-accent/5 text-accent text-xs font-semibold"
                  >
                    <span className="badge-emoji-bounce">🏆</span>
                    <span>{t(`rewards.badges.${r.badge}`) || r.badge.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No badges unlocked yet. Keep saving to unlock rewards!</p>
            )}

            {/* Next badge progress */}
            {(() => {
              const allBadgeTypes = ['FIRST_SAVE', 'STREAK_7', 'STREAK_30', 'SAVE_1000', 'SAVE_5000'];
              const earned = (user?.rewards || []).map((r: any) => r.badge);
              const nextType = allBadgeTypes.find(b => !earned.includes(b));
              if (!nextType) return null;

              const emojis: Record<string, string> = { FIRST_SAVE: '🌱', STREAK_7: '🔥', STREAK_30: '👑', SAVE_1000: '💰', SAVE_5000: '🛡️' };
              const thresholds: Record<string, { val: number; type: 'streak' | 'amount' }> = {
                FIRST_SAVE: { val: 1, type: 'amount' }, STREAK_7: { val: 7, type: 'streak' },
                STREAK_30: { val: 30, type: 'streak' }, SAVE_1000: { val: 1000, type: 'amount' },
                SAVE_5000: { val: 5000, type: 'amount' },
              };
              const th = thresholds[nextType];
              const current = th.type === 'streak' ? (user?.streakDays || 0) : (user?.currentBalance || 0);
              const pct = Math.min(100, Math.round((current / th.val) * 100));

              return (
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg badge-next-pulse">{emojis[nextType]}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground">
                          Next: {t(`rewards.badges.${nextType}`)}
                        </span>
                        <span className="text-[9px] font-bold text-blue-500">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary/20 rounded-full overflow-hidden mt-1">
                        <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Ledger/Recent Activity */}
          <div className="fintech-card p-6 bg-card space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500">{t('dashboard.recentTransactions')}</h3>
              <Link href="/dashboard/savings" className="text-xs font-bold text-blue-500 hover:underline">
                View Ledger
              </Link>
            </div>

            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-secondary/15 text-xs hover:bg-secondary/25 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${tx.type === 'SAVE' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                        {tx.type === 'SAVE' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{tx.description || tx.type}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()} • {tx.status}</div>
                      </div>
                    </div>
                    <div className={`font-bold text-sm ${tx.type === 'SAVE' ? 'text-accent' : 'text-destructive'}`}>
                      {tx.type === 'SAVE' ? '+' : '-'}₹{tx.amount}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-6">No recent savings recorded.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
