'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Loader2, Utensils } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRegister } from '@/features/auth/data-access/auth.queries'

/* ---------------- SCHEMA ---------------- */

const formSchema = z
  .object({
    fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    email: z.email('Email không hợp lệ'),
    studentId: z.string().length(7, 'Mã số sinh viên phải có đúng 7 ký tự'),

    // Thêm validate số điện thoại: chỉ chứa số, min 10
    phoneNumber: z.string()
      .min(10, 'SĐT tối thiểu 10 số')
      .regex(/^[0-9]+$/, 'SĐT chỉ được chứa số'),

    gender: z.enum(['MALE', 'FEMALE'], { error: 'Vui lòng chọn giới tính' }),

    // 3 trường rời rạc cho Date
    day: z.string({ error: "Chọn ngày" }).min(1, "Chọn ngày"),
    month: z.string({ error: "Chọn tháng" }).min(1, "Chọn tháng"),
    year: z.string({ error: "Chọn năm" }).min(1, "Chọn năm"),

    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  })

// Định nghĩa kiểu dữ liệu gửi lên API (RegisterObject)
type RegisterObject = {
  fullName: string;
  email: string;
  phoneNumber: string; // Thêm field này
  studentId: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: Date;
  password: string;
}

/* ---------------- HELPERS ---------------- */

const RequiredMark = () => <span className="text-red-500 ml-1">*</span>

const range = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function AbsoluteFormMessage() {
  return (
    <FormMessage className="absolute left-0 top-full mt-1 text-xs font-medium text-red-500 animate-in fade-in-0 slide-in-from-top-1" />
  )
}

/* ---------------- PAGE ---------------- */

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Mock mutation (Thay bằng hook thật của bạn)
  const { mutateAsync: registerMutation } = useRegister();

  // Data cho Date Picker
  const currentYear = new Date().getFullYear()
  const years = useMemo(() => range(1950, currentYear - 5).reverse(), [currentYear])
  const months = useMemo(() => range(1, 12), [])
  const days = useMemo(() => range(1, 31), [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '', // Default value
      studentId: '',
      password: '',
      confirmPassword: '',
      day: '',
      month: '',
      year: '',
    },
  })

  // Logic Submit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // 1. Kiểm tra password match 
    if (values.password !== values.confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }

    // 2. Xử lý gộp ngày tháng năm
    const { day, month, year, ...rest } = values;

    const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    if (dob.getMonth() !== parseInt(month) - 1) {
      form.setError("day", { message: "Ngày không hợp lệ" })
      toast.error("Ngày sinh không hợp lệ");
      return;
    }

    // 3. Chuẩn bị data chuẩn để gửi API
    // `rest` đã bao gồm phoneNumber do schema đã define
    const apiData: RegisterObject = {
      ...rest,
      dateOfBirth: dob,
    }

    // 4. Gọi API 
    try {
      setIsLoading(true);
      await registerMutation(apiData);

      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
      router.push('/verify');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Đăng ký thất bại";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        <Card className="rounded-3xl border-4 border-dashed border-secondary/30 shadow-xl">
          <CardHeader className="bg-secondary/5 text-center pt-10 pb-8">
            <div className="mx-auto mb-4 w-fit rounded-2xl bg-white p-4 shadow-sm">
              <Utensils className="h-10 w-10 text-secondary" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              Đăng ký tài khoản
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Trở thành thành viên{' '}
              <span className="font-semibold text-secondary">
                BKAFETERIA
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 w-full"
              >
                {/* Row 1: Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="w-full relative">
                      <FormLabel>Họ và tên <RequiredMark /></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nguyễn Văn A"
                          className="h-12 w-full rounded-xl border-secondary/20 bg-secondary/5 focus:bg-background transition-colors"
                        />
                      </FormControl>
                      <AbsoluteFormMessage />
                    </FormItem>
                  )}
                />

                {/* Row 2: Student ID & Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem className="w-full relative">
                        <FormLabel>Mã số sinh viên <RequiredMark /></FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="XXXXXXX"
                            className="h-12 w-full rounded-xl border-secondary/20"
                          />
                        </FormControl>
                        <AbsoluteFormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="w-full relative">
                        <FormLabel>Giới tính <RequiredMark /></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 w-full rounded-xl border-secondary/20">
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper" className="bg-background z-50">
                            <SelectItem value="MALE">Nam</SelectItem>
                            <SelectItem value="FEMALE">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                        <AbsoluteFormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 3: Date of Birth */}
                <div className="w-full">
                  <FormLabel>Ngày sinh <RequiredMark /></FormLabel>
                  <div className="grid grid-cols-3 gap-4 w-full mt-2">
                    {/* Day */}
                    <FormField
                      control={form.control}
                      name="day"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 w-full rounded-xl border-secondary/20">
                                <SelectValue placeholder="Ngày" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent position="popper" className="h-[200px] bg-background z-50">
                              {days.map((d) => (
                                <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <AbsoluteFormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Month */}
                    <FormField
                      control={form.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 w-full rounded-xl border-secondary/20">
                                <SelectValue placeholder="Tháng" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent position="popper" className="h-[200px] bg-background z-50">
                              {months.map((m) => (
                                <SelectItem key={m} value={m.toString()}>Tháng {m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {/* Year */}
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 w-full rounded-xl border-secondary/20">
                                <SelectValue placeholder="Năm" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent position="popper" className="h-[200px] bg-background z-50">
                              {years.map((y) => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Row 4: Phone & Email (Gom nhóm) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="w-full relative">
                        <FormLabel>Số điện thoại <RequiredMark /></FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel" // Dùng type tel cho bàn phím số trên mobile
                            placeholder="0xxxxxxxxx"
                            className="h-12 w-full rounded-xl border-secondary/20"
                          />
                        </FormControl>
                        <AbsoluteFormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-full relative">
                        <FormLabel>Email <RequiredMark /></FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="email@example.com"
                            className="h-12 w-full rounded-xl border-secondary/20"
                          />
                        </FormControl>
                        <AbsoluteFormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 5: Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="w-full relative">
                        <FormLabel>Mật khẩu <RequiredMark /></FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="h-12 w-full rounded-xl border-secondary/20"
                          />
                        </FormControl>
                        <AbsoluteFormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="w-full relative">
                        <FormLabel>Nhập lại mật khẩu <RequiredMark /></FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="h-12 w-full rounded-xl border-secondary/20"
                          />
                        </FormControl>
                        <AbsoluteFormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 w-full rounded-xl bg-primary text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 mt-4 transition-all hover:scale-[1.01]"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  Đăng ký
                </Button>

                {/* Footer */}
                <div className="text-center text-sm text-muted-foreground">
                  Đã có tài khoản?{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="px-1 font-bold text-secondary text-base"
                    onClick={() => router.push('/login')}
                  >
                    Đăng nhập
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}