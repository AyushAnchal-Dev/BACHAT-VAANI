import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

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

    // Retrieve full transaction list for admin review
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: { name: true, phone: true }
        }
      },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error('API admin transactions GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
