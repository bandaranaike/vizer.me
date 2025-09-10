import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {z} from "zod";


const JobSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    location: z.string().optional().nullable(),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable(),
    salary: z.string().optional().nullable(),
    expireDate: z.string().optional().nullable(), // ISO date string or empty
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
        const json = await req.json();
        const parsed = JobSchema.parse(json);

        const job = await prisma.job.create({
            data: {
                companyName: parsed.companyName,
                location: parsed.location || null,
                title: parsed.title,
                description: parsed.description || null,
                salary: parsed.salary || null,
                postedDate: new Date(),
                expireDate: parsed.expireDate ? new Date(parsed.expireDate) : null,
                url: parsed.url,
            },
        });

        return NextResponse.json(job, {status: 201});
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return NextResponse.json(
                {error: "Validation failed", issues: err.issues},
                {status: 400}
            );
        }

        if (isPrismaKnownError(err) && err.code === "P2002") {
            const targets = err.meta?.target ?? [];
            if (Array.isArray(targets) && targets.includes("url")) {
                return NextResponse.json(
                    {error: "A job with this URL already exists."},
                    {status: 409}
                );
            }
        }

        console.error(err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

export async function GET() {
    const jobs = await prisma.job.findMany({
        orderBy: { id: "desc" },
        take: 50,
    });
    return NextResponse.json(jobs);
}

