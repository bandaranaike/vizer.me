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
    company: Company;
    postedDate: Date;
    address: string;
    shortDesc: string;
    requirements: string;
    qualifications: string;
    salary: string;
    description: string;
};

type Company = {
    id: number;
    name: string;
    logo: string;
    address: string;
}

export default function JobDisplay() {
    const [selectedJob, setSelectedJob] = useState<Job>();
    const [jobs, setJobs] = useState<Job[]>();

    useEffect(() => {
        axios.get('/api/jobs', {
            headers: buildUserHeaders(),
        }).then(r => {
            console.log(r.data)
            setJobs(r.data)
            setSelectedJob(r.data[0])
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
                            <img src={job.company.logo} alt="Logo" className="w-10 h-10 rounded-full"/>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{job.title}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{job.company.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-4 h-4"/>
                            <span>{job.postedDate && formatDistanceToNow(job.postedDate)} ago</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <MapPinIcon className="w-4 h-4"/>
                            <span>{job.company.address}</span>
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
                                <div className="grow">
                                    <h2 className="text-2xl font-bold mb-2">{selectedJob.title}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{selectedJob.company.name} • {selectedJob.company.address}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Posted {formatDistanceToNow(selectedJob.postedDate)} ago</p>
                                </div>
                                <div className="grow-0">
                                    <ApplyJobDialog jobId={selectedJob.id} jobTitle={selectedJob.title}
                                                    applyUrl={`/api/jobs/apply`}/>
                                </div>
                            </div>
                            <div className="prose dark:prose-invert max-w-none">
                                <p>{selectedJob.description}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
