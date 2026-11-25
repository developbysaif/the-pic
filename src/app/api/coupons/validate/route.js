import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Coupon from '@/models/Coupon';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const code = body.code;
    const amount = Number(body.subtotal ?? body.orderAmount ?? 0);

    if (!code) {
      return NextResponse.json({ error: 'Please enter a coupon code' }, { status: 400 });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 });
    }

    if (new Date(coupon.validUntil) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    if (amount < (coupon.minOrderAmount || 0)) {
      return NextResponse.json(
        {
          error: `Minimum order amount for this coupon is Rs. ${coupon.minOrderAmount.toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    const finalDiscount = Math.round(discount);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
      discount: finalDiscount,
      discountAmount: finalDiscount,
      message: `Coupon applied: Rs. ${finalDiscount.toLocaleString()} discount!`,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
