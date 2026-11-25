import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import StoreSetting from '@/models/StoreSetting';
import { getSession } from '@/lib/auth/jwt';
import { sendOrderConfirmationEmail } from '@/lib/email/mailer';
export async function GET(req) {
    try {
        await connectDB();
        const session = await getSession();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const orderNumber = searchParams.get('orderNumber');
        // If orderNumber is specified directly (e.g. tracking or confirmation)
        if (orderNumber) {
            const order = await Order.findOne({ orderNumber }).lean();
            if (!order) {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }
            return NextResponse.json({ order });
        }
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
                const filter = {};
        // Customer only sees their own orders
        if (session.role !== 'admin') {
            filter.userId = session.userId;
        }
        if (status && status !== 'all') {
            filter.orderStatus = status;
        }
        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customerDetails.name': { $regex: search, $options: 'i' } },
                { 'customerDetails.phone': { $regex: search, $options: 'i' } },
            ];
        }
        const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ orders });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        await connectDB();
        const session = await getSession();
        const body = await req.json();
        const { customerDetails, shippingAddress, items, couponCode } = body;
        if (!customerDetails || !customerDetails.name || !customerDetails.phone) {
            return NextResponse.json({ error: 'Customer name and phone number are required for Cash on Delivery' }, { status: 400 });
        }
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
            return NextResponse.json({ error: 'Complete delivery address and city are required' }, { status: 400 });
        }
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
        }
        // 1. Server-side validation of products, prices, and stock
        let subtotal = 0;
                const validatedItems = [];
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product || product.status !== 'published') {
                return NextResponse.json({ error: `Product "${item.title}" is no longer available` }, { status: 400 });
            }
            // Check variant price & stock
            const variant = product.variants.find((v) => v.id === item.variantId);
            const itemPrice = variant
                ? (variant.salePrice || variant.price)
                : (product.salePrice || product.price);
            const availableStock = variant ? variant.stock : product.stock;
            if (availableStock < item.quantity) {
                return NextResponse.json({
                    error: `Insufficient stock for ${product.name} (${variant?.name || 'Standard'}). Only ${availableStock} units left.`,
                }, { status: 400 });
            }
            // Safe stock deduction
            if (variant) {
                variant.stock -= item.quantity;
            }
            product.stock -= item.quantity;
            await product.save();
            subtotal += itemPrice * item.quantity;
            validatedItems.push({
                productId: product._id,
                variantId: item.variantId,
                title: product.name,
                variantName: variant?.name || 'Standard Edition',
                image: variant?.image || product.images[0] || '/images/products/serum-main.jpg',
                price: itemPrice,
                quantity: item.quantity,
                sku: variant?.sku || product.SKU,
                slug: product.slug,
            });
        }
        // 2. Fetch shipping settings
        const settings = await StoreSetting.findOne().lean();
        const threshold = settings?.freeShippingThreshold || 3500;
        const baseShipping = settings?.shippingFee || 250;
        const shippingFee = subtotal >= threshold ? 0 : baseShipping;
        // 3. Server-side discount / coupon calculation
        let discount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase().trim(),
                isActive: true,
            });
            if (coupon && new Date(coupon.validUntil) > new Date() && subtotal >= coupon.minOrderAmount) {
                if (coupon.discountType === 'percentage') {
                    discount = (subtotal * coupon.value) / 100;
                    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                        discount = coupon.maxDiscount;
                    }
                }
                else {
                    discount = coupon.value;
                }
                // Increment usage
                coupon.usageCount += 1;
                await coupon.save();
            }
        }
        const total = Math.max(0, subtotal - discount + shippingFee);
        // 4. Generate unique human-readable order number: SB-2026-XXXX
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `SB-2026-${randomSuffix}`;
        // 5. Estimated Delivery calculation (3 days from now)
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
        // 6. Create Order document
        const newOrder = await Order.create({
            orderNumber,
            userId: session?.userId || null,
            customerDetails: {
                name: customerDetails.name,
                email: customerDetails.email,
                phone: customerDetails.phone,
            },
            shippingAddress: {
                street: shippingAddress.street,
                city: shippingAddress.city,
                state: shippingAddress.state || 'Punjab',
                postalCode: shippingAddress.postalCode || '54000',
                country: shippingAddress.country || 'Pakistan',
                notes: shippingAddress.notes || '',
            },
            items: validatedItems,
            subtotal,
            discount,
            shippingFee,
            total,
            couponCode: discount > 0 ? couponCode : undefined,
            paymentMethod: 'COD',
            paymentStatus: 'PENDING',
            orderStatus: 'PENDING',
            estimatedDelivery,
            courierCompany: 'TCS Express Courier',
            statusHistory: [
                {
                    status: 'PENDING',
                    note: 'Order successfully placed via Cash on Delivery (COD).',
                    timestamp: new Date(),
                },
            ],
        });
        // Trigger asynchronous email confirmation
        sendOrderConfirmationEmail(newOrder).catch((e) =>
          console.error('Email dispatch error:', e)
        );

        return NextResponse.json({
            message: 'Order placed successfully',
            orderNumber: newOrder.orderNumber,
            orderId: newOrder._id,
            order: newOrder,
        }, { status: 201 });
    }
    catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
    }
}
