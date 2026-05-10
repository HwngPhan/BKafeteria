'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Clock, ShoppingBag, Smile, Soup, Utensils } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/providers/LanguageProvider"

export default function LandingPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const features = [
    { titleKey: 'landing.feature_preorder', descKey: 'landing.feature_preorder_desc', icon: ShoppingBag },
    { titleKey: 'landing.feature_food',     descKey: 'landing.feature_food_desc',     icon: Utensils },
    { titleKey: 'landing.feature_time',     descKey: 'landing.feature_time_desc',     icon: Clock },
    { titleKey: 'landing.feature_easy',     descKey: 'landing.feature_easy_desc',     icon: Smile },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            BKAFETERIA
            <span className="block text-secondary">{t('landing.tagline')}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            {t('landing.description')}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" className="mt-6 rounded-full" onClick={() => router.push('/login')}>
              {t('landing.order_now')}
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="rounded-3xl border-4 border-dashed border-primary bg-card shadow-sm">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-white">
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold">{t(f.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(f.descKey)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-[3rem] border-4 border-dashed border-secondary bg-secondary/10 p-12 text-center">
          <Soup className="mx-auto mb-4 h-12 w-12 text-secondary" />
          <h2 className="text-3xl font-bold">{t('landing.cta_title')}</h2>
          <p className="mt-4 text-muted-foreground">{t('landing.cta_desc')}</p>
          <Button size="lg" className="mt-6 rounded-full" onClick={() => router.push('/login')}>
            {t('landing.cta_btn')}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dashed border-border px-6 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} BKafeteria • Made with 💙
      </footer>
    </div>
  )
}
