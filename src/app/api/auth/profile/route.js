import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongoose';
import User from '@/models/User';
import { getSession, hashPassword, comparePassword } from '@/lib/auth/jwt';
export async function PUT(req) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await connectDB();
        const body = await req.json();
        const user = await User.findById(session.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        if (body.name)
            user.name = body.name;
        if (body.phone)
            user.phone = body.phone;
        if (body.avatar)
            user.avatar = body.avatar;
        // Password change
        if (body.newPassword) {
            if (!body.currentPassword) {
                return NextResponse.json({ error: 'Current password is required to set new password' }, { status: 400 });
            }
            const isMatch = await comparePassword(body.currentPassword, user.passwordHash);
            if (!isMatch) {
                return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
            }
            user.passwordHash = await hashPassword(body.newPassword);
        }
        // Addresses update
        if (body.addresses) {
            user.addresses = body.addresses;
        }
        await user.save();
        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                addresses: user.addresses,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
