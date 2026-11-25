import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ wishlist: [], items: [] });
    }

    await connectDB();
    const doc = await Wishlist.findOne({ userId: session.userId })
      .populate({
        path: 'products',
        match: { status: 'published' },
        populate: { path: 'category', select: 'name slug' },
      })
      .lean();

    const items = doc?.products || [];
    return NextResponse.json({ wishlist: items, items });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { productId, syncProducts } = body;

    if (!session) {
      // Guest session - acknowledge without persisting to user record
      return NextResponse.json({ success: true, message: 'Guest wishlist updated locally' });
    }

    await connectDB();

    let userWishlist = await Wishlist.findOne({ userId: session.userId });
    if (!userWishlist) {
      userWishlist = new Wishlist({ userId: session.userId, products: [] });
    }

    // Sync guest wishlist items upon customer login
    if (Array.isArray(syncProducts) && syncProducts.length > 0) {
      for (const pId of syncProducts) {
        const idStr = typeof pId === 'object' ? pId._id : pId;
        if (idStr && !userWishlist.products.some((p) => p.toString() === idStr.toString())) {
          userWishlist.products.push(idStr);
        }
      }
      await userWishlist.save();
    }

    let isInWishlist = false;
    // Toggle single product if provided
    if (productId) {
      const existsIndex = userWishlist.products.findIndex(
        (p) => p.toString() === productId.toString()
      );
      if (existsIndex > -1) {
        userWishlist.products.splice(existsIndex, 1);
        isInWishlist = false;
      } else {
        userWishlist.products.push(productId);
        isInWishlist = true;
      }
      await userWishlist.save();
    }

    const populated = await Wishlist.findById(userWishlist._id)
      .populate({
        path: 'products',
        match: { status: 'published' },
        populate: { path: 'category', select: 'name slug' },
      })
      .lean();

    const items = populated?.products || [];
    return NextResponse.json({
      success: true,
      isInWishlist,
      wishlist: items,
      items,
    });
  } catch (error) {
    console.error('Error modifying wishlist:', error);
    return NextResponse.json({ error: 'Failed to modify wishlist' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    let productId = searchParams.get('productId');

    if (!productId) {
      const body = await req.json().catch(() => ({}));
      productId = body?.productId;
    }

    if (!productId) {
      await Wishlist.findOneAndDelete({ userId: session.userId });
      return NextResponse.json({ success: true, message: 'Wishlist cleared' });
    }

    const userWishlist = await Wishlist.findOne({ userId: session.userId });
    if (userWishlist) {
      userWishlist.products = userWishlist.products.filter(
        (p) => p.toString() !== productId.toString()
      );
      await userWishlist.save();
    }

    return NextResponse.json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to delete from wishlist' }, { status: 500 });
  }
}
