'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { UserIcon } from '@heroicons/react/24/outline';
import { Auth } from '@/components/Auth';

export default function Navbar() {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShow(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 font-[family-name:var(--font-geist-sans)] ${
        show ? 'translate-y-0' : '-translate-y-full'
      } border-b border-gray-200 dark:border-gray-900 bg-white dark:bg-black shadow-md`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {theme === 'dark' ? (
            <img src="/logo-dark.png" alt="Logo Dark" className="h-10" />
          ) : (
            <img src="/logo-dark.png" alt="Logo Light" className="h-10" />
          )}
        </Link>
        <div className="space-x-4 text-sm">
          <Link href="#" className="text-gray-800 dark:text-gray-200 hover:underline">
            <Auth />
          </Link>
        </div>
      </div>
    </nav>
  );
}
