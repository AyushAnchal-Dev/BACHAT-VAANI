'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/components/LanguageProvider';
import { Award, Lock, Flame, TrendingUp, Target, Sparkles, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';

// ---------- Badge Config ----------
interface BadgeConfig {
  type: string;
  emoji: string;
  threshold: number;
  thresholdType: 'streak' | 'amount';
  color: string;
  bgColor: string;
  glowColor: string;
}

const ALL_BADGES: BadgeConfig[] = [
  { type: 'FIRST_SAVE', emoji: '🌱', threshold: 1, thresholdType: 'amount', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', glowColor: 'shadow-emerald-500/20' },
  { type: 'STREAK_7', emoji: '🔥', threshold: 7, thresholdType: 'streak', color: 'text-orange-500', bgColor: 'bg-orange-500/10', glowColor: 'shadow-orange-500/20' },
  { type: 'STREAK_30', emoji: '👑', threshold: 30, thresholdType: 'streak', color: 'text-amber-500', bgColor: 'bg-amber-500/10', glowColor: 'shadow-amber-500/20' },
  { type: 'SAVE_1000', emoji: '💰', threshold: 1000, thresholdType: 'amount', color: 'text-blue-500', bgColor: 'bg-blue-500/10', glowColor: 'shadow-blue-500/20' },
  { type: 'SAVE_5000', emoji: '🛡️', threshold: 5000, thresholdType: 'amount', color: 'text-purple-500', bgColor: 'bg-purple-500/10', glowColor: 'shadow-purple-500/20' },
];

export default function RewardsPage() {
  const { t, language } = useTranslation();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="fintech-card p-6 w-64 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary/30" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-secondary/30 rounded w-3/4" />
                  <div className="h-2 bg-secondary/20 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const user = profileData?.user;
  const streak = user?.streakDays || 0;
  const totalSaved = user?.currentBalance || 0;
  const unlockedBadges = user?.rewards || [];
  const unlockedTypes = unlockedBadges.map((r: any) => r.badge);
  const unlockedCount = unlockedTypes.length;
  const totalBadges = ALL_BADGES.length;
  const completionPercent = Math.round((unlockedCount / totalBadges) * 100);

  // Calculate progress for each badge
  const getBadgeProgress = (badge: BadgeConfig): { current: number; target: number; percent: number } => {
    if (badge.type === 'FIRST_SAVE') {
      const hasSaved = totalSaved > 0 || unlockedTypes.includes('FIRST_SAVE');
      return { current: hasSaved ? 1 : 0, target: 1, percent: hasSaved ? 100 : 0 };
    }
    if (badge.thresholdType === 'streak') {
      return { current: Math.min(streak, badge.threshold), target: badge.threshold, percent: Math.min(100, Math.round((streak / badge.threshold) * 100)) };
    }
    return { current: Math.min(totalSaved, badge.threshold), target: badge.threshold, percent: Math.min(100, Math.round((totalSaved / badge.threshold) * 100)) };
  };

  // Find next milestone
  const nextBadge = ALL_BADGES.find(b => !unlockedTypes.includes(b.type));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center voice-demo-hero-enter">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-4 border border-amber-500/20">
          <Award size={12} />
          {language === 'hi' ? 'उपलब्धियां और पुरस्कार' : 'Achievements & Rewards'}
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
          {t('rewards.title')}
        </h1>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          {language === 'hi'
            ? 'बचत की लकीर बनाए रखें और लक्ष्य हासिल करके बिल्ले अनलॉक करें।'
            : 'Keep your savings streak alive and hit milestones to unlock badges.'}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 voice-demo-panel-enter" style={{ animationDelay: '80ms' }}>
        <div className="fintech-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${streak > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-secondary text-muted-foreground'}`}>
              <Flame size={22} className={streak > 0 ? 'fill-orange-500/20' : ''} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{streak}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
            {language === 'hi' ? 'दिन की लकीर' : 'Day Streak'}
          </p>
        </div>

        <div className="fintech-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <TrendingUp size={22} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground">₹{totalSaved.toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
            {language === 'hi' ? 'कुल बचत' : 'Total Saved'}
          </p>
        </div>

        <div className="fintech-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Award size={22} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{unlockedCount}/{totalBadges}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
            {language === 'hi' ? 'बिल्ले अनलॉक' : 'Badges Unlocked'}
          </p>
        </div>

        <div className="fintech-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Target size={22} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{completionPercent}%</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
            {language === 'hi' ? 'पूर्णता' : 'Completion'}
          </p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="fintech-card p-5 voice-demo-panel-enter" style={{ animationDelay: '120ms' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            {language === 'hi' ? 'समग्र प्रगति' : 'Overall Achievement Progress'}
          </span>
          <span className="text-xs font-bold text-amber-500">{unlockedCount}/{totalBadges}</span>
        </div>
        <div className="h-3 bg-secondary/20 rounded-full overflow-hidden border border-border/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 transition-all duration-700 relative overflow-hidden"
            style={{ width: `${completionPercent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent badge-shimmer" />
          </div>
        </div>
      </div>

      {/* Next Milestone Card */}
      {nextBadge && (
        <div className="fintech-card p-5 border-l-4 border-l-blue-500 voice-demo-panel-enter" style={{ animationDelay: '160ms' }}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${nextBadge.bgColor} flex items-center justify-center text-3xl select-none shrink-0 badge-next-pulse`}>
              {nextBadge.emoji}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-0.5 flex items-center gap-1">
                <Zap size={10} />
                {language === 'hi' ? 'अगला लक्ष्य' : 'Next Milestone'}
              </p>
              <p className="text-sm font-bold text-foreground">
                {t(`rewards.badges.${nextBadge.type}`) || nextBadge.type.replace('_', ' ')}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t(`rewards.badgeDescs.${nextBadge.type}`)}
              </p>
              {/* Progress */}
              {(() => {
                const prog = getBadgeProgress(nextBadge);
                return (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
                      <span>{prog.current.toLocaleString()} / {prog.target.toLocaleString()}{nextBadge.thresholdType === 'streak' ? (language === 'hi' ? ' दिन' : ' days') : ''}</span>
                      <span className="font-bold text-blue-500">{prog.percent}%</span>
                    </div>
                    <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${prog.percent}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* All Badges Grid */}
      <div className="space-y-4 voice-demo-panel-enter" style={{ animationDelay: '200ms' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Award size={14} />
          {language === 'hi' ? 'सभी उपलब्धि बिल्ले' : 'All Achievement Badges'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_BADGES.map((badge, index) => {
            const isUnlocked = unlockedTypes.includes(badge.type);
            const rewardObj = unlockedBadges.find((r: any) => r.badge === badge.type);
            const progress = getBadgeProgress(badge);

            return (
              <div
                key={badge.type}
                className={`fintech-card p-5 relative overflow-hidden transition-all notification-item-enter ${
                  isUnlocked
                    ? `border-l-4 ${badge.color.replace('text-', 'border-l-')} ${badge.glowColor ? `shadow-lg ${badge.glowColor}` : ''}`
                    : 'opacity-70'
                }`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Decorative shimmer for unlocked */}
                {isUnlocked && (
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
                    style={{ background: `radial-gradient(circle, currentColor, transparent)` }} />
                )}

                {/* Lock icon for locked */}
                {!isUnlocked && (
                  <div className="absolute top-3 right-3">
                    <Lock size={12} className="text-muted-foreground/40" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Badge Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl select-none shrink-0 ${
                    isUnlocked ? `${badge.bgColor} badge-unlocked-glow` : 'bg-secondary/30'
                  }`}>
                    {isUnlocked ? (
                      <span className="badge-emoji-bounce">{badge.emoji}</span>
                    ) : (
                      <span className="grayscale opacity-40">{badge.emoji}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Badge Name */}
                    <h4 className={`font-bold text-sm ${isUnlocked ? badge.color : 'text-muted-foreground'}`}>
                      {t(`rewards.badges.${badge.type}`) || badge.type.replace('_', ' ')}
                    </h4>

                    {/* Description */}
                    <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                      {t(`rewards.badgeDescs.${badge.type}`)}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[9px] mb-1">
                        <span className="text-muted-foreground/60">
                          {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
                        </span>
                        <span className={`font-bold ${isUnlocked ? badge.color : 'text-muted-foreground'}`}>
                          {progress.percent}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isUnlocked 
                              ? badge.color.replace('text-', 'bg-')
                              : 'bg-muted-foreground/20'
                          }`}
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Unlock date or locked status */}
                    <div className="mt-2">
                      {isUnlocked ? (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold ${badge.color} ${badge.bgColor} px-2 py-0.5 rounded-full`}>
                          ✓ {language === 'hi' ? 'अनलॉक' : 'Unlocked'} {new Date(rewardObj.awardedAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-muted-foreground/50 bg-secondary/30 px-2 py-0.5 rounded-full border border-border/30">
                          🔒 {language === 'hi' ? 'लॉक' : 'Locked'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak Section */}
      <div className="fintech-card p-6 text-center voice-demo-panel-enter" style={{ animationDelay: '300ms' }}>
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          streak > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-secondary text-muted-foreground'
        }`}>
          <Flame size={40} className={streak > 0 ? 'fill-orange-500/20 streak-flame-animate' : ''} />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground">{streak} {language === 'hi' ? 'दिन' : 'Days'}</h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          {streak > 0
            ? t('rewards.streakText', { days: streak })
            : (language === 'hi' ? 'रोजाना बचत करें और अपनी लकीर शुरू करें!' : 'Save daily to start your streak flame and unlock badges!')}
        </p>

        {/* Streak milestones mini-track */}
        <div className="flex items-center justify-center gap-1 mt-4">
          {[1, 3, 7, 14, 30].map((milestone) => (
            <div
              key={milestone}
              className={`px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all ${
                streak >= milestone
                  ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                  : 'bg-secondary/10 text-muted-foreground/40 border-border/30'
              }`}
            >
              {milestone}d
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center voice-demo-panel-enter" style={{ animationDelay: '360ms' }}>
        <Link
          href="/dashboard/savings"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
        >
          <TrendingUp size={14} />
          {language === 'hi' ? 'अभी बचत करें और बिल्ले अनलॉक करें' : 'Save Now & Unlock More Badges'}
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
