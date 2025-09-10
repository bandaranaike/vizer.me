"use client";

import {useState} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Loader2, Briefcase} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {Toaster} from "@/components/ui/sonner";
import {toast} from "sonner";

// --- Schema ---
const ApplicationSchema = z.object({
    fullName: z.string().min(1, "Your name is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().optional(),
    linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    portfolio: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    coverLetter: z.string().optional(),
    // We'll validate resume on submit since File cannot be represented well in zod here
});

export type ApplicationValues = z.infer<typeof ApplicationSchema> & {
    resume?: File | null;
};

// --- Component ---
export default function ApplyJobDialog(
    {
        jobId,
        jobTitle,
        applyUrl = "/api/jobs/apply",
        triggerLabel = "Apply Now",
    }: {
        jobId: string | number;
        jobTitle?: string;
        applyUrl?: string;
        triggerLabel?: string;
    }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<ApplicationValues>({
        resolver: zodResolver(ApplicationSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            linkedin: "",
            github: "",
            portfolio: "",
            coverLetter: "",
        },
        mode: "onBlur",
    });

    async function onSubmit(values: ApplicationValues) {
        try {
            setLoading(true);

            // Manual validation for resume file
            const resume: File | null | undefined = values.resume as any;
            if (!resume) {
                toast.error("Please attach your resume (PDF up to 5MB).");
                return;
            }
            if (resume.type !== "application/pdf") {
                toast.error("Resume must be a PDF.");
                return;
            }
            if (resume.size > 5 * 1024 * 1024) {
                toast.error("Resume file is too large (max 5MB).");
                return;
            }

            const fd = new FormData();
            fd.append("jobId", String(jobId));
            Object.entries(values).forEach(([k, v]) => {
                if (k === "resume") return; // append separately
                if (typeof v === "string") fd.append(k, v);
            });
            fd.append("resume", resume);

            const res = await fetch(applyUrl, {
                method: "POST",
                body: fd,
            });

            if (res.ok) {
                toast.success("Application submitted!");
                form.reset();
                setOpen(false);
            } else {
                const data = await res.json().catch(() => ({}));
                const msg = data?.error || "Failed to submit application";
                toast.error(msg);
            }
        } catch (e) {
            console.error("Error submitting application", e);
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Toaster/>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-gray-900 text-white hover:bg-black">{triggerLabel}</Button>
                </DialogTrigger>
                <DialogContent className="w-[80vw] sm:max-w-4xl md:max-w-5xl p-0 gap-0">
                    {/* Card-like body to match your Create Job styling */}
                    <div className="rounded-xl bg-white shadow-sm">
                        {/* Header */}
                        <div className="p-6 pb-0">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-2xl bg-gray-900 p-3 text-white">
                                    <Briefcase className="h-5 w-5"/>
                                </div>
                                <div>
                                    <DialogHeader className="p-0">
                                        <DialogTitle className="text-2xl font-semibold">Apply
                                            for {jobTitle ?? "this job"}</DialogTitle>
                                        <DialogDescription className="text-sm text-gray-500">
                                            Send your application — we&#39;ll get back to you soon.
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="p-6">
                            <Form {...(form as any)}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Jane Doe"
                                                               className="bg-white" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="you@example.com"
                                                               className="bg-white" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Phone (optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., +94 77 123 4567"
                                                               className="bg-white" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="linkedin"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>LinkedIn (optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://linkedin.com/in/username"
                                                               className="bg-white" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="github"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>GitHub (optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://github.com/username"
                                                               className="bg-white" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="portfolio"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Portfolio (optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://your-site.com"
                                                               className="bg-white" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="coverLetter"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Cover Letter (optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Tell us why you\'re a great fit..."
                                                        className="min-h-32 bg-white"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Resume upload (PDF) */}
                                    <FormItem>
                                        <FormLabel>Resume (PDF, max 5MB)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="application/pdf"
                                                className="bg-white"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] ?? null;
                                                    (form as any).setValue("resume", file, {shouldValidate: false});
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline" className="border-gray-300">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={loading}
                                                className="bg-gray-900 text-white hover:bg-black">
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting...
                                                </>
                                            ) : (
                                                "Submit Application"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>

                        {/* Footer shadow spacer to match card feel */}
                        <DialogFooter className="hidden"/>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
