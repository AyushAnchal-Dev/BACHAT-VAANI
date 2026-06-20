'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Landmark, Wallet, Eye } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminDashboard() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-sm font-semibold animate-pulse text-blue-600">Loading admin analytics...</div>
      </div>
    );
  }

  const metrics = analyticsData?.metrics || {};
  const charts = analyticsData?.charts || {};

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total enrolled users */}
        <div className="glass-premium p-5 rounded-2xl border border-border/50 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Enrolled Workers</div>
            <div className="text-2xl font-extrabold mt-0.5 text-foreground">{metrics.totalUsers}</div>
          </div>
        </div>

        {/* Pending withdrawals */}
        <Link href="/admin/withdrawals" className="glass-premium p-5 rounded-2xl border border-border/50 flex items-center justify-between hover:border-blue-600/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center shrink-0">
              <Landmark size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Pending Withdrawals</div>
              <div className="text-2xl font-extrabold mt-0.5 text-foreground">{metrics.pendingWithdrawalsCount}</div>
            </div>
          </div>
          <Eye size={18} className="text-muted-foreground" />
        </Link>

        {/* Total savings balance */}
        <div className="glass-premium p-5 rounded-2xl border border-border/50 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Active Cohort Wealth</div>
            <div className="text-2xl font-extrabold mt-0.5 text-foreground">₹{metrics.activeWagesSaved}</div>
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* User enrollment trends */}
        <div className="glass-premium p-6 rounded-3xl border border-border/50 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">Worker Enrollment Trend</h3>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="users" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform savings flow */}
        <div className="glass-premium p-6 rounded-3xl border border-border/50 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">Monthly Savings Flow (₹)</h3>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlySavings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="savings" stroke="#3b82f6" fillOpacity={0.15} fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
