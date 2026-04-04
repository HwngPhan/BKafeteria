'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, MailCheck, Utensils } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <Card className="rounded-3xl border-4 border-dashed border-secondary/30 shadow-xl overflow-hidden">
          {/* ---------------- HEADER ---------------- */}
          <CardHeader className="bg-secondary/5 text-center pt-10 pb-8">
            <div className="mx-auto mb-4 w-fit rounded-2xl bg-white p-4 shadow-sm">
              <Utensils className="h-10 w-10 text-secondary" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              Xác thực tài khoản
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Chào mừng bạn đến với{' '}
              <span className="font-semibold text-secondary">
                BKAFETERIA
              </span>
            </CardDescription>
          </CardHeader>

          {/* ---------------- CONTENT ---------------- */}
          <CardContent className="p-8 flex flex-col items-center">
            {/* Icon Animation Wrapper */}
            <div className="mb-6 rounded-full bg-green-50 p-6 ring-1 ring-green-100">
              <MailCheck className="h-16 w-16 text-green-600 animate-bounce" />
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-2">
              Kiểm tra hộp thư của bạn
            </h3>
            
            <p className="text-center text-muted-foreground mb-8 leading-relaxed">
              Chúng tôi đã gửi một liên kết xác thực đến địa chỉ email của bạn. 
              Vui lòng kiểm tra hộp thư (bao gồm cả mục Spam) và làm theo hướng dẫn để kích hoạt tài khoản.
            </p>

            {/* Actions */}
            <div className="w-full space-y-4">
              <Button 
                asChild 
                className="h-14 w-full rounded-xl bg-primary text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.01]"
              >
                <Link href="/login">
                   Tiếp tục đăng nhập
                </Link>
              </Button>

              <Button
                variant="ghost"
                asChild
                className="h-12 w-full rounded-xl text-muted-foreground hover:text-primary hover:bg-secondary/5"
              >
                <Link href="/login" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Quay lại trang chủ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}