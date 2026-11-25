import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth/jwt';

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const lowStockOnly = searchParams.get('lowStock') === 'true';
    const threshold = Number(searchParams.get('threshold')) || 20;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { SKU: { $regex: search, $options: 'i' } },
      ];
    }
    if (lowStockOnly) {
      query.stock = { $lte: threshold };
    }

    const items = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ stock: 1 })
      .lean();

    const lowStockCount = await Product.countDocuments({ stock: { $lte: threshold } });
    const totalStockUnits = items.reduce((acc, p) => acc + (p.stock || 0), 0);

    return NextResponse.json({
      items,
      lowStockCount,
      totalStockUnits,
      totalCount: items.length,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { productId, stock, sku } = body;

    if (!productId || typeof stock !== 'number') {
      return NextResponse.json({ error: 'Product ID and numeric stock quantity are required' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    product.stock = Math.max(0, Math.floor(stock));
    if (sku) product.SKU = sku;

    // Synchronize primary variant stock
    if (product.variants && product.variants.length > 0) {
      product.variants[0].stock = product.stock;
      if (sku) product.variants[0].sku = sku;
    }

    await product.save();

    return NextResponse.json({
      message: 'Product inventory updated successfully',
      product,
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
