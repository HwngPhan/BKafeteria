import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  email: z.email('Email không hợp lệ'),
  studentId: z.string().length(7, 'Mã số sinh viên phải có đúng 7 ký tự'),
  phoneNumber: z.string()
    .min(10, 'SĐT tối thiểu 10 số')
    .regex(/^[0-9]+$/, 'SĐT chỉ được chứa số'),
  gender: z.enum(['MALE', 'FEMALE'], {
    error: 'Vui lòng chọn giới tính',
  }),
  day: z.string().min(1, 'Chọn ngày'),
  month: z.string().min(1, 'Chọn tháng'),
  year: z.string().min(1, 'Chọn năm'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Mật khẩu nhập lại không khớp',
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

export interface ApiRegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  studentId: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string | Date;
  password: string;
}

export interface UserDto {
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  studentId: string;
  status: 'ACTIVE' | 'INACTIVE';
  vendorId: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  balance: number;
  points: number;
  isDeleted: boolean;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER';
  avatarUrl: string | null;
}

export interface LoginResponse {
  accessToken: string;
}

export interface VerifyOtpResponse {
  otpToken: string;
}
