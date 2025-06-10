'use client'

import {useEffect, useState} from 'react'
import axios from 'axios'

type JobStatus =
    | 'No response'
    | 'Called'
    | 'First interview'
    | 'Second interview'
    | 'Third interview'
    | 'HR interview'
    | 'Done test'
    | 'Got hired'

interface AppliedJob {
    id: number
    companyName: string
    jobTitle: string
    appliedOn: string
    status: JobStatus
    updatedAt: string
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<AppliedJob[]>([])

    useEffect(() => {
        axios.get('/api/user/applied-jobs').then((res) => {
            setJobs(res.data)
        })
    }, [])

    return (
        <div className="max-w-7xl mx-auto p-6 mt-18 space-y-6 text-gray-800 dark:text-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Applied Jobs</h2>
            <div className="overflow-x-auto rounded-xl border dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <tr>
                        <th className="px-4 py-3 text-left">Company Name</th>
                        <th className="px-4 py-3 text-left">Job Title</th>
                        <th className="px-4 py-3 text-left">Applied On</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Last Updated</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 text-sm divide-y divide-gray-100 dark:divide-gray-800">
                    {jobs.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                                No applications yet.
                            </td>
                        </tr>
                    )}
                    {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-4 py-3">{job.companyName}</td>
                            <td className="px-4 py-3">{job.jobTitle}</td>
                            <td className="px-4 py-3">{new Date(job.appliedOn).toLocaleDateString()}</td>
                            <td className="px-4 py-3">{job.status}</td>
                            <td className="px-4 py-3">{new Date(job.updatedAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
