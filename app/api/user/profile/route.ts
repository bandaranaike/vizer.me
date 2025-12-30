import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
    const user = await getAuthenticatedUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
        name: user.fullName,
        age: user.age,
        location: user.location,
        gender: user.gender,
        skills: user.skills,
        education: user.education,
        experience: user.experience,
        interests: user.interests,
        bio: user.bio,
    });
}

const profileSchema = z.object({
    name: z.string().optional(),
    age: z.string().optional(),
    location: z.string().optional(),
    gender: z.string().optional(),
    skills: z.string().optional(),
    education: z.string().optional(),
    experience: z.string().optional(),
    interests: z.string().optional(),
    bio: z.string().optional(),
});

export async function PUT(req: Request) {
    const user = await getAuthenticatedUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await req.json();
        const data = profileSchema.parse(json);

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                fullName: data.name,
                age: data.age,
                location: data.location,
                gender: data.gender,
                skills: data.skills,
                education: data.education,
                experience: data.experience,
                interests: data.interests,
                bio: data.bio,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Failed to update profile', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
