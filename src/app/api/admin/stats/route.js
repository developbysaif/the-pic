import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { getSession } from '@/lib/auth/jwt';
export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
        }
        await connectDB();
        const [totalProducts, totalCustomers, totalOrders, orders, lowStockProducts,] = await Promise.all([
            Product.countDocuments(),
            User.countDocuments({ role: 'customer' }),
            Order.countDocuments(),
            Order.find().lean(),
            Product.find({ stock: { $lte: 20 } }).select('name stock price SKU images').lean(),
        ]);
        // Calculate real revenue from delivered/collected orders
        let totalSales = 0;
        let pendingOrders = 0;
        let confirmedOrders = 0;
        let processingOrders = 0;
        let dispatchedOrders = 0;
        let deliveredOrders = 0;
        let cancelledOrders = 0;
        for (const order of orders) {
            if (order.orderStatus !== 'CANCELLED') {
                totalSales += order.total || 0;
            }
            if (order.orderStatus === 'PENDING')
                pendingOrders++;
            if (order.orderStatus === 'CONFIRMED')
                confirmedOrders++;
            if (order.orderStatus === 'PROCESSING')
                processingOrders++;
            if (order.orderStatus === 'DISPATCHED' || order.orderStatus === 'OUT_FOR_DELIVERY')
                dispatchedOrders++;
            if (order.orderStatus === 'DELIVERED')
                deliveredOrders++;
            if (order.orderStatus === 'CANCELLED')
                cancelledOrders++;
        }
        // Monthly revenue aggregation
        const monthlyRevenue = {};
        for (const o of orders) {
            if (o.orderStatus !== 'CANCELLED') {
                const d = new Date(o.createdAt);
                const key = d.toLocaleString('default', { month: 'short' });
                monthlyRevenue[key] = (monthlyRevenue[key] || 0) + o.total;
            }
        }
        return NextResponse.json({
            metrics: {
                totalSales,
                totalOrders,
                totalCustomers,
                totalProducts,
                pendingOrders,
                confirmedOrders,
                processingOrders,
                dispatchedOrders,
                deliveredOrders,
                cancelledOrders,
                lowStockCount: lowStockProducts.length,
            },
            lowStockProducts,
            monthlyRevenue,
            recentOrders: orders.slice(0, 8),
        });
    }
    catch (error) {
        console.error('Error calculating admin stats:', error);
        return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
    }
}
