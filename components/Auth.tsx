'use client';

import React from 'react';
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
import {cn} from '@/lib/utils';
import {saveStoredUser} from '@/lib/auth-storage';
import {GithubOutlined, GoogleOutlined} from "@ant-design/icons";

interface AuthFormProps
    extends React.HTMLAttributes<HTMLButtonElement | HTMLDivElement> {
    initialEmail?: string;
}

export function Auth({className, initialEmail = '', ...props}: AuthFormProps) {
    const [identifier, setIdentifier] = React.useState(initialEmail);
    const [registerEmail, setRegisterEmail] = React.useState(initialEmail);
    const [username, setUsername] = React.useState('');
    const [fullName, setFullName] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [identifierExists, setIdentifierExists] = React.useState<boolean | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const router = useRouter();

    const resetForm = React.useCallback(() => {
        setIdentifier(initialEmail);
        setRegisterEmail(initialEmail);
        setUsername('');
        setFullName('');
        setPassword('');
        setError('');
        setIdentifierExists(null);
        setIsLoading(false);
    }, [initialEmail]);

    // 🧠 Check if the identifier already exists in DB
    const checkIdentifierExists = React.useCallback(
        async (value: string) => {
            const trimmed = value.trim();
            if (!trimmed) return;

            setIsLoading(true);
            setError('');
            try {
                const res = await fetch('/api/auth/check-email', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({identifier:
                        trimmed}),
                });
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Unable to verify your details.');
                    return;
                }

                setIdentifierExists(data.exists);
                if (!data.exists) {
                    const looksLikeEmail = trimmed.includes('@');
                    setRegisterEmail(looksLikeEmail ? trimmed : '');
                    setUsername(!looksLikeEmail ? trimmed : '');
                    setFullName('');
                } else {
                    setRegisterEmail('');
                    setUsername('');
                    setFullName('');
                }
            } catch (err) {
                console.error('Error checking identifier:', err);
                setError('Unable to verify your details. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // 🔑 Handle register or login submit
    const loginOrRegister = React.useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const endpoint = identifierExists ? '/api/auth/login' : '/api/auth/register';
            const payload = identifierExists
                ? {identifier: identifier.trim(), password}
                : {
                    email: registerEmail.trim(),
                    username: username.trim(),
                    fullName: fullName.trim(),
                    password,
                };

            if (!identifierExists) {
                if (!payload.email || !payload.username || !fullName.trim()) {
                    setError('Please complete all registration fields.');
                    setIsLoading(false);
                    return;
                }
            }

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

            if (data?.user) {
                saveStoredUser(data.user);
            }
            router.refresh();
            setIsOpen(false);
            resetForm();
        } catch (err) {
            setError('Authentication error: ' + err);
        } finally {
            setIsLoading(false);
        }
    }, [identifierExists, identifier, password, registerEmail, username, fullName, router, resetForm]);

    const handleIdentifierSubmit = () => {
        if (identifier.trim()) {
            checkIdentifierExists(identifier).then(r => console.log(r));
        }
    };

    const startOver = () => {
        setIdentifierExists(null);
        setPassword('');
        setError('');
        setFullName('');
        setUsername('');
        const looksLikeEmail = identifier.includes('@');
        setRegisterEmail(looksLikeEmail ? identifier : '');
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open: boolean) => {
                setIsOpen(open);
                if (!open) resetForm();
            }}
        >
            <DialogTrigger asChild>
                <Button variant="link" className={className} {...props}>
                    <UserIcon width={18}/> Sign In
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>
                        {identifierExists === null
                            ? 'Continue with your email or username'
                            : identifierExists
                                ? 'Welcome back'
                                : 'Create your account'}
                    </DialogTitle>
                </DialogHeader>

                <div className={cn('grid gap-6', className)} {...props}>
                    {/* FORM */}
                    <div>
                        {identifierExists === null ? (
                            // STEP 1: Ask for identifier
                            <form className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="identifier">Email or Username</Label>
                                    <div className="relative">
                                        <EnvelopeIcon
                                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                                        <Input
                                            id="identifier"
                                            placeholder="you@example.com or johndoe"
                                            type="text"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            autoCorrect="off"
                                            disabled={isLoading}
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                {error && <div className="text-red-500 text-sm -my-2">{error}</div>}
                                <Button
                                    type="button"
                                    onClick={handleIdentifierSubmit}
                                    disabled={isLoading || !identifier.trim()}
                                >
                                    {isLoading && (
                                        <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin"/>
                                    )}
                                    Continue
                                </Button>
                            </form>
                        ) : (
                            // STEP 2: Show login or register fields
                            <div className="grid gap-4">
                                {!identifierExists && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            <div className="relative">
                                                <UserIcon
                                                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                                                <Input
                                                    id="fullName"
                                                    placeholder="Your name"
                                                    type="text"
                                                    autoComplete="name"
                                                    disabled={isLoading}
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="username">Username</Label>
                                            <Input
                                                id="username"
                                                placeholder="Choose a unique username"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="registerEmail">Email</Label>
                                            <Input
                                                id="registerEmail"
                                                placeholder="name@example.com"
                                                type="email"
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                                value={registerEmail}
                                                onChange={(e) => setRegisterEmail(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        {identifierExists
                                            ? `Password for ${identifier}`
                                            : 'Create a password'}
                                    </Label>
                                    <div className="relative">
                                        <LockClosedIcon
                                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                                        <Input
                                            id="password"
                                            placeholder={
                                                identifierExists
                                                    ? 'Your password'
                                                    : 'Minimum 8 characters'
                                            }
                                            type="password"
                                            autoComplete={
                                                identifierExists ? 'current-password' : 'new-password'
                                            }
                                            disabled={isLoading}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                {error && <div className="text-red-500 text-sm -my-2">{error}</div>}

                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="px-0"
                                        onClick={startOver}
                                        disabled={isLoading}
                                    >
                                        Use a different email or username
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={loginOrRegister}
                                        disabled={
                                            isLoading ||
                                            !password ||
                                            (!identifierExists &&
                                                (!fullName.trim() ||
                                                    !username.trim() ||
                                                    !registerEmail.trim()))
                                        }
                                    >
                                        {isLoading && (
                                            <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin"/>
                                        )}
                                        {identifierExists ? 'Sign In' : 'Create Account'}
                                    </Button>
                                </div>
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
