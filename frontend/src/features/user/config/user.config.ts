import z from "zod"

export const GenderSchema = z.enum([
    "MALE", 
    "FEMALE"
])

export type Gender = z.infer<typeof GenderSchema>

export const BaseUserEntitySchema = z.object({
    userId: z.uuid(),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export const UserSchema = z.object({
    fullName: z.string(),
    phoneNumber: z.string(),
    email: z.email(),
    gender: GenderSchema,
    dateOfBirth: z.string(),
    studentId: z.string(),
    status: z.string(),
    isDeleted: z.boolean(),
    role: z.string(),
    avatarUrl: z.string().nullable().optional(),
}).extend(BaseUserEntitySchema.shape)

export type User = z.infer<typeof UserSchema> //When get user info, password will not be included

