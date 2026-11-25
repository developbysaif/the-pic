import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth/jwt';
export async function PUT(req, { params }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
        }
        await connectDB();
        const { id } = await params;
        const body = await req.json();
        const updated = await Category.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        return NextResponse.json({ category: updated });
    }
    catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 400 });
    }
}
export async function DELETE(req, { params }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
        }
        await connectDB();
        const { id } = await params;
        // Safety check: Prevent deleting categories containing products
        const productCount = await Product.countDocuments({ category: id });
        if (productCount > 0) {
            return NextResponse.json({
                error: `Cannot delete category: ${productCount} active product(s) are assigned to it. Please reassign or delete these products first.`,
            }, { status: 400 });
        }
        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
