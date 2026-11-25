import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Order from '@/models/Order';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Customer requested return / exchange';

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Must be order owner or admin
    if (session.role !== 'admin' && order.userId?.toString() !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Must be DELIVERED to request a return
    if (order.orderStatus !== 'DELIVERED') {
      return NextResponse.json(
        {
          error: `Returns can only be requested for delivered orders. Current status: ${order.orderStatus}`,
        },
        { status: 400 }
      );
    }

    order.orderStatus = 'RETURN_REQUESTED';
    order.statusHistory.push({
      status: 'RETURN_REQUESTED',
      note: `Return requested by customer. Reason: ${reason}`,
      timestamp: new Date(),
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Return request submitted successfully. Concierge team will review.',
      order,
    });
  } catch (error) {
    console.error('Error submitting return request:', error);
    return NextResponse.json({ error: 'Failed to submit return request' }, { status: 500 });
  }
}
