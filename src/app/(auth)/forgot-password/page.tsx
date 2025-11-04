'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ForgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: '',
        },
        mode: 'onTouched',
    });

    async function onSubmit(values: ForgotPasswordValues) {
        try {
            setLoading(true);
            setSuccess(false);

            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const json = await res.json();

            if (json?.success) {
                setSuccess(true);
                toast.success('Password reset email sent!', {
                    description: 'Please check your email for reset instructions.',
                });
            } else {
                toast.error('Failed to send reset email', {
                    description: json?.error ?? 'Please try again later.',
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

    return (
        <div className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="flex justify-center text-center py-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
                    <CardDescription className="mt-2">
                        {success
                            ? 'Check your email for reset instructions'
                            : 'Enter your email address and we\'ll send you a link to reset your password'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {success ? (
                        <div className="space-y-4 text-center">
                            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                                </p>
                            </div>
                            <div className="space-y-2 pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Didn't receive the email? Check your spam folder or try again.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSuccess(false);
                                        form.reset();
                                    }}
                                    className="w-full"
                                >
                                    Send Another Email
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push('/login')}
                                    className="w-full"
                                >
                                    Back to Login
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    autoComplete="email"
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
                                            Sending...
                                        </span>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </Button>

                                <div className="text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Remember your password?{' '}
                                        <Link href="/login" className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium">
                                            Sign in
                                        </Link>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Don't have an account?{' '}
                                        <Link href="/register" className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium">
                                            Register
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

