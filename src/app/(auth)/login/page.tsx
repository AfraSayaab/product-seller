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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
const LoginSchema = z.object({
    usernameOrEmail: z.string().min(3, 'Enter your username or email'),
    password: z.string().min(8, 'Minimum 8 characters'),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<LoginValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            usernameOrEmail: '',
            password: '',
        },
        mode: 'onTouched',
    });

    async function onSubmit(values: LoginValues) {
        try {
            setLoading(true);

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const json = await res.json();

            if (json?.success) {
                toast.success('Welcome back!', {
                    description: 'Redirecting to your dashboard…',
                });
                router.push('/user');
            } else {
                toast.error('Login failed', {
                    description: json?.error ?? 'Invalid credentials.',
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
        <div className="min-h-screen grid place-items-center px-4 py-10">
            <Card className="w-full max-w-md">
                <CardHeader className="flex justify-center text-center py-2">
                    <CardTitle>Welcome back</CardTitle>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="usernameOrEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email or Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="you@example.com"
                                                autoComplete="username"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="********"
                                                autoComplete="current-password"
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
                                        Signing in…
                                    </span>
                                ) : (
                                    'Login'
                                )}
                            </Button>

                            <div className="text-center space-y-2">
                                <p className="text-sm">
                                    <a href="/forgot-password" className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium">
                                        Forgot password?
                                    </a>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Don't have an account?{' '}
                                    <a className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium" href="/register">
                                        Register
                                    </a>
                                </p>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
