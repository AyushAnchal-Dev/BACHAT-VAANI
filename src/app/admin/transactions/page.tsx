'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminTransactions() {
  const { data: transData, isLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      const res = await fetch('/api/admin/transactions');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-sm font-semibold animate-pulse text-blue-600">Loading transactions...</div>
      </div>
    );
  }

  const transactions = transData?.transactions || [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
          <Wallet size={20} />
          Global Transactions Ledger
        </h3>
        <p className="text-xs text-muted-foreground">A complete audited record of all deposits and withdrawal operations across all enrolled workers in the cohort.</p>
      </div>

      {/* Transactions table */}
      <div className="glass-premium rounded-3xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                <th className="p-4 w-12 text-center">Type</th>
                <th className="p-4">Worker Info</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Notes</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                    <td className="p-4 text-center font-bold">
                      <span className={`inline-flex p-1 rounded ${tx.type === 'SAVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {tx.type === 'SAVE' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{tx.user?.name}</td>
                    <td className="p-4 text-muted-foreground">{tx.user?.phone}</td>
                    <td className="p-4 text-muted-foreground italic">{tx.description}</td>
                    <td className={`p-4 font-extrabold text-sm ${tx.type === 'SAVE' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.type === 'SAVE' ? '+' : '-'}₹{tx.amount}
                    </td>
                    <td className="p-4 text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold tracking-wider ${
                        tx.status === 'COMPLETED' || tx.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : tx.status === 'PENDING'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground italic">No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
