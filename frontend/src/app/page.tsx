'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Clock, ShoppingBag, Smile, Soup, Utensils } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter();

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
            <span className="block text-secondary">Nhanh – Ngon – Tiện lợi</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Đặt món từ căn tin Bách Khoa ngay trên trình duyệt. Tiết kiệm thời gian, tận hưởng bữa ăn ngon miệng trước và sau giờ học căng thẳng.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" className="mt-6 rounded-full" onClick={() => router.push('/login')}>Gọi món ngay</Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
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
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
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
          <h2 className="text-3xl font-bold">Sẵn sàng đặt món chưa?</h2>
          <p className="mt-4 text-muted-foreground">
            Mỗi bữa ăn là một niềm vui nhỏ trong ngày học tập của bạn.
          </p>
          <Button size="lg" className="mt-6 rounded-full" onClick={() => router.push('/login')}>Bắt đầu ngay</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dashed border-border px-6 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} BKafeteria • Made with 💙
      </footer>
    </div>
  )
}

const features = [
  {
    title: "Đặt trước",
    desc: "Chọn món trước giờ nghỉ, không cần xếp hàng.",
    icon: ShoppingBag,
  },
  {
    title: "Món ngon",
    desc: "Thực đơn đa dạng phong phú, giá phải chăng.",
    icon: Utensils,
  },
  {
    title: "Đúng giờ",
    desc: "Biết được khi nào món ăn sẵn sàng để lấy.",
    icon: Clock,
  },
  {
    title: "Dễ dùng",
    desc: "Giao diện thân thiện, dùng là thích ngay.",
    icon: Smile,
  },
]
