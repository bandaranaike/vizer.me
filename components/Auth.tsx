'use client';

import * as React from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    ArrowPathIcon,
    EnvelopeIcon,
    LockClosedIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import {GoogleOutlined, GithubOutlined} from '@ant-design/icons';
import {cn} from '@/lib/utils';

interface AuthFormProps
    extends React.HTMLAttributes<HTMLButtonElement | HTMLDivElement> {
    initialEmail?: string;
}

export function Auth({className, initialEmail = '', ...props}: AuthFormProps) {
    const [email, setEmail] = React.useState(initialEmail);
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [emailExists, setEmailExists] = React.useState<boolean | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const router = useRouter();

    // 🧠 Check if email already exists in DB
    async function checkEmailExists(email: string) {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email}),
            });
            const data = await res.json();
            setEmailExists(data.exists);
        } catch (error) {
            console.error('Error checking email:', error);
        } finally {
            setIsLoading(false);
        }
    }

    // 🔑 Handle register or login submit
    const loginOrRegister = async (): Promise<void> => {
        setIsLoading(true);
        setError('');
        try {
            const endpoint = emailExists ? '/api/auth/login' : '/api/auth/register';
            const payload = emailExists
                ? {email, password}
                : {email, fullName: name, password};


            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
                return;
            }

            console.log('Auth successful:', data);
            router.refresh();
            setIsOpen(false);
            resetForm();
        } catch (error) {
            setError('Authentication error:' + error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) checkEmailExists(email);
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setEmailExists(null);
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) resetForm();
            }}
        >
            <DialogTrigger asChild>
                <Button variant="link" className={className} {...props}>
                    <UserIcon width={18}/> Sign In
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {emailExists === null
                            ? 'Continue with your email'
                            : emailExists
                                ? 'Welcome back'
                                : 'Create your account'}
                    </DialogTitle>
                </DialogHeader>

                <div className={cn('grid gap-6', className)} {...props}>
                    {/* FORM */}
                    <div>
                        {emailExists === null ? (
                            // STEP 1: Ask for email
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <EnvelopeIcon
                                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                                        <Input
                                            id="email"
                                            placeholder="name@example.com"
                                            type="email"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            autoCorrect="off"
                                            disabled={isLoading}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleEmailSubmit}
                                    disabled={isLoading || !email}
                                >
                                    {isLoading && (
                                        <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin"/>
                                    )}
                                    Continue
                                </Button>
                            </div>
                        ) : (
                            // STEP 2: Show login or register fields
                            <div className="grid gap-4">
                                {!emailExists && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <div className="relative">
                                            <UserIcon
                                                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                                            <Input
                                                id="name"
                                                placeholder="Your name"
                                                type="text"
                                                autoComplete="name"
                                                disabled={isLoading}
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        {emailExists
                                            ? 'Enter your password'
                                            : 'Create a password'}
                                    </Label>
                                    <div className="relative">
                                        <LockClosedIcon
                                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                                        <Input
                                            id="password"
                                            placeholder={
                                                emailExists
                                                    ? 'Your password'
                                                    : 'Minimum 8 characters'
                                            }
                                            type="password"
                                            autoComplete={
                                                emailExists ? 'current-password' : 'new-password'
                                            }
                                            disabled={isLoading}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                {error && <div className="text-red-500 text-sm -my-2">{error}</div>}

                                <Button
                                    onClick={loginOrRegister}
                                    disabled={
                                        isLoading || !password || (!emailExists && !name)
                                    }
                                >
                                    {isLoading && (
                                        <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin"/>
                                    )}
                                    {emailExists ? 'Sign In' : 'Create Account'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t"/>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" disabled={isLoading}>
                            <GoogleOutlined className="mr-2 h-4 w-4"/>
                            Google
                        </Button>
                        <Button variant="outline" disabled={isLoading}>
                            <GithubOutlined className="mr-2 h-4 w-4"/>
                            GitHub
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
