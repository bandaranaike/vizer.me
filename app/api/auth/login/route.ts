import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
    try {
        const { identifier, password } = await req.json();

        if (!identifier || !password) {
            return NextResponse.json(
                { error: 'Email or username and password are required' },
                { status: 400 }
            );
        }

        const normalized = String(identifier).trim();

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: { equals: normalized, mode: 'insensitive' } },
                    { username: { equals: normalized, mode: 'insensitive' } },
                ],
            },
        });

        if (!user)
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );

        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _password, ...safeUser } = user;

        const res = NextResponse.json({ message: 'Login successful', token, user: safeUser });
        res.cookies.set('token', token, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return res;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
