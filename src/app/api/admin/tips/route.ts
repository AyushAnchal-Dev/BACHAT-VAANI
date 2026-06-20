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

    const tips = await prisma.tip.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tips });
  } catch (error) {
    console.error('API admin tips GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const createTipSchema = z.object({
  contentEn: z.string().min(1),
  contentHi: z.string().min(1),
  category: z.string(),
});

export async function POST(request: Request) {
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
    const result = createTipSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { contentEn, contentHi, category } = result.data;

    // Save tip in DB
    const tip = await prisma.tip.create({
      data: {
        contentEn,
        contentHi,
        category,
      },
    });

    // Create Audit Log entry
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'ADMIN_CREATE_TIP',
        details: `Created new daily financial tip ID ${tip.id}.`,
      },
    });

    return NextResponse.json({ success: true, tip });
  } catch (error) {
    console.error('API admin tips POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    // Delete tip in DB
    await prisma.tip.delete({
      where: { id },
    });

    // Create Audit Log entry
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'ADMIN_DELETE_TIP',
        details: `Deleted daily financial tip ID ${id}.`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API admin tips DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
