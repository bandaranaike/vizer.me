import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth";

const JobSchema = z.object({
    companyId: z.number().int().positive("Company ID is required"), // must exist
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    salary: z.string().optional().nullable(),
    expireDate: z.string().optional().nullable(), // ISO string
    url: z.string().url("Must be a valid URL"),
});

type PrismaKnownErrorLike = {
    code: string;
    meta?: { target?: string[] };
};

function isPrismaKnownError(e: unknown): e is PrismaKnownErrorLike {
    return typeof e === "object" && e !== null && "code" in e;
}

export async function POST(req: Request) {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const json = await req.json();
        const parsed = JobSchema.parse(json);

        // Ensure company exists before creating job
        const company = await prisma.company.findUnique({
            where: { id: parsed.companyId },
        });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 }
            );
        }

        const job = await prisma.job.create({
            data: {
                companyId: parsed.companyId,
                title: parsed.title,
                description: parsed.description || null,
                location: parsed.location || null,
                salary: parsed.salary || null,
                postedDate: new Date(),
                expireDate: parsed.expireDate ? new Date(parsed.expireDate) : null,
                url: parsed.url,
            },
            include: {
                company: true, // include company info for convenience
            },
        });

        return NextResponse.json(job, { status: 201 });
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", issues: err.issues },
                { status: 400 }
            );
        }

        if (isPrismaKnownError(err) && err.code === "P2002") {
            const targets = err.meta?.target ?? [];
            if (Array.isArray(targets) && targets.includes("url")) {
                return NextResponse.json(
                    { error: "A job with this URL already exists." },
                    { status: 409 }
                );
            }
        }

        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    const jobs = await prisma.job.findMany({
        orderBy: { id: "desc" },
        take: 50,
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    address: true,
                },
            },
        },
    });

    return NextResponse.json(jobs);
}
