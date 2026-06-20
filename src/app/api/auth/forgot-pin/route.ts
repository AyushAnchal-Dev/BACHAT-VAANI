import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPin } from '@/lib/auth';
import { z } from 'zod';

const resetSchema = z.object({
  phone: z.string().length(10),
  otp: z.string().length(4),
  newPin: z.string().length(4),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = resetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input parameters' }, { status: 400 });
    }

    const { phone, otp, newPin } = result.data;

    // Mock OTP verification (1234 for demo/evaluation)
    if (otp !== '1234') {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json({ error: 'Phone number not found' }, { status: 404 });
    }

    // Hash the new 4-digit PIN
    const pinHash = await hashPin(newPin);

    // Save updated PIN hash
    await prisma.user.update({
      where: { id: user.id },
      data: { pinHash },
    });

    // Create Audit Log entry
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PIN_RESET',
        details: `PIN reset successfully for phone ${phone}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PIN reset API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
