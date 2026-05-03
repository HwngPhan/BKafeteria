'use client'

import { motion } from 'framer-motion'
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
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

export default function VerifyEmailPendingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="rounded-3xl border-4 border-dashed border-primary/20 shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x" />
          <CardHeader className="text-center pt-10 pb-6">
            <div className="mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-white p-6 rounded-2xl shadow-sm border">
                <Mail className="h-12 w-12 text-primary animate-bounce" />
              </div>
              <div className="absolute -right-2 -top-2">
                <CheckCircle2 className="h-8 w-8 text-green-500 fill-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              Check your email!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              We've sent a verification link to your inbox.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-10 py-6 text-center space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Please click the link in the email to activate your account. 
              This helps us ensure your security and keep our cafeteria community safe.
            </p>
            
            <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-start gap-3 text-left">
              <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-secondary">?</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary">Didn't receive the email?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check your spam folder or try waiting a few minutes. 
                  If it still doesn't appear, you can try registering again or contact support.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-10 pb-10 flex flex-col gap-4">
            <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
              <Link href="/login">
                Back to Login <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Verification links are valid for 24 hours.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
