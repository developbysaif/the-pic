import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Must be order owner or admin
    if (session.role !== 'admin' && order.userId?.toString() !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only PENDING or CONFIRMED orders can be cancelled
    if (order.orderStatus !== 'PENDING' && order.orderStatus !== 'CONFIRMED') {
      return NextResponse.json(
        {
          error: `Order cannot be cancelled because it is already ${order.orderStatus.toLowerCase()}. Please contact customer support.`,
        },
        { status: 400 }
      );
    }

    // Restore stock to inventory
    for (const item of order.items) {
      try {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (variant) {
            variant.stock += item.quantity;
          }
          await product.save();
        }
      } catch (err) {
        console.error(`Failed to restore stock for item ${item.productId}:`, err);
      }
    }

    order.orderStatus = 'CANCELLED';
    order.statusHistory.push({
      status: 'CANCELLED',
      note: `Order cancelled by ${session.role === 'admin' ? 'Administrator' : 'Customer'}. Inventory restored.`,
      timestamp: new Date(),
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully and inventory restored',
      order,
    });
  } catch (error) {
    console.error('Order cancellation error:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
