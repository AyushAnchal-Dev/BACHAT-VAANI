import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePin, signToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  phone: z.string().length(10, 'Phone number must be exactly 10 digits'),
  pin: z.string().length(4, 'PIN must be exactly 4 digits'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { phone, pin } = result.data;

    // Find user by phone number
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      await prisma.auditLog.create({
        data: {
          action: 'LOGIN_FAILURE',
          details: `Failed login attempt: Phone ${phone} does not exist`,
        },
      });
      return NextResponse.json({ error: 'Invalid phone number or PIN' }, { status: 401 });
    }

    // Verify PIN comparison
    const isPinValid = await comparePin(pin, user.pinHash);

    if (!isPinValid) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILURE',
          details: `Failed login attempt: Wrong PIN for phone ${phone}`,
        },
      });
      return NextResponse.json({ error: 'Invalid phone number or PIN' }, { status: 401 });
    }

    // Generate token
    const token = await signToken({ userId: user.id, role: user.role });

    // Create Audit Log entry for access tracking
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        details: `Successful login for phone ${phone}`,
      },
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role, language: user.language },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
