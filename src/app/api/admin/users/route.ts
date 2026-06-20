import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { hashPin } from '@/lib/auth';
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        language: true,
        streakDays: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('API admin users GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const resetUserSchema = z.object({
  targetUserId: z.string(),
  tempPin: z.string().length(4),
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
    const result = resetUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { targetUserId, tempPin } = result.data;

    // Hash the temporary PIN
    const pinHash = await hashPin(tempPin);

    // Save update in DB
    await prisma.user.update({
      where: { id: targetUserId },
      data: { pinHash },
    });

    // Create Audit Log entry
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'ADMIN_PIN_RESET',
        details: `Reset PIN for user ID ${targetUserId} to temporary PIN ${tempPin}.`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API admin users PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
