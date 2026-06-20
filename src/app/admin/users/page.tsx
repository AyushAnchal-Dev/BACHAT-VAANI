'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, KeyRound, Check, AlertCircle } from 'lucide-react';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [tempPin, setTempPin] = useState('1234');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (payload: { targetUserId: string; tempPin: string }) => {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset PIN');
      return data;
    },
    onSuccess: () => {
      setSuccess('PIN reset successfully!');
      setResettingUserId(null);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || 'Operation failed');
      setSuccess(null);
    },
  });

  const handleResetPin = (targetUserId: string) => {
    if (tempPin.length !== 4 || !/^\d+$/.test(tempPin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    setError(null);
    setSuccess(null);
    resetMutation.mutate({ targetUserId, tempPin });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-sm font-semibold animate-pulse text-blue-600">Loading user lists...</div>
      </div>
    );
  }

  const users = usersData?.users || [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
          <Users size={20} />
          Manage Enrolled Workers
        </h3>
        <p className="text-xs text-muted-foreground">List of all daily wage workers registered in the platform, along with quick actions to reset PINs.</p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2 max-w-md">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl flex items-center gap-2 max-w-md">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Users table */}
      <div className="glass-premium rounded-3xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Role</th>
                <th className="p-4">Preferred Language</th>
                <th className="p-4 text-center">Active Streak</th>
                <th className="p-4">Enrolled On</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u: any) => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                    <td className="p-4 font-bold">{u.name}</td>
                    <td className="p-4 text-muted-foreground">{u.phone}</td>
                    <td className="p-4">
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md font-bold ${
                        u.role === 'ADMIN' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-secondary text-muted-foreground'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground uppercase">{u.language}</td>
                    <td className="p-4 text-center font-bold text-blue-600">🔥 {u.streakDays} days</td>
                    <td className="p-4 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      {resettingUserId === u.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={tempPin}
                            onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ''))}
                            className="w-16 px-2 py-1 bg-secondary border border-border text-center rounded text-xs"
                          />
                          <button
                            onClick={() => handleResetPin(u.id)}
                            className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-slate-950"
                            title="Confirm PIN Reset"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setResettingUserId(null)}
                            className="p-1 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground"
                            title="Cancel Reset"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setResettingUserId(u.id); setTempPin('1234'); }}
                          className="px-3 py-1 bg-secondary hover:bg-secondary/70 border border-border rounded-lg text-[10px] font-semibold inline-flex items-center gap-1"
                        >
                          <KeyRound size={12} />
                          Reset PIN
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground italic">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
