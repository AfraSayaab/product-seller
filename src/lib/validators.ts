import { z } from "zod";


export const RegisterSchema = z
    .object({
        username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
        email: z.string().email(),
        phone: z.string().min(7).max(20),
        password: z.string().min(8),
        confirmPassword: z.string().min(8),
        nickname: z.string().min(1).max(50),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });


export const LoginSchema = z.object({
    usernameOrEmail: z.string().min(3),
    password: z.string().min(8),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z
    .object({
        token: z.string().min(1, "Reset token is required"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8, "Please confirm your password"),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });


export const ProfileUpdateSchema = z.object({
    firstName: z.string().max(100).optional().nullable(),
    lastName: z.string().max(100).optional().nullable(),
    nickname: z.string().max(50).optional().nullable(),
    displayPublicAs: z.string().max(100).optional().nullable(),
    website: z.string().url().optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    whatsapp: z.string().max(50).optional().nullable(),
    biography: z.string().max(5000).optional().nullable(),
    publicAddress: z.string().max(255).optional().nullable(),
    facebook: z.string().url().optional().nullable(),
    twitter: z.string().url().optional().nullable(),
    linkedin: z.string().url().optional().nullable(),
    pinterest: z.string().url().optional().nullable(),
    behance: z.string().url().optional().nullable(),
    dribbble: z.string().url().optional().nullable(),
    instagram: z.string().url().optional().nullable(),
    youtube: z.string().url().optional().nullable(),
    vimeo: z.string().url().optional().nullable(),
    flickr: z.string().url().optional().nullable(),
});

export const UserUpsertSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    phone: z.string().min(5),
    role: z.enum(["ADMIN", "USER"]).default("USER"),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    isVerified: z.boolean().optional(),
    password: z.string().min(6).optional(), // required on create
});
export type UserUpsertInput = z.infer<typeof UserUpsertSchema>;