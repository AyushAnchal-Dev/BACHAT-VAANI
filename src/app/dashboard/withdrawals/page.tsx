'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/components/LanguageProvider';
import { ArrowDownLeft, Landmark, RefreshCw } from 'lucide-react';

export default function WithdrawalsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: profileData } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const { data: withdrawData, isLoading: withdrawLoading } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const res = await fetch('/api/withdrawals');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (payload: { amount: number }) => {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
      return data;
    },
    onSuccess: (data) => {
      setSuccess(t('withdrawals.success', { amount: data.withdrawal.amount }));
      setAmount('');
      setError(null);
      
      // Invalidate queries to sync states
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || t('withdrawals.error'));
      setSuccess(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedAmount = Number(amount);
    const balance = profileData?.user?.currentBalance || 0;

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (parsedAmount > balance) {
      setError(t('withdrawals.insufficient'));
      return;
    }

    withdrawMutation.mutate({ amount: parsedAmount });
  };

  const balance = profileData?.user?.currentBalance || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-5xl mx-auto">
      
      {/* Request Withdrawal form card */}
      <div className="md:col-span-5 fintech-card p-6 bg-card h-fit space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-blue-500 flex items-center gap-2">
            <ArrowDownLeft size={20} />
            {t('withdrawals.title')}
          </h2>
          <p className="text-xs text-muted-foreground">Submit a request to withdraw your savings.</p>
        </div>

        {/* Current Available Balance widget */}
        <div className="p-4 rounded-xl border border-border bg-secondary/15 text-center">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Available Balance</span>
          <div className="text-3xl font-extrabold mt-1 text-foreground">₹{balance}</div>
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
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('withdrawals.amount')}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground font-bold">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-secondary/20 border border-border rounded-lg text-sm font-bold text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={withdrawMutation.isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all shadow-sm mt-6"
          >
            {withdrawMutation.isPending ? 'Submitting...' : t('withdrawals.request')}
          </button>
        </form>
      </div>

      {/* Withdrawal list history card */}
      <div className="md:col-span-7 fintech-card p-6 bg-card space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-blue-500 flex items-center gap-2">
            <Landmark size={20} />
            Withdrawal History
          </h2>
          <p className="text-xs text-muted-foreground">List of your recent withdrawal requests and their processing statuses.</p>
        </div>

        {withdrawLoading ? (
          <div className="text-xs text-muted-foreground text-center py-12 animate-pulse">Loading withdrawals...</div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {withdrawData?.withdrawals && withdrawData.withdrawals.length > 0 ? (
              withdrawData.withdrawals.map((w: any) => (
                <div key={w.id} className="flex justify-between items-center p-3.5 rounded-lg border border-border bg-secondary/10 hover:bg-secondary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg shrink-0 text-muted-foreground">
                      <RefreshCw size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Withdrawal Request</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(w.createdAt).toLocaleString()} • ID: {w.id.slice(-6).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    <div className="font-extrabold text-sm text-foreground">
                      ₹{w.amount}
                    </div>
                    <div className={`text-[9px] uppercase px-2.5 py-0.5 rounded-full inline-block font-bold tracking-wider ${
                      w.status === 'APPROVED'
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : w.status === 'PENDING'
                        ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20'
                        : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                      {w.status === 'APPROVED' ? t('withdrawals.approved') : w.status === 'PENDING' ? t('withdrawals.pending') : t('withdrawals.rejected')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-12">No withdrawal requests found.</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
