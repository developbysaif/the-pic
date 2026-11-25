import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Cart from '@/models/Cart';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ items: [] });
    }

    await connectDB();
    const cart = await Cart.findOne({ userId: session.userId }).lean();
    return NextResponse.json({ items: cart ? cart.items : [] });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Items must be an array' }, { status: 400 });
    }

    if (!session) {
      // Guest session - acknowledge without persisting to user record
      return NextResponse.json({ success: true, count: items.length });
    }

    await connectDB();
    const cart = await Cart.findOneAndUpdate(
      { userId: session.userId },
      { userId: session.userId, items, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, items: cart.items });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (session) {
      await connectDB();
      await Cart.findOneAndDelete({ userId: session.userId });
    }
    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
