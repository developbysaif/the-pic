import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Coupon from '@/models/Coupon';
import { getSession } from '@/lib/auth/jwt';
export async function GET() {
    try {
        await connectDB();
        const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
        return NextResponse.json({ coupons });
    }
    catch (error) {
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
        }
        await connectDB();
        const body = await req.json();
        const newCoupon = await Coupon.create({
            code: body.code.toUpperCase().trim(),
            discountType: body.discountType || 'percentage',
            value: Number(body.value),
            minOrderAmount: Number(body.minOrderAmount || 0),
            maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
            validUntil: new Date(body.validUntil),
            isActive: body.isActive ?? true,
        });
        return NextResponse.json({ coupon: newCoupon }, { status: 201 });
    }
    catch (error) {
        return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 400 });
    }
}
