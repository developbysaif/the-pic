import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Coupon from '@/models/Coupon';
import { getSession } from '@/lib/auth/jwt';

export async function PUT(req, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updated = await Coupon.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ coupon: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update coupon' }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
