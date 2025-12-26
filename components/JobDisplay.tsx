'use client';
import React, {useEffect, useState} from 'react';
import {formatDistanceToNow} from 'date-fns';
import {
    ClockIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import ApplyJobDialog from "@/components/jobs/ApplyJobDialog";
import axios from "axios";
import {buildUserHeaders} from '@/lib/auth-storage';

type Job = {
    id: number;
    companyLogo: string;
    title: string;
    company: string;
    createdAt: Date;
    address: string;
    shortDesc: string;
    requirements: string;
    qualifications: string;
    salary: string;
    fullDescription: string;
};

const jobs_b: Job[] = [
    {
        id: 1,
        companyLogo: '/company-logo.jpg',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        createdAt: new Date(Date.now() - 3600 * 1000), // 1 hour ago
        address: 'Colombo, Sri Lanka',
        shortDesc: 'Develop and maintain enterprise-grade applications.',
        requirements: '5+ years experience, Laravel, Node.js',
        qualifications: 'BSc in Computer Science',
        salary: '$3000 - $4000',
        fullDescription: 'Full job description goes here...',
    },
    {
        id: 2,
        companyLogo: '/company-logo.jpg',
        title: 'Full Stack Developer (React/Node.js)',
        company: 'Innovate Solutions',
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000), // 2 days ago
        address: 'Kandy, Sri Lanka',
        shortDesc: 'Building modern web applications with React and Node.js.',
        requirements: '3+ years experience, React, Node.js, Express.js, MySQL',
        qualifications: 'Degree in IT or related field',
        salary: '$2500 - $3500',
        fullDescription: 'Join our dynamic team to build cutting-edge web solutions. Experience with REST APIs and microservices is a plus.',
    },
    {
        id: 3,
        companyLogo: '/company-logo.jpg',
        title: 'Cloud Engineer (AWS)',
        company: 'CloudXperts',
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), // 5 days ago
        address: 'Galle, Sri Lanka',
        shortDesc: 'Design, implement, and manage AWS cloud infrastructure.',
        requirements: '4+ years experience, AWS (EC2, S3, RDS, Lambda), Docker, Kubernetes',
        qualifications: 'BSc in Software Engineering or AWS Certified',
        salary: '$3500 - $5000',
        fullDescription: 'Seeking an experienced Cloud Engineer to manage and optimize our AWS environments. Strong scripting skills (Python/Bash) preferred.',
    },
    {
        id: 4,
        companyLogo: '/company-logo.jpg',
        title: 'Backend Developer (Node.js/Express)',
        company: 'NextGen Tech',
        createdAt: new Date(Date.now() - 12 * 3600 * 1000), // 12 hours ago
        address: 'Colombo, Sri Lanka',
        shortDesc: 'Develop scalable backend services and APIs.',
        requirements: '2+ years experience, Node.js, Express.js, MongoDB, API Design',
        qualifications: 'Relevant certifications or proven experience',
        salary: '$2000 - $3000',
        fullDescription: 'We are looking for a passionate Backend Developer to join our growing team. Familiarity with microservices architecture is a bonus.',
    },
    {
        id: 5,
        companyLogo: '/company-logo.jpg',
        title: 'PHP Laravel Developer',
        company: 'Data Systems LK',
        createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000), // 7 days ago
        address: 'Jaffna, Sri Lanka',
        shortDesc: 'Maintain and enhance existing Laravel applications.',
        requirements: '3+ years experience, PHP, Laravel, MySQL, Vue.js (optional)',
        qualifications: 'BSc in Computer Science or equivalent',
        salary: '$2200 - $3200',
        fullDescription: 'Opportunity for an experienced Laravel developer to work on diverse projects. Good understanding of MVC patterns and RESTful APIs required.',
    },
    {
        id: 6,
        companyLogo: '/company-logo.jpg',
        title: 'Google Cloud Platform (GCP) Architect',
        company: 'GCP Professionals Inc.',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000), // 3 days ago
        address: 'Colombo, Sri Lanka',
        shortDesc: 'Lead the design and implementation of solutions on GCP.',
        requirements: '5+ years experience, GCP (Compute Engine, GKE, Cloud SQL, BigQuery), Terraform',
        qualifications: 'Google Cloud Certified - Professional Cloud Architect preferred',
        salary: '$4000 - $6000',
        fullDescription: 'Exciting role for a seasoned GCP Architect to drive cloud adoption and strategy. Experience with CI/CD pipelines is highly desirable.',
    },
    // Add more jobs as needed
];



export default function JobDisplay() {
    const [selectedJob, setSelectedJob] = useState<Job>();
    const [jobs, setJobs] = useState<Job[]>();

    useEffect(() => {
        axios.get('/api/jobs', {
            headers: buildUserHeaders(),
        }).then(r => {
            setJobs(r.data)
        })
    }, [])

    return (
        <div
            className="max-w-7xl mx-auto border border-gray-200 dark:border-gray-700 rounded-xl flex bg-white dark:bg-gray-900 font-[family-name:var(--font-geist-sans)]">
            {/* Job List */}
            <div className="w-1/3 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
                {jobs && jobs.map((job) => (
                    <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={clsx('cursor-pointer p-4 border-b border-gray-200',
                            'dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
                            'transition last:border-none first:rounded-tl-xl last:rounded-bl-xl',
                            selectedJob && selectedJob.id === job.id ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-900')}
                    >
                        <div className="flex items-center gap-3">
                            <img src={job.companyLogo} alt="Logo" className="w-10 h-10 rounded-full"/>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{job.title}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{job.company}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-4 h-4"/>
                            <span>{job.createdAt && formatDistanceToNow(job.createdAt)} ago</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <MapPinIcon className="w-4 h-4"/>
                            <span>{job.address}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{job.shortDesc}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Requirements:</strong> {job.requirements}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Qualifications:</strong> {job.qualifications}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Salary:</strong> {job.salary}
                        </p>
                    </div>
                ))}
            </div>

            {/* Job Description */}
            <div className="w-2/3 p-6">
                <div className="sticky top-6 max-h-screen overflow-y-auto pr-2">
                    {selectedJob && (
                        <div className="text-gray-800 dark:text-white">
                            <div className="flex">
                                <div className="grow-1">
                                    <h2 className="text-2xl font-bold mb-2">{selectedJob.title}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{selectedJob.company} • {selectedJob.address}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Posted {formatDistanceToNow(selectedJob.createdAt)} ago</p>
                                </div>
                                <div className="grow-0">
                                    <ApplyJobDialog jobId={selectedJob.id} jobTitle={selectedJob.title}
                                                    applyUrl={`/api/jobs/apply`}/>
                                </div>
                            </div>
                            <div className="prose dark:prose-invert max-w-none">
                                <p>{selectedJob.fullDescription}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
