import { QueryClient } from '@tanstack/react-query';

interface OptimisticSavePayload {
  amount: number;
  description?: string;
  timestamp: string;
}

export async function performOptimisticSaveUpdate(
  queryClient: QueryClient,
  payload: OptimisticSavePayload
) {
  const { amount, description, timestamp } = payload;
  const now = new Date(timestamp);

  // 1. Cancel outgoing queries to prevent overrides
  await queryClient.cancelQueries({ queryKey: ['me'] });
  await queryClient.cancelQueries({ queryKey: ['transactions'] });
  await queryClient.cancelQueries({ queryKey: ['goals'] });
  await queryClient.cancelQueries({ queryKey: ['notifications'] });
  await queryClient.cancelQueries({ queryKey: ['admin-analytics'] });
  await queryClient.cancelQueries({ queryKey: ['admin-reports-analytics'] });

  // 2. Snapshot current state
  const previousMe = queryClient.getQueryData(['me']);
  const previousTransactions = queryClient.getQueryData(['transactions']);
  const previousGoals = queryClient.getQueryData(['goals']);
  const previousNotifications = queryClient.getQueryData(['notifications']);
  const previousAdminAnalytics = queryClient.getQueryData(['admin-analytics']);
  const previousAdminReportsAnalytics = queryClient.getQueryData(['admin-reports-analytics']);

  // 3. Update ['me'] query data
  queryClient.setQueryData(['me'], (old: any) => {
    if (!old || !old.user) return old;
    const user = old.user;

    // Calculate new streak
    let newStreak = user.streakDays || 0;
    const lastSaveDate = user.lastSaveDate ? new Date(user.lastSaveDate) : null;
    
    if (!lastSaveDate) {
      newStreak = 1;
    } else {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastSaveDay = new Date(lastSaveDate.getFullYear(), lastSaveDate.getMonth(), lastSaveDate.getDate());

      if (lastSaveDay.getTime() === yesterday.getTime()) {
        newStreak = (user.streakDays || 0) + 1;
      } else if (lastSaveDay.getTime() === today.getTime()) {
        newStreak = user.streakDays || 0;
      } else {
        newStreak = 1;
      }
    }

    // Determine rewards updates
    const currentBadges = user.rewards ? user.rewards.map((r: any) => r.badge) : [];
    const newBadges: string[] = [];
    if (!currentBadges.includes('FIRST_SAVE')) {
      newBadges.push('FIRST_SAVE');
    }
    if (newStreak >= 7 && !currentBadges.includes('STREAK_7')) {
      newBadges.push('STREAK_7');
    }
    if (newStreak >= 30 && !currentBadges.includes('STREAK_30')) {
      newBadges.push('STREAK_30');
    }
    const projectedTotalSaved = (user.currentBalance || 0) + amount;
    if (projectedTotalSaved >= 1000 && !currentBadges.includes('SAVE_1000')) {
      newBadges.push('SAVE_1000');
    }
    if (projectedTotalSaved >= 5000 && !currentBadges.includes('SAVE_5000')) {
      newBadges.push('SAVE_5000');
    }

    const updatedRewards = [...(user.rewards || [])];
    newBadges.forEach((b, idx) => {
      updatedRewards.push({
        id: `optimistic-badge-${idx}-${Date.now()}`,
        userId: user.id,
        badge: b,
        awardedAt: now.toISOString(),
      });
    });

    return {
      ...old,
      user: {
        ...user,
        currentBalance: (user.currentBalance || 0) + amount,
        monthlySaved: (user.monthlySaved || 0) + amount,
        streakDays: newStreak,
        lastSaveDate: now.toISOString(),
        rewards: updatedRewards,
      },
    };
  });

  // 4. Update ['transactions'] query data
  queryClient.setQueryData(['transactions'], (old: any) => {
    const list = old && old.transactions ? old.transactions : [];
    const newTx = {
      id: `optimistic-tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amount,
      type: 'SAVE',
      status: 'COMPLETED',
      description: description || 'Daily Micro-Saving',
      timestamp: now.toISOString(),
      userId: 'optimistic-user',
    };
    return {
      ...old,
      transactions: [newTx, ...list],
    };
  });

  // 5. Update ['goals'] query data
  queryClient.setQueryData(['goals'], (old: any) => {
    if (!old || !old.goals) return old;
    let remainingAmount = amount;
    const updatedGoals = old.goals.map((goal: any) => {
      if (goal.currentAmount < goal.targetAmount && remainingAmount > 0) {
        const needed = goal.targetAmount - goal.currentAmount;
        const add = Math.min(remainingAmount, needed);
        remainingAmount -= add;
        return {
          ...goal,
          currentAmount: goal.currentAmount + add,
        };
      }
      return goal;
    });
    return {
      ...old,
      goals: updatedGoals,
    };
  });

  // 6. Update ['admin-analytics'] query data
  queryClient.setQueryData(['admin-analytics'], (old: any) => {
    if (!old) return old;
    const metrics = old.metrics || {};
    const charts = old.charts || {};
    
    // Update monthly savings chart (June in this cohort metrics)
    const updatedMonthlySavings = (charts.monthlySavings || []).map((item: any) => {
      if (item.month === 'Jun') {
        return { ...item, savings: item.savings + amount };
      }
      return item;
    });

    return {
      ...old,
      metrics: {
        ...metrics,
        activeWagesSaved: (metrics.activeWagesSaved || 0) + amount,
        totalSaved: (metrics.totalSaved || 0) + amount,
      },
      charts: {
        ...charts,
        monthlySavings: updatedMonthlySavings,
      },
    };
  });

  // 7. Update ['admin-reports-analytics'] query data
  queryClient.setQueryData(['admin-reports-analytics'], (old: any) => {
    if (!old) return old;
    const metrics = old.metrics || {};
    const charts = old.charts || {};
    
    // Update monthly savings chart
    const updatedMonthlySavings = (charts.monthlySavings || []).map((item: any) => {
      if (item.month === 'Jun') {
        return { ...item, savings: item.savings + amount };
      }
      return item;
    });

    return {
      ...old,
      metrics: {
        ...metrics,
        activeWagesSaved: (metrics.activeWagesSaved || 0) + amount,
        totalSaved: (metrics.totalSaved || 0) + amount,
      },
      charts: {
        ...charts,
        monthlySavings: updatedMonthlySavings,
      },
    };
  });

  return {
    previousMe,
    previousTransactions,
    previousGoals,
    previousNotifications,
    previousAdminAnalytics,
    previousAdminReportsAnalytics,
  };
}

export function rollbackOptimisticSaveUpdate(
  queryClient: QueryClient,
  context: any
) {
  if (!context) return;
  if (context.previousMe !== undefined) {
    queryClient.setQueryData(['me'], context.previousMe);
  }
  if (context.previousTransactions !== undefined) {
    queryClient.setQueryData(['transactions'], context.previousTransactions);
  }
  if (context.previousGoals !== undefined) {
    queryClient.setQueryData(['goals'], context.previousGoals);
  }
  if (context.previousNotifications !== undefined) {
    queryClient.setQueryData(['notifications'], context.previousNotifications);
  }
  if (context.previousAdminAnalytics !== undefined) {
    queryClient.setQueryData(['admin-analytics'], context.previousAdminAnalytics);
  }
  if (context.previousAdminReportsAnalytics !== undefined) {
    queryClient.setQueryData(['admin-reports-analytics'], context.previousAdminReportsAnalytics);
  }
}
