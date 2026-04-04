'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Loader2, Utensils } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { useLogin } from '@/features/auth/data-access/auth.queries'
import { toast } from 'sonner'

/* ---------------- SCHEMA ---------------- */

const formSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

/* ---------------- HELPERS ---------------- */

// Helper component cho dấu sao đỏ
const RequiredMark = () => <span className="text-red-500 ml-1">*</span>

/* ---------------- COMPONENT: ABSOLUTE ERROR MESSAGE ---------------- */

function AbsoluteFormMessage() {
    return (
        <FormMessage className="absolute left-0 top-full mt-1 text-xs font-medium text-red-500 animate-in fade-in-0 slide-in-from-top-1" />
    )
}

/* ---------------- PAGE ---------------- */

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const {mutateAsync: Login} = useLogin()  // Giả sử bạn có hook useLogin để gọi API đăng nhập

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.email || !values.password) {
      return
    }
    const apiData = {
      email: values.email,
      password: values.password,
    }

    try {
      setIsLoading(true);
      await Login(apiData);
      toast.success("Login successful");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <Card className="rounded-3xl border-4 border-dashed border-secondary/30 shadow-xl">
          {/* ---------------- HEADER ---------------- */}
          <CardHeader className="bg-secondary/5 text-center pt-10 pb-8">
            <div className="mx-auto mb-4 w-fit rounded-2xl bg-white p-4 shadow-sm">
              <Utensils className="h-10 w-10 text-secondary" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              Đăng nhập
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Chào mừng trở lại{' '}
              <span className="font-semibold text-secondary">
                BKAFETERIA
              </span>
            </CardDescription>
          </CardHeader>

          {/* ---------------- FORM ---------------- */}
          <CardContent className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                // Tăng khoảng cách để lỗi không bị đè
                className="space-y-8 w-full" 
              >
                {/* Field: Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="w-full relative"> {/* relative neo lỗi */}
                      <FormLabel>Email <RequiredMark /></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="email@example.com"
                          className="h-12 w-full rounded-xl border-secondary/20 bg-secondary/5 focus:bg-background transition-colors"
                        />
                      </FormControl>
                      <AbsoluteFormMessage />
                    </FormItem>
                  )}
                />

                {/* Field: Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="w-full relative"> {/* relative neo lỗi */}
                      <div className="flex items-center justify-between">
                        <FormLabel>Mật khẩu <RequiredMark /></FormLabel>
                        <Button 
                            variant="link" 
                            className="p-0 h-auto text-xs font-normal text-muted-foreground hover:text-primary"
                            type="button"
                            onClick={() => router.push('/forgot-password')}
                        >
                            Quên mật khẩu?
                        </Button>
                      </div>
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

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 w-full rounded-xl bg-primary text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 mt-4 transition-all hover:scale-[1.01]"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  Đăng nhập
                </Button>

                {/* Footer */}
                <div className="text-center text-sm text-muted-foreground">
                  Chưa có tài khoản?{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="px-1 font-bold text-secondary text-base"
                    onClick={() => router.push('/register')}
                  >
                    Đăng ký ngay
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