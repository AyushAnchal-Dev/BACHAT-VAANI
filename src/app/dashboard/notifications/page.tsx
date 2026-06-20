'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/components/LanguageProvider';
import { Navbar } from '@/components/Navbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Banknote, Trophy, Flame, Filter } from 'lucide-react';

// ---------- Notification type icon (larger for history) ----------
function NotificationIcon({ title }: { title: string }) {
  const lower = title.toLowerCase();
  if (lower.includes('goal') || lower.includes('लक्ष्य')) {
    return (
      <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
        <Trophy size={18} className="text-amber-500" />
      </div>
    );
  }
  if (lower.includes('badge') || lower.includes('streak') || lower.includes('बिल्ला')) {
    return (
      <div className="w-9 h-9 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
        <Flame size={18} className="text-orange-500" />
      </div>
    );
  }
  if (lower.includes('withdrawal') || lower.includes('निकासी')) {
    return (
      <div className="w-9 h-9 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0">
        <Banknote size={18} className="text-purple-500" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
      <Banknote size={18} className="text-emerald-500" />
    </div>
  );
}

// ---------- Relative time for history ----------
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const { language, t } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
  });

  const allNotifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const filteredNotifications = allNotifications.filter((n: any) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

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
    onError: (_err: any, _vars: any, ctx: any) => {
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
    onError: (_err: any, _vars: any, ctx: any) => {
      if (ctx?.prev) queryClient.setQueryData(['notifications'], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar showDashboardLinks />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <Bell size={22} />
              {t('notifications.title')}
            </h1>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {unreadCount} {t('notifications.unread').toLowerCase()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-secondary/15 hover:bg-blue-500/10 text-xs font-semibold text-blue-500 transition-colors"
              >
                <CheckCheck size={14} />
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-secondary/10 rounded-lg w-fit border border-border">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : f === 'unread' ? t('notifications.unread') : t('notifications.read')}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[9px]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="fintech-card p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary/30"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-secondary/30 rounded w-3/4"></div>
                    <div className="h-2.5 bg-secondary/20 rounded w-full"></div>
                    <div className="h-2 bg-secondary/15 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="fintech-card p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
              <Bell size={28} className="text-muted-foreground/30" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">
              {filter === 'unread' ? t('notifications.allCaughtUp') : t('notifications.noNotifications')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {filter === 'unread'
                ? 'All your notifications have been read.'
                : 'Notifications will appear here as you use the app.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notif: any, index: number) => {
              const title = language === 'hi' ? notif.titleHi : notif.titleEn;
              const message = language === 'hi' ? notif.messageHi : notif.messageEn;
              return (
                <div
                  key={notif.id}
                  className={`fintech-card p-4 transition-all notification-item-enter ${
                    !notif.isRead ? 'border-l-2 border-l-blue-500' : ''
                  }`}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <NotificationIcon title={notif.titleEn} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${!notif.isRead ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                          {title}
                        </p>
                        {!notif.isRead && (
                          <button
                            onClick={() => markOneRead.mutate(notif.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-semibold text-blue-500 hover:bg-blue-500/10 transition-colors shrink-0"
                            title={t('notifications.markRead')}
                          >
                            <Check size={10} />
                            {t('notifications.markRead')}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
                        {message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground/50">
                          {relativeTime(notif.createdAt, t)}
                        </span>
                        <span className="text-[10px] text-muted-foreground/30">
                          {formatDate(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
