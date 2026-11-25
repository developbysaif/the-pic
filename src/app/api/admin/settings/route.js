import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import StoreSetting from '@/models/StoreSetting';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
  try {
    await connectDB();
    let settings = await StoreSetting.findOne().lean();
    if (!settings) {
      settings = await StoreSetting.create({
        siteName: 'SAGE & BOTANICA',
        announcementText:
          '🌿 Complimentary Express Delivery on all orders over Rs. 3,500 | 100% Pure Organic Extracts',
        announcementActive: true,
        freeShippingThreshold: 3500,
        shippingFee: 250,
        supportEmail: 'concierge@sageandbotanica.com',
        supportPhone: '+92 300 1234567',
        instagramUrl: 'https://instagram.com',
        heroTitle: 'Botanical Alchemy for Mind & Skin',
        heroSubtitle:
          'Crafted with cold-pressed alpine sage, organic seed elixirs, and restorative earth minerals. Made for timeless rejuvenation.',
      });
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
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

    let settings = await StoreSetting.findOne();
    if (!settings) {
      settings = new StoreSetting(body);
    } else {
      Object.assign(settings, body);
    }

    await settings.save();
    return NextResponse.json({
      message: 'Store settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
