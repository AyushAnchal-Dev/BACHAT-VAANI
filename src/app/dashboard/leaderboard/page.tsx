'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/components/LanguageProvider';
import { Trophy, Star } from 'lucide-react';

export default function LeaderboardPage() {
  const { t } = useTranslation();

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  if (leaderboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm font-semibold animate-pulse text-blue-600">Loading Leaderboard...</div>
      </div>
    );
  }

  const leaderboard = leaderboardData?.leaderboard || [];
  const currentUserRank = leaderboard.find((u: any) => u.isCurrentUser);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl md:text-3.5xl font-extrabold text-blue-500 flex items-center justify-center gap-2">
          <Trophy size={28} />
          {t('leaderboard.title')}
        </h1>
        <p className="text-xs text-muted-foreground">Save consistently to climb rankings and inspire your neighbors.</p>
      </div>

      {/* Cohort Rank Summary Header */}
      {currentUserRank && (
        <div className="p-4 rounded-lg border border-blue-600/30 bg-blue-600/5 text-center flex items-center justify-center gap-2 font-bold text-blue-500 text-sm">
          <Star size={16} className="text-accent fill-accent/10" />
          <span>{t('leaderboard.groupRank', { rank: currentUserRank.rank })}</span>
        </div>
      )}

      {/* Leaderboard Table View */}
      <div className="fintech-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/20 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                <th className="p-4 w-16 text-center">{t('leaderboard.rank')}</th>
                <th className="p-4">Worker Name</th>
                <th className="p-4">Village Cohort</th>
                <th className="p-4 text-right">{t('leaderboard.savings')}</th>
                <th className="p-4 text-center">{t('leaderboard.streak')}</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item: any) => {
                const isUser = item.isCurrentUser;
                
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-border transition-all ${
                      isUser 
                        ? 'bg-blue-600/5 border-l-4 border-l-blue-600 font-semibold' 
                        : 'hover:bg-secondary/15'
                    }`}
                  >
                    <td className="p-4 text-center font-bold">
                      {item.rank === 1 ? (
                        <span className="inline-flex w-6 h-6 rounded-full bg-yellow-500/10 text-yellow-500 items-center justify-center text-xs font-bold border border-yellow-500/20">🥇</span>
                      ) : item.rank === 2 ? (
                        <span className="inline-flex w-6 h-6 rounded-full bg-slate-400/10 text-slate-300 items-center justify-center text-xs font-bold border border-slate-400/20">🥈</span>
                      ) : item.rank === 3 ? (
                        <span className="inline-flex w-6 h-6 rounded-full bg-amber-700/10 text-blue-500 items-center justify-center text-xs font-bold border border-amber-700/20">🥉</span>
                      ) : (
                        item.rank
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        {isUser && (
                          <span className="text-[9px] uppercase bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded">You</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4 text-muted-foreground">{item.village}</td>
                    
                    <td className="p-4 text-right font-extrabold text-foreground">₹{item.savings}</td>
                    
                    <td className="p-4 text-center font-bold text-accent">🔥 {item.streak} days</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
