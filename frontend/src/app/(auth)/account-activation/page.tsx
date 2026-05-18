'use client'

import { useEffect, useState, use, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Utensils, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAccountActivation } from '@/features/auth/data-access/auth.queries'
import { toast } from 'sonner'

export default function AccountActivationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const router = useRouter()
  const params = use(searchParams)
  const token = params.token
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  )
  const { mutateAsync: activate } = useAccountActivation()
  const activated = useRef(false)

  useEffect(() => {
    if (!token || activated.current) {
      return
    }

    const handleActivation = async () => {
      activated.current = true
      try {
        await activate(token)
        setStatus('success')
        toast.success('Kích hoạt tài khoản thành công!')
      } catch (err) {
        setStatus('error')
        toast.error('Kích hoạt thất bại. Liên kết có thể đã hết hạn hoặc không hợp lệ.')
      }
    }

    handleActivation()
  }, [token, activate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-3xl border-4 border-dashed border-primary/20 shadow-2xl overflow-hidden text-center">
          <CardHeader className="pt-12 pb-6">
            <div className="mx-auto mb-6 flex justify-center">
              <Utensils className="h-10 w-10 text-primary/40" />
            </div>
            
            <AnimatePresence mode="wait">
              {status === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                  <CardTitle className="text-2xl font-bold">Đang kích hoạt tài khoản...</CardTitle>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-green-600">Hoàn tất!</CardTitle>
                  <CardDescription className="text-base">
                    Tài khoản của bạn đã được kích hoạt và sẵn sàng sử dụng.
                  </CardDescription>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="bg-red-100 p-4 rounded-full">
                    <XCircle className="h-16 w-16 text-red-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-red-600">Kích hoạt thất bại</CardTitle>
                  <CardDescription className="text-base">
                    Mã xác thực không hợp lệ hoặc đã hết hạn.
                  </CardDescription>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <CardContent className="px-10 pb-12">
            {status === 'success' ? (
              <Button asChild className="h-14 w-full rounded-xl bg-primary text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.01]">
                <Link href="/login">
                  Đăng nhập ngay <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : status === 'error' ? (
              <div className="space-y-4">
                <Button asChild variant="outline" className="h-14 w-full rounded-xl border-secondary/20 hover:bg-secondary/5 transition-all">
                  <Link href="/register">Thử đăng ký lại</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full text-muted-foreground hover:text-primary">
                  <Link href="/login">Quay lại đăng nhập</Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}