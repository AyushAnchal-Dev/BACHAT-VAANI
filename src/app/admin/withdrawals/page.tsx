'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

export default function AdminWithdrawals() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: withdrawData, isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => {
      const res = await fetch('/api/admin/withdrawals');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const processMutation = useMutation({
    mutationFn: async (payload: { withdrawalId: string; action: 'APPROVE' | 'REJECT' }) => {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process request');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
    onError: (err: any) => {
      setError(err.message || 'Operation failed');
    },
  });

  const handleAction = (withdrawalId: string, action: 'APPROVE' | 'REJECT') => {
    setError(null);
    processMutation.mutate({ withdrawalId, action });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-sm font-semibold animate-pulse text-blue-600">Loading withdrawals...</div>
      </div>
    );
  }

  const withdrawals = withdrawData?.withdrawals || [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
          <Clock size={20} />
          Review Withdrawal Requests
        </h3>
        <p className="text-xs text-muted-foreground">Approve or reject micro-savings withdrawals requested by enrolled daily wage workers.</p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2 max-w-md animate-pulse">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Requests table */}
      <div className="glass-premium rounded-3xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                <th className="p-4">Worker Info</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Requested On</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length > 0 ? (
                withdrawals.map((w: any) => (
                  <tr key={w.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                    <td className="p-4 font-bold">{w.user?.name}</td>
                    <td className="p-4 text-muted-foreground">{w.user?.phone}</td>
                    <td className="p-4 font-extrabold text-foreground">₹{w.amount}</td>
                    <td className="p-4 text-muted-foreground">{new Date(w.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold tracking-wider ${
                        w.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : w.status === 'PENDING'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-2">
                      {w.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleAction(w.id, 'APPROVE')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                            title="Approve Withdrawal"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(w.id, 'REJECT')}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                            title="Reject Withdrawal"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground italic">No withdrawal requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
