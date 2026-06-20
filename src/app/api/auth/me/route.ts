import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { hashPin } from '@/lib/auth';

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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        rewards: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate Savings Metrics
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
    });

    const totalSaved = transactions
      .filter(tx => tx.type === 'SAVE' && tx.status === 'COMPLETED')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalWithdrawn = transactions
      .filter(tx => tx.type === 'WITHDRAW' && (tx.status === 'APPROVED' || tx.status === 'COMPLETED'))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const currentBalance = Math.max(0, totalSaved - totalWithdrawn);

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlySaved = transactions
      .filter(tx => tx.type === 'SAVE' && tx.status === 'COMPLETED' && tx.timestamp >= firstDayOfMonth)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        language: user.language,
        role: user.role,
        streakDays: user.streakDays,
        lastSaveDate: user.lastSaveDate,
        currentBalance,
        monthlySaved,
        notifications: user.notifications,
        rewards: user.rewards,
      },
    });
  } catch (error) {
    console.error('API me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
    const updateData: any = {};

    if (body.language) {
      updateData.language = body.language;
    }
    if (body.name) {
      updateData.name = body.name;
    }
    if (body.pin) {
      updateData.pinHash = await hashPin(body.pin);
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        language: updatedUser.language,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('API me update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
