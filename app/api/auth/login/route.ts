import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const res = NextResponse.json({ message: 'Login successful', token, user });
        res.cookies.set('token', token, { httpOnly: true, path: '/' });

        return res;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
