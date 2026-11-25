import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth/jwt';
export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find({ isActive: true })
            .sort({ displayOrder: 1, name: 1 })
            .lean();
        // Attach product count to each category
        const categoriesWithCounts = await Promise.all(categories.map(async (cat) => {
            const productCount = await Product.countDocuments({
                category: cat._id,
                status: 'published',
            });
            return { ...cat, productCount };
        }));
        return NextResponse.json({ categories: categoriesWithCounts });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
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
        if (!body.slug && body.name) {
            body.slug = body.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }
        const newCategory = await Category.create(body);
        return NextResponse.json({ category: newCategory }, { status: 201 });
    }
    catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 400 });
    }
}
