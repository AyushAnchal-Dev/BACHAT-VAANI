import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';
import { calculateStreak, evaluateBadges } from '@/lib/savings';

const saveSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: decoded.userId },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error('API savings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = saveSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { amount, description } = result.data;
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { rewards: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Calculate Streak Days
    const now = new Date();
    const newStreak = calculateStreak(user.lastSaveDate, user.streakDays, now);

    // 2. Create Transaction Ledger Entry
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: 'SAVE',
        status: 'COMPLETED',
        description: description || 'Daily Micro-Saving',
      },
    });

    // 2b. Notification: Savings Deposit Successful
    await prisma.notification.create({
      data: {
        userId,
        titleEn: 'Savings Deposit Successful',
        titleHi: 'बचत जमा सफल',
        messageEn: `You saved ₹${amount} successfully! Keep up the great habit.`,
        messageHi: `आपने सफलतापूर्वक ₹${amount} बचाए! अच्छी आदत बनाए रखें।`,
      },
    });

    // 3. Update User Streak & Timestamp
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        streakDays: newStreak,
        lastSaveDate: now,
      },
    });

    // 4. Update active savings goals progress
    const activeGoals = await prisma.goal.findMany({
      where: { userId },
    });

    for (const goal of activeGoals) {
      if (goal.currentAmount < goal.targetAmount) {
        const needed = goal.targetAmount - goal.currentAmount;
        const add = Math.min(amount, needed);
        const updatedGoal = await prisma.goal.update({
          where: { id: goal.id },
          data: {
            currentAmount: {
              increment: add,
            },
          },
        });

        // Notification: Goal Achieved when target is reached
        if (updatedGoal.currentAmount >= updatedGoal.targetAmount) {
          await prisma.notification.create({
            data: {
              userId,
              titleEn: `Goal Achieved: ${goal.title}!`,
              titleHi: `लक्ष्य प्राप्त: ${goal.title}!`,
              messageEn: `Congratulations! You completed your savings goal "${goal.title}" of ₹${goal.targetAmount}. Amazing discipline!`,
              messageHi: `बधाई हो! आपने अपना बचत लक्ष्य "${goal.title}" ₹${goal.targetAmount} पूरा कर लिया। शानदार अनुशासन!`,
            },
          });
        }
      }
    }

    // 5. Evaluate rewards milestones
    const existingBadges = user.rewards.map(r => r.badge);
    const allSavedTransactions = await prisma.transaction.findMany({
      where: { userId, type: 'SAVE', status: 'COMPLETED' },
    });
    const totalSavedAmount = allSavedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const newBadges = evaluateBadges(newStreak, totalSavedAmount, existingBadges);

    // Award badges in database
    for (const badge of newBadges) {
      await prisma.reward.create({
        data: { userId, badge },
      });

      // Localized notifications
      let titleEn = `New Badge Unlocked: ${badge.replace('_', ' ')}!`;
      let titleHi = `नया बिल्ला प्राप्त हुआ: ${badge === 'FIRST_SAVE' ? 'पहला बचतकर्ता' : badge === 'STREAK_7' ? '7-दिवसीय योद्धा' : badge === 'STREAK_30' ? 'मासिक चैंपियन' : badge === 'SAVE_1000' ? 'हजार क्लब' : 'धन निर्माता'}!`;
      let msgEn = `Congratulations! You unlocked the ${badge.replace('_', ' ')} badge for your savings activity.`;
      let msgHi = `बधाई हो! आपने अपनी बचत गतिविधि के लिए बिल्ला प्राप्त किया।`;

      await prisma.notification.create({
        data: {
          userId,
          titleEn,
          titleHi,
          messageEn: msgEn,
          messageHi: msgHi,
        },
      });
    }

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SAVE_TRANSACTION',
        details: `Saved ₹${amount}. Streak is ${newStreak} days. Badges unlocked: ${newBadges.join(', ') || 'None'}.`,
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
      streakDays: newStreak,
      unlockedBadges: newBadges,
    });
  } catch (error) {
    console.error('API savings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
