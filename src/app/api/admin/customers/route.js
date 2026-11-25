import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import User from '@/models/User';
import Order from '@/models/Order';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    await connectDB();

    const customers = await User.find({ role: 'customer' })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    // Attach order analytics to each customer
    const customersWithStats = await Promise.all(
      customers.map(async (c) => {
        const [ordersCount, totalSpentAgg] = await Promise.all([
          Order.countDocuments({ userId: c._id }),
          Order.aggregate([
            { $match: { userId: c._id, orderStatus: { $ne: 'CANCELLED' } } },
            { $group: { _id: null, total: { $sum: '$total' } } },
          ]),
        ]);

        return {
          ...c,
          ordersCount,
          totalSpent: totalSpentAgg[0]?.total || 0,
        };
      })
    );

    return NextResponse.json({ customers: customersWithStats });
  } catch (error) {
    console.error('Error fetching admin customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customer data' }, { status: 500 });
  }
}
