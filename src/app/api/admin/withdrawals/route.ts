import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: { name: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, withdrawals });
  } catch (error) {
    console.error('API admin withdrawals GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const updateWithdrawalSchema = z.object({
  withdrawalId: z.string(),
  action: z.enum(['APPROVE', 'REJECT']),
});

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = updateWithdrawalSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { withdrawalId, action } = result.data;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }

    if (withdrawal.status !== 'PENDING') {
      return NextResponse.json({ error: 'Withdrawal request already processed' }, { status: 400 });
    }

    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const txStatus = action === 'APPROVE' ? 'COMPLETED' : 'REJECTED';

    // Update withdrawal status
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status },
    });

    // Update transaction state in ledger
    await prisma.transaction.updateMany({
      where: { id: withdrawalId },
      data: { status: txStatus },
    });

    // Send localized user notifications
    await prisma.notification.create({
      data: {
        userId: withdrawal.userId,
        titleEn: `Withdrawal Request ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`,
        titleHi: `निकासी का अनुरोध ${action === 'APPROVE' ? 'मंजूर' : 'अस्वीकृत'}`,
        messageEn: `Your withdrawal request of ₹${withdrawal.amount} has been ${action === 'APPROVE' ? 'approved and processed' : 'rejected by the administrator'}.`,
        messageHi: `आपका ₹${withdrawal.amount} की निकासी का अनुरोध ${action === 'APPROVE' ? 'मंजूर और संसाधित' : 'प्रशासक द्वारा अस्वीकृत'} कर दिया गया है।`,
      },
    });

    // Log action to global audit trail
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: `WITHDRAWAL_${action}`,
        details: `Processed withdrawal ID ${withdrawalId} for user ID ${withdrawal.userId}. Result: ${status}.`,
      },
    });

    return NextResponse.json({ success: true, withdrawal: updatedWithdrawal });
  } catch (error) {
    console.error('API admin withdrawals PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
