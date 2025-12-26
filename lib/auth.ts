import {cookies} from 'next/headers';
import jwt from 'jsonwebtoken';
import {prisma} from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

type TokenPayload = {
    id: number;
    email: string;
    iat?: number;
    exp?: number;
};

export async function getAuthenticatedUser() {
    const token = (await cookies()).get('token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        if (!decoded?.id) {
            return null;
        }

        return await prisma.user.findUnique({
            where: {id: decoded.id},
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                createdAt: true,
            },
        });
    } catch (error) {
        console.error('Failed to verify auth token', error);
        return null;
    }
}
