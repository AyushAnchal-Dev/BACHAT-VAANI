'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/components/LanguageProvider';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { performOptimisticSaveUpdate, rollbackOptimisticSaveUpdate } from '@/lib/optimistic';

export default function SavingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const quickAmounts = [10, 20, 50, 100, 200, 500];

  const { data: transData, isLoading: transLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('/api/savings');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: { amount: number; description?: string }) => {
      const res = await fetch('/api/savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to deposit');
      return data;
    },
    onMutate: async (payload) => {
      // Clear toast states
      setError(null);
      setSuccess(null);

      // Perform optimistic query cache mutations
      const context = await performOptimisticSaveUpdate(queryClient, {
        amount: payload.amount,
        description: payload.description,
        timestamp: new Date().toISOString(),
      });

      return context;
    },
    onSuccess: (data) => {
      setSuccess(t('savings.success', { amount: data.transaction.amount }));
      setAmount('');
      setDescription('');
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any, payload, context) => {
      setError(err.message || t('savings.error'));
      setSuccess(null);

      // Rollback cache changes to snapshot values
      rollbackOptimisticSaveUpdate(queryClient, context);
    },
    onSettled: () => {
      // Reconcile and synchronize client cache with server DB
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports-analytics'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    saveMutation.mutate({ amount: parsedAmount, description: description.trim() || undefined });
  };

  const handleQuickSelect = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-5xl mx-auto">
      
      {/* Save Money input card */}
      <div className="md:col-span-5 fintech-card p-6 bg-card h-fit space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-blue-500 flex items-center gap-2">
            <Plus size={20} />
            {t('savings.title')}
          </h2>
          <p className="text-xs text-muted-foreground">Save some of your daily earnings securely.</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount input */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('savings.amount')}</label>
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

          {/* Quick selectors */}
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickSelect(val)}
                className="py-2 border border-border bg-secondary/15 hover:bg-secondary/40 text-xs font-bold rounded-lg transition-all"
              >
                +₹{val}
              </button>
            ))}
          </div>

          {/* Optional notes */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Tea shop earnings"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/20 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all shadow-sm mt-6"
          >
            {saveMutation.isPending ? 'Saving...' : t('savings.confirm')}
          </button>
        </form>
      </div>

      {/* Ledger list card */}
      <div className="md:col-span-7 fintech-card p-6 bg-card space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-blue-500 flex items-center gap-2">
            <Wallet size={20} />
            Savings Ledger
          </h2>
          <p className="text-xs text-muted-foreground">A complete audited record of all your micro-saving deposits and withdrawals.</p>
        </div>

        {transLoading ? (
          <div className="text-xs text-muted-foreground text-center py-12 animate-pulse">Loading ledger...</div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {transData?.transactions && transData.transactions.length > 0 ? (
              transData.transactions.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center p-3.5 rounded-lg border border-border bg-secondary/10 hover:bg-secondary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${tx.type === 'SAVE' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                      {tx.type === 'SAVE' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{tx.description || tx.type}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString()} • ID: {tx.id.slice(-6).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    <div className={`font-extrabold text-sm ${tx.type === 'SAVE' ? 'text-accent' : 'text-destructive'}`}>
                      {tx.type === 'SAVE' ? '+' : '-'}₹{tx.amount}
                    </div>
                    <div className={`text-[9px] uppercase px-2 py-0.5 rounded-full inline-block font-bold tracking-wider ${
                      tx.status === 'COMPLETED' || tx.status === 'APPROVED'
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : tx.status === 'PENDING'
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-12">No transactions recorded yet. Make your first deposit!</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
