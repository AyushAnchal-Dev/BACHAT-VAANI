import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

const withdrawSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
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

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, withdrawals });
  } catch (error) {
    console.error('API withdrawals GET error:', error);
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
    const result = withdrawSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { amount } = result.data;
    const userId = decoded.userId;

    // Check user balance first
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    const totalSaved = transactions
      .filter(tx => tx.type === 'SAVE' && tx.status === 'COMPLETED')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalWithdrawn = transactions
      .filter(tx => tx.type === 'WITHDRAW' && (tx.status === 'APPROVED' || tx.status === 'COMPLETED'))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const currentBalance = totalSaved - totalWithdrawn;

    if (amount > currentBalance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Create withdrawal request entry
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        status: 'PENDING',
      },
    });

    // Create ledger transaction entry (synced via ID)
    await prisma.transaction.create({
      data: {
        id: withdrawal.id,
        userId,
        amount,
        type: 'WITHDRAW',
        status: 'PENDING',
        description: 'Withdrawal Request',
      },
    });

    // Create user notification
    await prisma.notification.create({
      data: {
        userId,
        titleEn: 'Withdrawal Requested',
        titleHi: 'निकासी का अनुरोध किया गया',
        messageEn: `Your request to withdraw ₹${amount} is pending admin approval.`,
        messageHi: `आपके ₹${amount} निकालने के अनुरोध पर कार्रवाई लंबित है।`,
      },
    });

    // Log the transaction attempt
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'WITHDRAWAL_REQUEST',
        details: `Requested withdrawal of ₹${amount}. Status: PENDING.`,
      },
    });

    return NextResponse.json({ success: true, withdrawal });
  } catch (error) {
    console.error('API withdrawals POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
