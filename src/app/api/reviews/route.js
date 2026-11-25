import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth/jwt';
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');
                const filter = { status: 'approved' };
        if (productId)
            filter.productId = productId;
        const reviews = await Review.find(filter).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ reviews });
    }
    catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        await connectDB();
        const session = await getSession();
        const body = await req.json();
        const { productId, rating, title, comment, customerName } = body;
        if (!productId || !rating || !title || !comment) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }
        const review = await Review.create({
            productId,
            userId: session?.userId || null,
            customerName: customerName || session?.name || 'Anonymous Guest',
            rating: Number(rating),
            title,
            comment,
            verifiedPurchase: true,
            status: 'approved',
        });
        // Update product rating and reviewsCount
        const allReviews = await Review.find({ productId, status: 'approved' });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);
        await Product.findByIdAndUpdate(productId, {
            rating: parseFloat(avgRating.toFixed(1)),
            reviewsCount: allReviews.length,
        });
        return NextResponse.json({ review }, { status: 201 });
    }
    catch (error) {
        return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 400 });
    }
}
