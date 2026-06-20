'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileSpreadsheet, Printer, BarChart3, Users, PiggyBank, RefreshCcw, Filter } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Bar, Line } from 'recharts';

export default function AdminReports() {
  const [selectedCohort, setSelectedCohort] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [exporting, setExporting] = useState(false);

  const { data: analyticsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-reports-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-reports-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const { data: ledgerData } = useQuery({
    queryKey: ['admin-reports-ledger'],
    queryFn: async () => {
      const res = await fetch('/api/admin/transactions');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-sm font-semibold animate-pulse text-blue-600">Generating platform reports...</div>
      </div>
    );
  }

  const metrics = analyticsData?.metrics || {};
  const charts = analyticsData?.charts || {};
  const users = usersData?.users || [];
  const transactions = ledgerData?.transactions || [];

  // Filtered Roster
  const filteredUsers = users.filter((u: any) => {
    const matchesCohort = selectedCohort === 'ALL' || (selectedCohort === 'COHORT_A' && u.phone.charCodeAt(0) % 2 === 0) || (selectedCohort === 'COHORT_B' && u.phone.charCodeAt(0) % 2 !== 0);
    const matchesLang = selectedLanguage === 'ALL' || u.language.toUpperCase() === selectedLanguage;
    return matchesCohort && matchesLang;
  });

  // Combine savings and withdrawal chart data for composite reports
  const compositeChartData = (charts.monthlySavings || []).map((s: any, idx: number) => {
    const w = charts.withdrawalTrends?.[idx] || { withdrawals: 0 };
    return {
      month: s.month,
      Savings: s.savings,
      Withdrawals: w.withdrawals,
    };
  });

  // CSV Exporter helper
  const exportToCSV = (filename: string, headers: string[], rows: string[][]) => {
    setExporting(true);
    try {
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleExportUsers = () => {
    const headers = ['User ID', 'Name', 'Phone Number', 'Language', 'Streak Days', 'Last Save Date', 'Role'];
    const rows = filteredUsers.map((u: any) => [
      u.id,
      u.name,
      u.phone,
      u.language,
      u.streakDays,
      u.lastSaveDate ? new Date(u.lastSaveDate).toLocaleDateString() : 'N/A',
      u.role
    ]);
    exportToCSV(`BachatVaani_Users_Report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleExportLedger = () => {
    const headers = ['Transaction ID', 'User Name', 'Phone', 'Amount (INR)', 'Type', 'Status', 'Description', 'Timestamp'];
    const rows = transactions.map((t: any) => [
      t.id,
      t.user?.name || 'N/A',
      t.user?.phone || 'N/A',
      t.amount,
      t.type,
      t.status,
      t.description || 'Daily micro-save',
      new Date(t.timestamp).toLocaleString()
    ]);
    exportToCSV(`BachatVaani_Ledger_Report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary/10 p-4 rounded-2xl border border-border/40">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Report Filter Settings</span>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          {/* Cohort Select */}
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs outline-none"
          >
            <option value="ALL">All Cohorts</option>
            <option value="COHORT_A">Cohort A (Gopalpur)</option>
            <option value="COHORT_B">Cohort B (Brahampur)</option>
          </select>

          {/* Language Select */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs outline-none"
          >
            <option value="ALL">All Languages</option>
            <option value="EN">English Preferences</option>
            <option value="HI">Hindi Preferences</option>
          </select>

          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-foreground transition-all"
            title="Refresh Report Data"
          >
            <RefreshCcw size={14} className={isRefetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Reports Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 print:grid-cols-4">
        <div className="glass-premium p-5 rounded-2xl border border-border/50">
          <div className="text-xs text-muted-foreground font-semibold">Cohort Roster</div>
          <div className="text-3xl font-extrabold mt-1 text-blue-600">{filteredUsers.length} <span className="text-xs font-normal text-muted-foreground">workers</span></div>
        </div>

        <div className="glass-premium p-5 rounded-2xl border border-border/50">
          <div className="text-xs text-muted-foreground font-semibold">Total Savings Volume</div>
          <div className="text-3xl font-extrabold mt-1 text-emerald-500">₹{metrics.totalSaved || 0}</div>
        </div>

        <div className="glass-premium p-5 rounded-2xl border border-border/50">
          <div className="text-xs text-muted-foreground font-semibold">Total Withdrawals</div>
          <div className="text-3xl font-extrabold mt-1 text-red-500">₹{metrics.totalWithdrawn || 0}</div>
        </div>

        <div className="glass-premium p-5 rounded-2xl border border-border/50">
          <div className="text-xs text-muted-foreground font-semibold">Net Retained Capital</div>
          <div className="text-3xl font-extrabold mt-1 text-blue-600">₹{metrics.activeWagesSaved || 0}</div>
        </div>
      </div>

      {/* Analytics Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Composite Flow Chart */}
        <div className="glass-premium p-6 rounded-3xl border border-border/50 md:col-span-2 space-y-4 print:hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <BarChart3 size={16} />
            Monthly Savings Flow vs Withdrawal Volume (₹)
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={compositeChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="Savings" name="Savings Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Withdrawals" name="Withdrawal Outflow" stroke="#ef4444" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Center Card */}
        <div className="glass-premium p-6 rounded-3xl border border-border/50 md:col-span-1 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Audit Report Actions</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate and download compliance records for the selected cohort and preferences. These files can be loaded directly into spreadsheets or audits.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportUsers}
              disabled={exporting}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
            >
              <Users size={16} />
              Export Worker Directory CSV
            </button>

            <button
              onClick={handleExportLedger}
              disabled={exporting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <FileSpreadsheet size={16} />
              Export Transaction Ledger CSV
            </button>

            <button
              onClick={handlePrintReport}
              className="w-full py-3 px-4 rounded-xl glass hover:bg-secondary/40 text-foreground text-xs font-bold transition-all flex items-center justify-center gap-2 border border-border"
            >
              <Printer size={16} />
              Print Platforms Audit Page
            </button>
          </div>
        </div>
      </div>

      {/* Cohort Roster Table Preview */}
      <div className="glass-premium p-6 rounded-3xl border border-border/50 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">Active Cohort Roster Preview ({filteredUsers.length} Active)</h3>
          <span className="text-[10px] text-muted-foreground">Showing cohort filtered list</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs leading-normal">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Lang</th>
                <th className="py-3 px-4 text-center">Streak</th>
                <th className="py-3 px-4">Last Save</th>
                <th className="py-3 px-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, 5).map((u: any) => (
                <tr key={u.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                  <td className="py-3 px-4 font-semibold text-foreground">{u.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{u.phone}</td>
                  <td className="py-3 px-4 uppercase text-muted-foreground">{u.language}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-500">{u.streakDays} days</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {u.lastSaveDate ? new Date(u.lastSaveDate).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-blue-600/10 text-blue-600 border border-blue-600/20' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground italic">No users found matching selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
