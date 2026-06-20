import { describe, it, expect } from 'vitest';
import { calculateStreak, evaluateBadges } from './savings';

describe('Streak Calculation Rules', () => {
  it('should start streak at 1 if user has never saved before', () => {
    const now = new Date('2026-06-20T10:00:00Z');
    const streak = calculateStreak(null, 0, now);
    expect(streak).toBe(1);
  });

  it('should increment streak if last save was yesterday', () => {
    const now = new Date('2026-06-20T10:00:00Z');
    const yesterday = new Date('2026-06-19T14:30:00Z');
    const streak = calculateStreak(yesterday, 3, now);
    expect(streak).toBe(4);
  });

  it('should keep current streak if last save was today', () => {
    const now = new Date('2026-06-20T15:00:00Z');
    const todayEarlier = new Date('2026-06-20T08:15:00Z');
    const streak = calculateStreak(todayEarlier, 5, now);
    expect(streak).toBe(5);
  });

  it('should reset streak to 1 if last save was before yesterday', () => {
    const now = new Date('2026-06-20T10:00:00Z');
    const twoDaysAgo = new Date('2026-06-18T10:00:00Z');
    const streak = calculateStreak(twoDaysAgo, 10, now);
    expect(streak).toBe(1);
  });
});

describe('Badge and Reward Milestones', () => {
  it('should unlock FIRST_SAVE badge for new savers', () => {
    const unlocked = evaluateBadges(1, 10, []);
    expect(unlocked).toContain('FIRST_SAVE');
    expect(unlocked.length).toBe(1);
  });

  it('should unlock STREAK_7 badge when streak reaches 7', () => {
    const unlocked = evaluateBadges(7, 500, ['FIRST_SAVE']);
    expect(unlocked).toContain('STREAK_7');
    expect(unlocked).not.toContain('FIRST_SAVE');
  });

  it('should unlock SAVE_1000 badge when total savings crosses 1000', () => {
    const unlocked = evaluateBadges(5, 1200, ['FIRST_SAVE']);
    expect(unlocked).toContain('SAVE_1000');
    expect(unlocked).not.toContain('STREAK_7');
  });

  it('should not unlock badges that are already earned', () => {
    const unlocked = evaluateBadges(8, 1500, ['FIRST_SAVE', 'STREAK_7', 'SAVE_1000']);
    expect(unlocked.length).toBe(0);
  });

  it('should unlock multiple badges simultaneously if multiple milestones are achieved', () => {
    const unlocked = evaluateBadges(30, 6000, ['FIRST_SAVE']);
    expect(unlocked).toContain('STREAK_7');
    expect(unlocked).toContain('STREAK_30');
    expect(unlocked).toContain('SAVE_1000');
    expect(unlocked).toContain('SAVE_5000');
  });
});
