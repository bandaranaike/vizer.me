import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== 'string') {
        return NextResponse.json(
            { error: 'Identifier is required', exists: false },
            { status: 400 }
        );
    }

    const normalized = identifier.trim();

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { equals: normalized, mode: 'insensitive' } },
                { username: { equals: normalized, mode: 'insensitive' } },
            ],
        },
        select: { id: true, email: true, username: true },
    });

    const type = normalized.includes('@') ? 'email' : 'username';

    return NextResponse.json({ exists: !!user, type });
}
