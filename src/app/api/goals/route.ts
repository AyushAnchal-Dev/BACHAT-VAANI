import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

const goalSchema = z.object({
  title: z.string().min(1, 'Goal name is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  deadline: z.string(),
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

    const goals = await prisma.goal.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, goals });
  } catch (error) {
    console.error('API goals GET error:', error);
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
    const result = goalSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { title, targetAmount, deadline } = result.data;
    const userId = decoded.userId;

    // Create a new savings goal in database
    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        targetAmount,
        deadline: new Date(deadline),
      },
    });

    // Notify user of creation
    await prisma.notification.create({
      data: {
        userId,
        titleEn: 'New Savings Goal Created',
        titleHi: 'नया बचत लक्ष्य बनाया गया',
        messageEn: `You created a goal: "${title}" with a target of ₹${targetAmount}.`,
        messageHi: `आपने एक लक्ष्य बनाया: "${title}" (₹${targetAmount} का लक्ष्य)।`,
      },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error('API goals POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
