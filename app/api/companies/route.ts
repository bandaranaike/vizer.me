import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET: list all companies
export async function GET() {
    const companies = await prisma.company.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
    return NextResponse.json(companies);
}

// POST: create a new company
export async function POST(req: Request) {
    try {
        const json = await req.json();
        const schema = z.object({
            name: z.string().min(1, "Name is required"),
            address: z.string().optional().nullable(),
            logo: z.string().optional().nullable(),
        });
        const parsed = schema.parse(json);

        // Avoid duplicates by name
        const existing = await prisma.company.findFirst({
            where: { name: parsed.name },
        });
        if (existing) return NextResponse.json(existing);

        const company = await prisma.company.create({
            data: {
                name: parsed.name,
                address: parsed.address || null,
                logo: parsed.logo || "",
                ownerId: 1, // TODO: replace with logged-in user's ID when auth is added
            },
        });

        return NextResponse.json(company, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "Failed to create company" },
            { status: 500 }
        );
    }
}
