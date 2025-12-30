'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useTheme} from 'next-themes';
import {Auth} from '@/components/Auth';
import {
    buildUserHeaders,
    clearStoredUser,
    loadStoredUser,
    saveStoredUser,
    StoredUser,
    AUTH_CHANGE_EVENT,
} from '@/lib/auth-storage';

export default function Navbar() {
    const [show, setShow] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [user, setUser] = useState<StoredUser | null>(null);
    const {theme} = useTheme();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setShow(currentScrollY < lastScrollY || currentScrollY < 50);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const handleAuthChange = () => {
            setUser(loadStoredUser());
        };

        handleAuthChange();
        window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
        return () => window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    }, []);

    useEffect(() => {
        async function hydrateUser() {
            const cachedUser = loadStoredUser();
            if (!cachedUser) {
                return;
            }

            try {
                const res = await fetch('/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...buildUserHeaders(cachedUser),
                    },
                    cache: 'no-store',
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data?.user) {
                        setUser(data.user);
                        saveStoredUser(data.user);
                    }
                } else {
                    setUser(null);
                    clearStoredUser();
                }
            } catch (error) {
                console.error('Failed to load user', error);
            }
        }

        hydrateUser();
    }, []);

    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/logout', {method: 'POST'});
        } catch (error) {
            console.error('Failed to log out', error);
        } finally {
            clearStoredUser();
            setUser(null);
            router.push('/');
        }
    };

    const displayName = user?.fullName || user?.username || user?.email;

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 font-(family-name:--font-geist-sans) ${
                show ? 'translate-y-0' : '-translate-y-full'
            } border-b border-gray-200 dark:border-gray-900 bg-white dark:bg-black shadow-md`}
        >
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    {theme === 'dark' ? (
                        <img src="/logo-dark.png" alt="Logo Dark" className="h-10"/>
                    ) : (
                        <img src="/logo-dark.png" alt="Logo Light" className="h-10"/>
                    )}
                </Link>
                <div className="flex items-center gap-4 text-sm">
                    <Link href="/jobs/new" className="text-gray-800 dark:text-gray-200 hover:underline">
                        Create Job
                    </Link>
                    {user ? (
                        <>
                            <Link href="/user" className="text-gray-800 dark:text-gray-200 hover:underline">
                                {displayName}
                            </Link>
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="text-gray-800 dark:text-gray-200 hover:underline"
                            >
                                Sign out
                            </button>
                        </>
                    ) : (
                        <Auth/>
                    )}
                </div>
            </div>
        </nav>
    );
}
