import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import Newsletter from '@/models/Newsletter';
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const email = body.email?.toLowerCase().trim();
        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
        }
        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return NextResponse.json({
                message: 'You are already subscribed to our private botanical circle.',
            });
        }
        await Newsletter.create({ email });
        return NextResponse.json({ message: 'Welcome to our private botanical circle! Your 10% coupon code is WELCOME10' }, { status: 201 });
    }
    catch (error) {
        console.error('Newsletter error:', error);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}
