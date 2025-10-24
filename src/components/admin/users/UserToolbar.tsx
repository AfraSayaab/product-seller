

// // File: lib/zod-schemas.ts
// import { z } from "zod";
// export const UserUpsertSchema = z.object({
//   username: z.string().min(3),
//   email: z.string().email(),
//   phone: z.string().min(5),
//   role: z.enum(["ADMIN", "USER"]).default("USER"),
//   firstName: z.string().optional().nullable(),
//   lastName: z.string().optional().nullable(),
//   isVerified: z.boolean().optional(),
//   password: z.string().min(6).optional(), // required on create
// });
// export type UserUpsertInput = z.infer<typeof UserUpsertSchema>;




