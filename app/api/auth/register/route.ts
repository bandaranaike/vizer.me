import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
    try {
        const { email, username, fullName, password } = await req.json();

        if (!email || !username || !password || !fullName) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const normalizedEmail = String(email).trim();
        const normalizedUsername = String(username).trim();

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: { equals: normalizedEmail, mode: 'insensitive' } },
                    { username: { equals: normalizedUsername, mode: 'insensitive' } },
                ],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email or username already in use' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                username: normalizedUsername,
                fullName,
                password: hashedPassword,
            },
        });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _password, ...safeUser } = user;

        const res = NextResponse.json({ message: 'User created', token, user: safeUser });
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
