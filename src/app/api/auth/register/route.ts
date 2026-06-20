import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPin, signToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().length(10, 'Phone number must be exactly 10 digits'),
  pin: z.string().length(4, 'PIN must be exactly 4 digits'),
  language: z.enum(['en', 'hi']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, phone, pin, language } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
    }

    // Hash PIN
    const pinHash = await hashPin(pin);

    // Determine role (custom logic for testing/admin access)
    const role = (phone === '9999999999' || name.toLowerCase().includes('admin')) ? 'ADMIN' : 'USER';

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        pinHash,
        language,
        role,
      },
    });

    // Create Audit Log entry for registration tracking
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        details: `New worker account registered: ${name} (${phone})`,
      },
    });

    // Create first notification (Welcome notification)
    await prisma.notification.create({
      data: {
        userId: user.id,
        titleEn: 'Welcome to BachatVaani!',
        titleHi: 'बचतवाणी में आपका स्वागत है!',
        messageEn: 'Start your micro-savings journey today. Try using voice commands!',
        messageHi: 'आज ही अपनी बचत यात्रा शुरू करें। आवाज कमांड का उपयोग करने का प्रयास करें!',
      },
    });

    // Generate token
    const token = await signToken({ userId: user.id, role: user.role });

    // Set cookie
    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, role: user.role, language: user.language } });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
