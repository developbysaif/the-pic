import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb/mongoose';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email/mailer';
import { checkRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`forgot_pass_${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many recovery requests. Please wait 1 minute.' },
        { status: 429 }
      );
    }

    await connectDB();
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email } = parsed.data;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return ambiguous message for privacy
      return NextResponse.json({
        message: 'If that email address is registered, instructions have been sent.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json({
      message: 'Password reset instructions have been dispatched to your email.',
      resetToken: token,
      resetUrl,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
