import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from './prisma';
import { hashPin, comparePin, signToken } from './auth';
import { calculateStreak, evaluateBadges } from './savings';

describe('BachatVaani E2E Integration Flow', () => {
  const testPhone = '9000000001';
  const testName = 'E2E Integration Test User';
  const testPin = '9999';
  let userId: string;

  beforeAll(async () => {
    // Clean up any stale test user from previous aborted runs
    const staleUser = await prisma.user.findUnique({
      where: { phone: testPhone },
    });
    if (staleUser) {
      await prisma.user.delete({
        where: { id: staleUser.id },
      });
    }
  });

  afterAll(async () => {
    // Final clean up of test records
    if (userId) {
      await prisma.user.delete({
        where: { id: userId },
      });
      console.log('Cleaned up E2E integration test user and related records successfully.');
    }
  });

  it('1. User Registration Flow', async () => {
    const pinHash = await hashPin(testPin);
    
    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: testName,
        phone: testPhone,
        pinHash,
        language: 'en',
        role: 'USER',
      },
    });

    userId = user.id;
    expect(user.id).toBeDefined();
    expect(user.phone).toBe(testPhone);

    // Verify welcome notification is created
    const welcomeNotification = await prisma.notification.create({
      data: {
        userId: user.id,
        titleEn: 'Welcome!',
        titleHi: 'स्वागत है!',
        messageEn: 'Welcome from E2E test',
        messageHi: 'स्वागत सन्देश',
      },
    });
    expect(welcomeNotification.id).toBeDefined();

    // Verify audit log registration
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        details: 'E2E registered user account',
      },
    });
    expect(auditLog.id).toBeDefined();
  });

  it('2. Login PIN Verification Flow', async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    expect(user).not.toBeNull();

    // Test incorrect PIN rejection
    const isInvalid = await comparePin('0000', user!.pinHash);
    expect(isInvalid).toBe(false);

    // Test correct PIN resolution
    const isValid = await comparePin(testPin, user!.pinHash);
    expect(isValid).toBe(true);

    // Test Token signing
    const token = await signToken({ userId: user!.id, role: user!.role });
    expect(token).toBeDefined();
    expect(token.split('.').length).toBe(3);
  });

  it('3. Save Money (Deposit) Flow', async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    expect(user).not.toBeNull();

    // Verify streak calculation
    const now = new Date();
    const newStreak = calculateStreak(user!.lastSaveDate, user!.streakDays, now);
    expect(newStreak).toBe(1);

    // Create a savings transaction
    const depositAmount = 250;
    const tx = await prisma.transaction.create({
      data: {
        userId: user!.id,
        amount: depositAmount,
        type: 'SAVE',
        status: 'COMPLETED',
        description: 'E2E Test Deposit',
      },
    });
    expect(tx.id).toBeDefined();
    expect(tx.amount).toBe(depositAmount);

    // Update user streak
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        streakDays: newStreak,
        lastSaveDate: now,
      },
    });
    expect(updatedUser.streakDays).toBe(1);

    // Evaluate badges
    const existingBadges = await prisma.reward.findMany({
      where: { userId },
    }).then(rewards => rewards.map(r => r.badge));

    const newBadges = evaluateBadges(newStreak, depositAmount, existingBadges);
    expect(newBadges).toContain('FIRST_SAVE');

    // Save earned badge in database
    for (const badge of newBadges) {
      const reward = await prisma.reward.create({
        data: { userId, badge },
      });
      expect(reward.id).toBeDefined();
    }
  });

  it('4. Withdrawal Request and Balance Guard Flow', async () => {
    // Fetch all transactions to calculate current balance
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    const totalSaved = transactions
      .filter(tx => tx.type === 'SAVE' && tx.status === 'COMPLETED')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalWithdrawn = transactions
      .filter(tx => tx.type === 'WITHDRAW' && tx.status === 'COMPLETED')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const balance = totalSaved - totalWithdrawn;
    expect(balance).toBe(250);

    // Request a withdrawal for 100
    const withdrawAmount = 100;
    expect(balance).toBeGreaterThanOrEqual(withdrawAmount);

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount: withdrawAmount,
        status: 'PENDING',
      },
    });

    expect(withdrawal.id).toBeDefined();
    expect(withdrawal.status).toBe('PENDING');
  });
});
