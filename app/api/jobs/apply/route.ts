// app/api/jobs/apply/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// IMPORTANT: enable Node runtime (for fs; not needed if using only S3)
export const runtime = "nodejs";

// ----- Validation -----
const ApplicationSchema = z.object({
    jobId: z.string().min(1),
    fullName: z.string().min(1, "Your name is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().optional(),
    linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    portfolio: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    coverLetter: z.string().optional(),
});

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5MB

type PrismaKnownErrorLike = { code: string; meta?: { target?: string[] } };
function isPrismaKnownError(e: unknown): e is PrismaKnownErrorLike {
    return typeof e === "object" && e !== null && "code" in e;
}

// ----- Storage helpers -----
// Choose one: (A) local disk (dev) or (B) S3 (prod)
// A) Local disk (dev)
async function saveToLocalDisk(file: File, keyHint: string): Promise<string> {
    const { randomUUID } = await import("crypto");
    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");

    const uploadDir = path.join(process.cwd(), "uploads", "resumes");
    await mkdir(uploadDir, { recursive: true });

    const ext = ".pdf";
    const safeBase =
        keyHint
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, "-")
            .replace(/-{2,}/g, "-")
            .replace(/^-|-$/g, "") || "resume";

    const filename = `${safeBase}-${randomUUID()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buf);

    // Expose via /uploads if you serve it statically; otherwise store the absolute path.
    // For simplicity we return a relative path:
    return `/uploads/resumes/${filename}`;
}

// B) S3 (prod)
// Requires packages: @aws-sdk/client-s3
// and env: S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
async function saveToS3IfConfigured(file: File, keyHint: string): Promise<string | null> {
    const bucket = process.env.S3_BUCKET;
    if (!bucket) return null;

    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
        region: process.env.S3_REGION,
        credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
            ? {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
            }
            : undefined,
    });

    const { randomUUID } = await import("crypto");
    const base =
        keyHint
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, "-")
            .replace(/-{2,}/g, "-")
            .replace(/^-|-$/g, "") || "resume";
    const key = `resumes/${base}-${randomUUID()}.pdf`;

    const body = Buffer.from(await file.arrayBuffer());
    await client.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: "application/pdf",
            ACL: "private", // or "public-read" if you want a public URL
        })
    );

    // If public-read, return the public URL; otherwise store the S3 key.
    // Here we return the key so you can fetch it via signed URLs later.
    return `s3://${bucket}/${key}`;
}

// ----- Route -----
export async function POST(req: Request) {
    try {
        // Must be multipart/form-data
        const ct = req.headers.get("content-type") || "";
        if (!ct.toLowerCase().includes("multipart/form-data")) {
            return NextResponse.json({ error: "Invalid content type" }, { status: 415 });
        }

        const form = await req.formData();

        // Extract and validate text fields
        const data = {
            jobId: String(form.get("jobId") ?? ""),
            fullName: String(form.get("fullName") ?? ""),
            email: String(form.get("email") ?? ""),
            phone: form.get("phone") ? String(form.get("phone")) : undefined,
            linkedin: form.get("linkedin") ? String(form.get("linkedin")) : "",
            github: form.get("github") ? String(form.get("github")) : "",
            portfolio: form.get("portfolio") ? String(form.get("portfolio")) : "",
            coverLetter: form.get("coverLetter") ? String(form.get("coverLetter")) : undefined,
        };

        const parsed = ApplicationSchema.safeParse(data);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", issues: parsed.error.issues },
                { status: 400 }
            );
        }

        // File validation
        const file = form.get("resume");
        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Resume (PDF) is required" }, { status: 400 });
        }
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Resume must be a PDF" }, { status: 400 });
        }
        if (file.size > MAX_RESUME_BYTES) {
            return NextResponse.json({ error: "Resume must be <= 5MB" }, { status: 400 });
        }

        // Ensure job exists
        const jobIdNum = Number(parsed.data.jobId);
        if (!Number.isFinite(jobIdNum)) {
            return NextResponse.json({ error: "Invalid jobId" }, { status: 400 });
        }
        const job = await prisma.job.findUnique({ where: { id: jobIdNum } });
        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // Store resume
        const keyHint = `${parsed.data.fullName}-${parsed.data.email}`;
        let resumeUrl: string | null = null;

        // Prefer S3 if configured, else local disk
        resumeUrl = await saveToS3IfConfigured(file, keyHint);
        if (!resumeUrl) {
            resumeUrl = await saveToLocalDisk(file, keyHint);
        }

        // Create application
        const application = await prisma.application.create({
            data: {
                jobId: jobIdNum,
                fullName: parsed.data.fullName,
                email: parsed.data.email,
                phone: parsed.data.phone || null,
                linkedin: parsed.data.linkedin || null,
                github: parsed.data.github || null,
                portfolio: parsed.data.portfolio || null,
                coverLetter: parsed.data.coverLetter || null,
                resumeUrl,
            },
        });

        return NextResponse.json(application, { status: 201 });
    } catch (err: unknown) {
        if (isPrismaKnownError(err) && err.code === "P2002") {
            // Unique constraint: jobId+email
            const targets = err.meta?.target ?? [];
            if (Array.isArray(targets) && targets.includes("uniq_job_email")) {
                return NextResponse.json(
                    { error: "You’ve already applied to this job with this email." },
                    { status: 409 }
                );
            }
        }

        if (err instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", issues: err.issues },
                { status: 400 }
            );
        }

        console.error("Apply endpoint error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Optional: GET to list recent applications (admin only; protect as needed)
export async function GET() {
    const apps = await prisma.application.findMany({
        orderBy: { id: "desc" },
        take: 50,
        select: {
            id: true,
            jobId: true,
            fullName: true,
            email: true,
            createdAt: true,
            resumeUrl: true,
        },
    });
    return NextResponse.json(apps);
}
