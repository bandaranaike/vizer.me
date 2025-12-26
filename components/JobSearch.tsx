'use client';

import {useState, useEffect} from 'react';
import {MagnifyingGlassIcon, MapPinIcon} from '@heroicons/react/24/outline';
import clsx from 'clsx';

type JobSearchProps = {
    onSearched: (what: string, where: string) => void;
};

export default function JobSearch({onSearched}: JobSearchProps) {
    const [what, setWhat] = useState('');
    const [where, setWhere] = useState('');
    const [debounced, setDebounced] = useState({what: '', where: ''});

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounced({what, where});
        }, 300);

        return () => clearTimeout(handler);
    }, [what, where]);

    useEffect(() => {
        onSearched(debounced.what, debounced.where);
    }, [debounced, onSearched]);

    return (
        <div
            className={clsx(
                'flex w-full max-w-4xl divide-x mx-auto divide-gray-300 dark:divide-gray-700 rounded-full border border-gray-300 dark:border-gray-700',
                'bg-white dark:bg-gray-900'
            )}
        >
            <div className="flex items-center gap-2 px-4 py-3 w-1/2">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500"/>
                <input
                    type="text"
                    placeholder="What"
                    value={what}
                    onChange={(e) => setWhat(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none py-2 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 w-1/2">
                <MapPinIcon className="h-5 w-5 text-gray-400 dark:text-gray-500"/>
                <input
                    type="text"
                    placeholder="Where"
                    value={where}
                    onChange={(e) => setWhere(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none  py-2 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                />
            </div>
        </div>
    );
}
