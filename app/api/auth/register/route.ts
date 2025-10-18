import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma'; // adjust to your path

export async function POST(req: Request) {
    try {
        const { email, fullName, password } = await req.json();

        if (!email || !password || !fullName)
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser)
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, fullName, password: hashedPassword },
        });

        return NextResponse.json({ message: 'User created', user });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
