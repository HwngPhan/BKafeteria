'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Utensils, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAccountActivation } from '@/features/auth/data-access/auth.queries'
import { useLanguage } from '@/providers/LanguageProvider'

export default function AccountActivationPage() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? undefined
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const { mutateAsync: activate } = useAccountActivation()

  useEffect(() => {
    if (!token) {
      console.error('No activation token provided')
      return
    }
    console.log('Activating account with token:', token)
    activate(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

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
                  <CardTitle className="text-2xl font-bold">{t('activation.activating')}</CardTitle>
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
                  <CardTitle className="text-2xl font-bold text-green-600">{t('activation.done')}</CardTitle>
                  <CardDescription className="text-base">
                    {t('activation.success_desc')}
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
                  <CardTitle className="text-2xl font-bold text-red-600">{t('activation.failed')}</CardTitle>
                  <CardDescription className="text-base">
                    {t('activation.failed_desc')}
                  </CardDescription>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <CardContent className="px-10 pb-12">
            {status === 'success' ? (
              <Button asChild className="h-14 w-full rounded-xl bg-primary text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.01]">
                <Link href="/login">
                  {t('activation.login')} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : status === 'error' ? (
              <div className="space-y-4">
                <Button asChild variant="outline" className="h-14 w-full rounded-xl border-secondary/20 hover:bg-secondary/5 transition-all">
                  <Link href="/register">{t('activation.retry')}</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full text-muted-foreground hover:text-primary">
                  <Link href="/login">{t('activation.back_login')}</Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}