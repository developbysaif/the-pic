import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Order from '@/models/Order';
import { getSession } from '@/lib/auth/jwt';
export async function GET(req, { params }) {
    try {
        await connectDB();
        const session = await getSession();
        const { id } = await params;
        const order = await Order.findById(id).lean();
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        // Customer can only view their own order
        if (session && session.role !== 'admin') {
            if (order.userId && order.userId.toString() !== session.userId) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }
        return NextResponse.json({ order });
    }
    catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}
export async function PUT(req, { params }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
        }
        await connectDB();
        const { id } = await params;
        const body = await req.json();
        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        // Status change with history log
        if (body.orderStatus && body.orderStatus !== order.orderStatus) {
            order.orderStatus = body.orderStatus;
            order.statusHistory.push({
                status: body.orderStatus,
                note: body.statusNote || `Order status updated to ${body.orderStatus} by Administrator.`,
                timestamp: new Date(),
            });
            if (body.orderStatus === 'DELIVERED') {
                order.actualDelivery = new Date();
            }
        }
        // Payment status change (e.g. marking COD COLLECTED)
        if (body.paymentStatus && body.paymentStatus !== order.paymentStatus) {
            order.paymentStatus = body.paymentStatus;
            order.statusHistory.push({
                status: order.orderStatus,
                note: `COD Payment status updated to ${body.paymentStatus}.`,
                timestamp: new Date(),
            });
        }
        if (body.courierCompany)
            order.courierCompany = body.courierCompany;
        if (body.trackingNumber)
            order.trackingNumber = body.trackingNumber;
        if (body.deliveryNotes)
            order.deliveryNotes = body.deliveryNotes;
        if (body.estimatedDelivery)
            order.estimatedDelivery = new Date(body.estimatedDelivery);
        await order.save();
        return NextResponse.json({
            message: 'Order updated successfully',
            order,
        });
    }
    catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
