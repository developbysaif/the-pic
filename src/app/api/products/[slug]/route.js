import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth/jwt';
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { slug } = await params;
        const product = await Product.findOne({ slug })
            .populate('category', 'name slug description')
            .lean();
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        // Also fetch related products in same category
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            status: 'published',
        })
            .limit(4)
            .lean();
        return NextResponse.json({ product, relatedProducts });
    }
    catch (error) {
        console.error('Error fetching product by slug:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}
export async function PUT(req, { params }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
        }
        await connectDB();
        const { slug } = await params;
        const body = await req.json();
        const updated = await Product.findOneAndUpdate({ slug }, body, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ product: updated });
    }
    catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 400 });
    }
}
export async function DELETE(req, { params }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
        }
        await connectDB();
        const { slug } = await params;
        const deleted = await Product.findOneAndDelete({ slug });
        if (!deleted) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
