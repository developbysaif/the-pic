import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { getSession } from '@/lib/auth/jwt';
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const categorySlug = searchParams.get('category');
        const sort = searchParams.get('sort') || 'newest';
        const featured = searchParams.get('featured');
        const trending = searchParams.get('trending');
        const bestSeller = searchParams.get('bestseller');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        // Build filter query
                const filter = { status: 'published' };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } },
            ];
        }
        if (categorySlug && categorySlug !== 'all') {
            const categoryDoc = await Category.findOne({ slug: categorySlug });
            if (categoryDoc) {
                filter.category = categoryDoc._id;
            }
        }
        if (featured === 'true')
            filter.featured = true;
        if (trending === 'true')
            filter.trending = true;
        if (bestSeller === 'true')
            filter.bestSeller = true;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.$gte = Number(minPrice);
            if (maxPrice)
                filter.price.$lte = Number(maxPrice);
        }
        // Build sort
                let sortQuery = { createdAt: -1 };
        if (sort === 'price-asc' || sort === 'price_asc')
            sortQuery = { price: 1 };
        if (sort === 'price-desc' || sort === 'price_desc')
            sortQuery = { price: -1 };
        if (sort === 'popularity')
            sortQuery = { rating: -1, reviewsCount: -1 };
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('category', 'name slug')
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(filter),
        ]);
        return NextResponse.json({
            products,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
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
        // Auto generate slug if missing
        if (!body.slug && body.name) {
            body.slug = body.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }
        const newProduct = await Product.create(body);
        return NextResponse.json({ product: newProduct }, { status: 201 });
    }
    catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 400 });
    }
}
