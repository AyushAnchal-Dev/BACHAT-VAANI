'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/components/LanguageProvider';
import { Compass, Plus, Calendar, Clock, Landmark } from 'lucide-react';

export default function GoalsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const goalPresets = [
    { label: 'Emergency Fund', value: 'Emergency Fund' },
    { label: 'School Fees', value: 'School Fees' },
    { label: 'Medical Fund', value: 'Medical Fund' },
    { label: 'Festival Savings', value: 'Festival Savings' },
  ];

  const { data: profileData } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await fetch('/api/goals');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { title: string; targetAmount: number; deadline: string }) => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create goal');
      return data;
    },
    onSuccess: () => {
      setSuccess(t('goals.success'));
      setTitle('');
      setTargetAmount('');
      setDeadline('');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create goal');
      setSuccess(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedTarget = Number(targetAmount);

    if (!title.trim()) {
      setError('Goal name is required.');
      return;
    }
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Please enter a valid positive target amount.');
      return;
    }
    if (!deadline) {
      setError('Please choose a target date.');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      targetAmount: parsedTarget,
      deadline: new Date(deadline).toISOString(),
    });
  };

  // Helper function to calculate estimated completion date
  const getEstimatedCompletion = (current: number, target: number, deadlineDate: string) => {
    const remaining = target - current;
    if (remaining <= 0) return 'Completed';

    const monthlySaved = profileData?.user?.monthlySaved || 0;
    const currentDay = new Date().getDate();
    const dailyRate = monthlySaved / currentDay;

    if (dailyRate > 0) {
      const daysToComplete = Math.ceil(remaining / dailyRate);
      const estDate = new Date();
      estDate.setDate(estDate.getDate() + daysToComplete);
      return estDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Fallback: show the original target date
    return new Date(deadlineDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-5xl mx-auto">
      
      {/* Create goal card */}
      <div className="md:col-span-5 fintech-card p-6 bg-card h-fit space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-blue-500 flex items-center gap-2">
            <Plus size={20} />
            {t('goals.create')}
          </h2>
          <p className="text-xs text-muted-foreground">Define what you are saving for (e.g. school fees, emergency fund).</p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-lg text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-accent/10 border border-accent/25 text-accent text-xs font-bold rounded-lg text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Name */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('goals.goalName')}</label>
            <input
              type="text"
              placeholder="e.g. Children's School Fees"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/20 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
            />

            {/* Quick preset examples */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {goalPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setTitle(preset.value)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                    title === preset.value
                      ? 'border-blue-600 bg-blue-600/5 text-blue-500'
                      : 'border-border bg-secondary/15 hover:bg-secondary/30 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('goals.target')}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground font-bold">₹</span>
              <input
                type="number"
                placeholder="5000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-secondary/20 border border-border rounded-lg text-sm font-bold text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('goals.deadline')}</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/20 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all shadow-sm mt-6"
          >
            {createMutation.isPending ? 'Creating...' : t('goals.create')}
          </button>
        </form>
      </div>

      {/* Goal list card */}
      <div className="md:col-span-7 fintech-card p-6 bg-card space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-blue-500 flex items-center gap-2">
            <Compass size={20} />
            {t('goals.title')}
          </h2>
          <p className="text-xs text-muted-foreground">Keep track of your active savings goals and see how close you are to completing them.</p>
        </div>

        {goalsLoading ? (
          <div className="text-xs text-muted-foreground text-center py-12 animate-pulse">Loading goals...</div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {goalsData?.goals && goalsData.goals.length > 0 ? (
              goalsData.goals.map((g: any) => {
                const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                const remaining = Math.max(0, g.targetAmount - g.currentAmount);
                const completed = remaining === 0;
                
                return (
                  <div key={g.id} className={`p-4 rounded-xl border ${
                    completed 
                      ? 'border-accent/20 bg-accent/5' 
                      : 'border-border bg-secondary/10'
                  } space-y-4 transition-all`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                          {g.title}
                          {completed && (
                            <span className="text-[9px] uppercase font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-full border border-accent/20">
                              Completed
                            </span>
                          )}
                        </h4>
                        <div className="flex flex-col gap-1 mt-2 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Target Date: {new Date(g.deadline).toLocaleDateString()}</span>
                          </div>
                          {!completed && (
                            <div className="flex items-center gap-1 text-blue-500">
                              <Clock size={12} />
                              <span>Est. Completion: {getEstimatedCompletion(g.currentAmount, g.targetAmount, g.deadline)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-extrabold text-sm text-foreground">₹{g.currentAmount}</div>
                        <div className="text-[10px] text-muted-foreground">of ₹{g.targetAmount}</div>
                        {!completed && (
                          <div className="text-[10px] font-bold text-accent">
                            Remaining: ₹{remaining.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden border border-border/10">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-accent' : 'bg-blue-600'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground font-bold">
                        <span>Progress</span>
                        <span>{percent}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-12">{t('goals.noGoals')}</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
