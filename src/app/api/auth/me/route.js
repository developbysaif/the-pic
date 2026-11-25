import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import User from '@/models/User';
import { getSession } from '@/lib/auth/jwt';
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ user: null }, { status: 401 });
        }
        await connectDB();
        const user = await User.findById(session.userId)
            .select('-passwordHash')
            .lean();
        if (!user) {
            return NextResponse.json({ user: null }, { status: 404 });
        }
        return NextResponse.json({ user });
    }
    catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}
