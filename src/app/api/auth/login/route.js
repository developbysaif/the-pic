import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import User from '@/models/User';
import Cart from '@/models/Cart';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  guestCartItems: z.array(z.any()).optional(),
});

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`login_${ip}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 1 minute.' },
        { status: 429 }
      );
    }

    await connectDB();
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, password, guestCartItems } = parsed.data;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Merge guest cart into user's DB cart if present
    if (guestCartItems && guestCartItems.length > 0) {
      const userCart = await Cart.findOne({ userId: user._id });
      if (userCart) {
        for (const gItem of guestCartItems) {
          const idx = userCart.items.findIndex(
            (it) => it.productId.toString() === gItem.productId && it.variantId === gItem.variantId
          );
          if (idx > -1) {
            userCart.items[idx].quantity += gItem.quantity || 1;
          } else {
            userCart.items.push(gItem);
          }
        }
        await userCart.save();
      } else {
        await Cart.create({
          userId: user._id,
          items: guestCartItems,
        });
      }
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      message: 'Logged in successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to sign in' }, { status: 500 });
  }
}
