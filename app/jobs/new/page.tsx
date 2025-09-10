"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
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
import {Toaster} from "@/components/ui/sonner";
import {toast} from "sonner"

const FormSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    location: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    salary: z.string().optional(),
    postedDate: z.string().optional(), // yyyy-mm-dd
    expireDate: z.string().optional(), // yyyy-mm-dd
    url: z.string().url("Must be a valid URL"),
});

type FormValues = z.infer<typeof FormSchema>;

export default function NewJobPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            companyName: "",
            location: "",
            title: "",
            description: "",
            salary: "",
            expireDate: "",
            url: "",
        },
        mode: "onBlur",
    });

    async function onSubmit(values: FormValues) {
        try {
            setLoading(true);
            const res = await fetch("/api/jobs", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(values),
            });

            if (res.ok) {
                toast("Your vacancy was saved.");
                router.push("/"); // adjust to wherever your list lives
            } else {
                const data = await res.json().catch(() => ({}));
                const message = data?.error || "Failed to create job";
                toast(message);
            }
        } catch (e) {
            toast.error("Network error. Please try again. ");
            console.error("Error creating job:", e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl p-6 text-gray-900 mt-20">
            <Toaster/>
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-gray-900 p-3 text-white">
                    <Briefcase className="h-5 w-5"/>
                </div>
                <div>
                    <h1 className="text-2xl font-semibold">Create Job Vacancy</h1>
                    <p className="text-sm text-gray-500">Add a new opening to your listings.</p>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., ANTlabs" className="bg-white" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Senior Node.js Engineer"
                                                   className="bg-white" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="location"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Location (optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Colombo / Remote"
                                                   className="bg-white" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Role summary, responsibilities, requirements..."
                                                  className="min-h-32 bg-white" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="salary"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Salary (optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., LKR 350,000/month"
                                                   className="bg-white" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />


                            <FormField
                                control={form.control}
                                name="expireDate"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Expire Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" className="bg-white" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="url"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Job URL (must be unique)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com/careers/job-123"
                                               className="bg-white" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-gray-300"
                                onClick={() => form.reset()}
                            >
                                Reset
                            </Button>
                            <Button type="submit" disabled={loading}
                                    className="bg-gray-900 text-white hover:bg-black">
                                {loading ? <><Loader2
                                    className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Create Job"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
