import z from 'zod';

export const LoginObjectSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

export const LoginResponseSchema = z.object({
    status: z.number(),
    message: z.string(),
    data: z.object({
        accessToken: z.string(),
    }),
});

export type LoginObject = z.infer<typeof LoginObjectSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const RegisterObjectSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    fullName: z.string().min(2),
    gender: z.enum(['MALE', 'FEMALE']),
    studentId: z.string().length(7),
    dateOfBirth: z.date(),
    phoneNumber: z.string()
});

export const RegisterResponseSchema = z.object({
    status: z.number(),
    message: z.string(),
});

export type RegisterObject = z.infer<typeof RegisterObjectSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;