import {useState, useEffect} from "react";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Loader2} from "lucide-react";
import { debounce } from "lodash";


interface Company {
    id: string;
    name: string;
    locations: string[];
}

interface FormData {
    title: string;
    company: string;
    location: string;
    description: string;
    salary: string;
    expireDate: string;
}

interface FormErrors {
    title?: string;
    company?: string;
    location?: string;
    description?: string;
    salary?: string;
    expireDate?: string;
}


interface Props {
    userId: string;
    onSubmit: (data: any) => Promise<void>;
}

export default function JobCreatePopup({userId, onSubmit}: Props) {
    const [open, setOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<string>("");
    const [companies, setCompanies] = useState<Company[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [formData, setFormData] = useState<FormData>({
        title: "",
        company: "",
        location: "",
        description: "",
        salary: "",
        expireDate: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await fetch(`/api/companies?userId=${userId}`);
                const data = await res.json();
                setCompanies(data);
            } catch (error) {
                console.error("Failed to fetch companies", error);
            }
        };
        fetchCompanies();
    }, [userId]);

    useEffect(() => {
        const company = companies.find((c) => c.id === selectedCompany);
        setLocations(company ? company.locations : []);
    }, [selectedCompany, companies]);

    const handleChange = debounce((field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
    }, 300);

    const validate = () => {
        const newErrors: any = {};
        if (!formData.title) newErrors.title = "Title is required.";
        if (!formData.company) newErrors.company = "Company is required.";
        if (!formData.location) newErrors.location = "Location is required.";
        if (!formData.description) newErrors.description = "Description is required.";
        if (!formData.salary) newErrors.salary = "Salary is required.";
        if (!formData.expireDate) newErrors.expireDate = "Expire date is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
        setOpen(false);
        setFormData({title: "", company: "", location: "", description: "", salary: "", expireDate: ""});
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create Job</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogTitle>Create Job</DialogTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Title</Label>
                        <Input value={formData.title} onChange={(e) => handleChange("title", e.target.value)}/>
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div>
                        <Label>Company</Label>
                        <Select onValueChange={(value) => {
                            setSelectedCompany(value);
                            handleChange("company", value);
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select company"/>
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
                    </div>

                    <div>
                        <Label>Location</Label>
                        <Select disabled={!locations.length} onValueChange={(value) => handleChange("location", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select location"/>
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((loc, i) => (
                                    <SelectItem key={i} value={loc}>{loc}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                    </div>

                    <div>
                        <Label>Salary</Label>
                        <Input value={formData.salary} onChange={(e) => handleChange("salary", e.target.value)}/>
                        {errors.salary && <p className="text-sm text-red-500">{errors.salary}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea value={formData.description}
                                  onChange={(e) => handleChange("description", e.target.value)}/>
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <Label>Expire Date</Label>
                        <Input type="date" value={formData.expireDate}
                               onChange={(e) => handleChange("expireDate", e.target.value)}/>
                        {errors.expireDate && <p className="text-sm text-red-500">{errors.expireDate}</p>}
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : "Submit"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
