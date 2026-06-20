/**
 * Micro-savings business logic utilities.
 * Encapsulating these rules allows isolated testing without requiring active DB/network connections.
 */

/**
 * Calculates the new saving streak based on the last saving timestamp.
 * 
 * - If last save date is null, streak is 1.
 * - If last save was yesterday, increment streak by 1.
 * - If last save was today, preserve the current streak.
 * - If last save was before yesterday (streak broken), reset to 1.
 */
export function calculateStreak(lastSaveDate: Date | null, currentStreak: number, now: Date = new Date()): number {
  if (!lastSaveDate) {
    return 1;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastSaveDay = new Date(lastSaveDate.getFullYear(), lastSaveDate.getMonth(), lastSaveDate.getDate());

  if (lastSaveDay.getTime() === yesterday.getTime()) {
    return currentStreak + 1;
  } else if (lastSaveDay.getTime() === today.getTime()) {
    return currentStreak;
  } else {
    return 1;
  }
}

/**
 * Evaluates saving milestone badges.
 * Returns the list of newly unlocked badge keys that the user hasn't received yet.
 */
export function evaluateBadges(
  newStreak: number,
  totalSavedAmount: number,
  existingBadges: string[]
): string[] {
  const newBadges: string[] = [];

  // Milestone: First Save
  if (!existingBadges.includes('FIRST_SAVE')) {
    newBadges.push('FIRST_SAVE');
  }

  // Milestone: Streak 7 Days
  if (newStreak >= 7 && !existingBadges.includes('STREAK_7')) {
    newBadges.push('STREAK_7');
  }

  // Milestone: Streak 30 Days
  if (newStreak >= 30 && !existingBadges.includes('STREAK_30')) {
    newBadges.push('STREAK_30');
  }

  // Milestone: ₹1000 Total Saved
  if (totalSavedAmount >= 1000 && !existingBadges.includes('SAVE_1000')) {
    newBadges.push('SAVE_1000');
  }

  // Milestone: ₹5000 Total Saved
  if (totalSavedAmount >= 5000 && !existingBadges.includes('SAVE_5000')) {
    newBadges.push('SAVE_5000');
  }

  return newBadges;
}
