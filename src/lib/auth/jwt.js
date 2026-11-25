import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'super_secret_sage_botanica_jwt_key_2026_98741352');
export async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}
export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export async function signToken(payload) {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(SECRET_KEY);
}
export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload;
    }
    catch (error) {
        return null;
    }
}
export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('sage_auth_token')?.value;
    if (!token)
        return null;
    return verifyToken(token);
}
export async function setAuthCookie(token) {
    const cookieStore = await cookies();
    cookieStore.set('sage_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
    });
}
export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('sage_auth_token');
}
