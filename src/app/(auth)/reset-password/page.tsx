'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

const ResetPasswordSchema = z
    .object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(8, 'Please confirm your password'),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;

function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            toast.error('Invalid reset link', {
                description: 'Please use the link from your email.',
            });
            router.push('/forgot-password');
        } else {
            setToken(tokenParam);
        }
    }, [searchParams, router]);

    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        mode: 'onTouched',
    });

    async function onSubmit(values: ResetPasswordValues) {
        if (!token) {
            toast.error('Reset token missing', {
                description: 'Please use the link from your email.',
            });
            return;
        }

        try {
            setLoading(true);
            setSuccess(false);

            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    ...values,
                }),
            });

            const json = await res.json();

            if (json?.success) {
                setSuccess(true);
                toast.success('Password reset successfully!', {
                    description: 'You can now sign in with your new password.',
                });
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                toast.error('Failed to reset password', {
                    description: json?.error ?? 'The reset link may have expired. Please request a new one.',
                });
            }
        } catch (err) {
            toast.error('Network error', {
                description: 'Please check your connection and try again.',
            });
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="flex justify-center text-center py-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-green-600 dark:text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
                    <CardDescription className="mt-2">
                        {success
                            ? 'Password reset successful! Redirecting to login...'
                            : 'Enter your new password below'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {success ? (
                        <div className="space-y-4 text-center">
                            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    Your password has been successfully reset. You can now sign in with your new password.
                                </p>
                            </div>
                            <Button
                                onClick={() => router.push('/login')}
                                className="w-full"
                            >
                                Go to Login
                            </Button>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter new password"
                                                    autoComplete="new-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    autoComplete="new-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <span className="inline-flex items-center gap-2">
                                            <svg
                                                className="h-4 w-4 animate-spin"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                            Resetting...
                                        </span>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </Button>

                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Remember your password?{' '}
                                        <Link href="/login" className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium">
                                            Sign in
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


export default function Page() {
  return (
    <Suspense fallback={<div>Loading listings…</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}