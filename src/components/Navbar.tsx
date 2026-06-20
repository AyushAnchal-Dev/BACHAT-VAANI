'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from './LanguageProvider';
import { useTheme } from './Providers';
import { Sun, Moon, Languages, LogOut, Bell, Check, CheckCheck, Banknote, Trophy, Flame, ArrowRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ---------- Relative time helper ----------
function relativeTime(dateStr: string, t: (key: string, vars?: Record<string, string | number>) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return t('notifications.justNow');
  if (minutes < 60) return t('notifications.minutesAgo', { count: minutes });
  if (hours < 24) return t('notifications.hoursAgo', { count: hours });
  return t('notifications.daysAgo', { count: days });
}

// ---------- Notification type icon ----------
function NotificationIcon({ title }: { title: string }) {
  const lower = title.toLowerCase();
  if (lower.includes('goal') || lower.includes('लक्ष्य')) {
    return <Trophy size={16} className="text-amber-500 shrink-0" />;
  }
  if (lower.includes('badge') || lower.includes('streak') || lower.includes('बिल्ला')) {
    return <Flame size={16} className="text-orange-500 shrink-0" />;
  }
  if (lower.includes('withdrawal') || lower.includes('निकासी')) {
    return <Banknote size={16} className="text-purple-500 shrink-0" />;
  }
  return <Banknote size={16} className="text-emerald-500 shrink-0" />;
}

export function Navbar({ showDashboardLinks = false }: { showDashboardLinks?: boolean }) {
  const { language, setLanguage, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // ---------- Notification bell state ----------
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    enabled: showDashboardLinks,
    refetchInterval: 30000, // Poll every 30s for live updates
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;
  const recentNotifs = notifications.slice(0, 5);

  // Mark all as read
  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to mark all as read');
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const prev = queryClient.getQueryData(['notifications']);
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          unreadCount: 0,
          notifications: old.notifications.map((n: any) => ({ ...n, isRead: true })),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev) queryClient.setQueryData(['notifications'], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark single as read
  const markOneRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      if (!res.ok) throw new Error('Failed to mark notification read');
      return res.json();
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const prev = queryClient.getQueryData(['notifications']);
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          unreadCount: Math.max(0, (old.unreadCount || 0) - 1),
          notifications: old.notifications.map((n: any) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev) queryClient.setQueryData(['notifications'], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/auth/login');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
            <span className="w-2.5 h-5 bg-blue-600 rounded-sm"></span>
            <span>{t('app.title')}</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          {!showDashboardLinks ? (
            <>
              <Link href="/about" className="hover:text-blue-500 transition-colors">About</Link>
              <Link href="/features" className="hover:text-blue-500 transition-colors">Features</Link>
              <Link href="/how-it-works" className="hover:text-blue-500 transition-colors">How It Works</Link>
              <Link href="/impact" className="hover:text-blue-500 transition-colors">Impact</Link>
              <Link href="/learn" className="hover:text-blue-500 transition-colors">Learn</Link>
              <Link href="/voice-demo" className="hover:text-blue-500 transition-colors flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Voice Demo
              </Link>
              <Link href="/contact" className="hover:text-blue-500 transition-colors">Contact</Link>
            </>
          ) : (
            <>
              <Link 
                href="/dashboard" 
                className={`transition-colors ${isActive('/dashboard') ? 'text-blue-500 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('nav.dashboard')}
              </Link>
              <Link 
                href="/dashboard/savings" 
                className={`transition-colors ${isActive('/dashboard/savings') ? 'text-blue-500 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('nav.savings')}
              </Link>
              <Link 
                href="/dashboard/withdrawals" 
                className={`transition-colors ${isActive('/dashboard/withdrawals') ? 'text-blue-500 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('nav.withdrawals')}
              </Link>
              <Link 
                href="/dashboard/goals" 
                className={`transition-colors ${isActive('/dashboard/goals') ? 'text-blue-500 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('nav.goals')}
              </Link>
              <Link 
                href="/dashboard/rewards" 
                className={`transition-colors ${isActive('/dashboard/rewards') ? 'text-blue-500 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('nav.rewards')}
              </Link>
              <Link 
                href="/dashboard/leaderboard" 
                className={`transition-colors ${isActive('/dashboard/leaderboard') ? 'text-blue-500 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('nav.leaderboard')}
              </Link>
              <Link 
                href="/dashboard/voice" 
                className={`transition-colors ${isActive('/dashboard/voice') ? 'text-blue-500 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('nav.voice')}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-2.5 py-1.5 rounded border border-border bg-secondary/15 hover:bg-secondary/30 transition-colors text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-[10px] font-bold"
            aria-label="Toggle Language"
          >
            <Languages size={14} />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded border border-border bg-secondary/15 hover:bg-secondary/30 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Notification Bell – only visible for logged-in dashboard */}
          {showDashboardLinks && (
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setBellOpen(!bellOpen)}
                className="relative p-2 rounded border border-border bg-secondary/15 hover:bg-secondary/30 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
                id="notification-bell"
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1 notification-badge-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Panel */}
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-2xl notification-dropdown-enter z-[100]">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-bold text-foreground">{t('notifications.title')}</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllRead.mutate()}
                        className="flex items-center gap-1 text-[10px] font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        <CheckCheck size={12} />
                        {t('notifications.markAllRead')}
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto">
                    {recentNotifs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Bell size={28} className="mb-2 opacity-30" />
                        <p className="text-xs">{t('notifications.noNotifications')}</p>
                      </div>
                    ) : (
                      recentNotifs.map((notif: any) => {
                        const title = language === 'hi' ? notif.titleHi : notif.titleEn;
                        const message = language === 'hi' ? notif.messageHi : notif.messageEn;
                        return (
                          <div
                            key={notif.id}
                            className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 transition-colors cursor-pointer hover:bg-secondary/10 ${
                              !notif.isRead ? 'bg-blue-500/5' : ''
                            }`}
                            onClick={() => {
                              if (!notif.isRead) markOneRead.mutate(notif.id);
                            }}
                          >
                            <div className="mt-0.5">
                              <NotificationIcon title={notif.titleEn} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs leading-snug ${!notif.isRead ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                {title}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70 mt-0.5 line-clamp-2">
                                {message}
                              </p>
                              <p className="text-[9px] text-muted-foreground/50 mt-1">
                                {relativeTime(notif.createdAt, t)}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setBellOpen(false)}
                    className="flex items-center justify-center gap-1 px-4 py-2.5 text-[11px] font-semibold text-blue-500 hover:text-blue-400 transition-colors border-t border-border"
                  >
                    {t('notifications.viewAll')}
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {!showDashboardLinks ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3 py-2 text-xs font-semibold hover:text-blue-500 transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-xs font-bold rounded bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
              >
                {t('nav.register')}
              </Link>
            </div>
          ) : (
            <button
              onClick={logout}
              className="p-2 rounded border border-border bg-secondary/15 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title={t('nav.logout')}
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
