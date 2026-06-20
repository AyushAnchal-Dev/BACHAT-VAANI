'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lightbulb, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

export default function AdminTips() {
  const queryClient = useQueryClient();

  const [contentEn, setContentEn] = useState('');
  const [contentHi, setContentHi] = useState('');
  const [category, setCategory] = useState('SAVINGS');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: tipsData, isLoading } = useQuery({
    queryKey: ['admin-tips'],
    queryFn: async () => {
      const res = await fetch('/api/admin/tips');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { contentEn: string; contentHi: string; category: string }) => {
      const res = await fetch('/api/admin/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create tip');
      return data;
    },
    onSuccess: () => {
      setSuccess('Daily tip created successfully!');
      setContentEn('');
      setContentHi('');
      setCategory('SAVINGS');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['admin-tips'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || 'Operation failed');
      setSuccess(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/tips?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete tip');
      return data;
    },
    onSuccess: () => {
      setSuccess('Tip deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-tips'] });
      setTimeout(() => setSuccess(null), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!contentEn.trim() || !contentHi.trim()) {
      setError('Both English and Hindi tip contents are required.');
      return;
    }

    createMutation.mutate({
      contentEn: contentEn.trim(),
      contentHi: contentHi.trim(),
      category,
    });
  };

  const handleCharLimit = (text: string, setter: (val: string) => void) => {
    if (text.length <= 150) {
      setter(text);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-sm font-semibold animate-pulse text-blue-600">Loading daily tips...</div>
      </div>
    );
  }

  const tips = tipsData?.tips || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      
      {/* Create Daily Tip card */}
      <div className="md:col-span-1 glass-premium p-6 rounded-3xl border border-border/50 h-fit space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
            <Plus size={20} />
            Publish Tip
          </h2>
          <p className="text-xs text-muted-foreground">Add a new daily financial tip in both English and Hindi languages.</p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2 animate-pulse">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl flex items-center gap-2">
            <Check size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* English Content */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">English Tip (Max 150 chars)</label>
            <textarea
              placeholder="e.g. Save at least 10% of your daily wage before spending."
              value={contentEn}
              onChange={(e) => handleCharLimit(e.target.value, setContentEn)}
              rows={3}
              className="w-full px-4 py-2 bg-secondary/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-blue-600/50"
              required
            />
            <span className="text-[9px] text-muted-foreground block text-right">{contentEn.length}/150</span>
          </div>

          {/* Hindi Content */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Hindi Tip (Max 150 chars)</label>
            <textarea
              placeholder="उदाहरण: गैर-जरूरी चीजों पर खर्च करने से पहले 10% बचाएं।"
              value={contentHi}
              onChange={(e) => handleCharLimit(e.target.value, setContentHi)}
              rows={3}
              className="w-full px-4 py-2 bg-secondary/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-blue-600/50"
              required
            />
            <span className="text-[9px] text-muted-foreground block text-right">{contentHi.length}/150</span>
          </div>

          {/* Category Select */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Tip Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-secondary/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-blue-600/50"
            >
              <option value="SAVINGS">Savings</option>
              <option value="BUDGETING">Budgeting</option>
              <option value="LOANS">Avoid Debt</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 mt-6"
          >
            {createMutation.isPending ? 'Publishing...' : 'Publish Tip'}
          </button>
        </form>
      </div>

      {/* Tips list gallery */}
      <div className="md:col-span-2 glass-premium p-6 rounded-3xl border border-border/50 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
            <Lightbulb size={20} />
            Published Tips
          </h2>
          <p className="text-xs text-muted-foreground">List of all financial literacy tips rotation list.</p>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {tips.length > 0 ? (
            tips.map((t: any) => (
              <div key={t.id} className="p-4 glass rounded-xl border border-border/30 flex justify-between items-start gap-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
                      {t.category}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      Published {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-foreground">EN: {t.contentEn}</div>
                    <div className="text-muted-foreground mt-1">HI: {t.contentHi}</div>
                  </div>
                </div>

                <button
                  onClick={() => { if (confirm('Are you sure you want to delete this tip?')) deleteMutation.mutate(t.id); }}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  title="Delete Tip"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-10">No daily tips found.</p>
          )}
        </div>
      </div>

    </div>
  );
}
