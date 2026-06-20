import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

const voiceSchema = z.object({
  commandText: z.string(),
  recognizedIntent: z.string(),
});

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
    const result = voiceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { commandText, recognizedIntent } = result.data;
    const userId = decoded.userId;

    // Log the voice command transaction to database
    const voiceCommand = await prisma.voiceCommand.create({
      data: {
        userId,
        commandText,
        recognizedIntent,
      },
    });

    return NextResponse.json({ success: true, voiceCommand });
  } catch (error) {
    console.error('API voice POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
