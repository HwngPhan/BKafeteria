"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eaf4ff] p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border-4 border-dashed border-[#032b91] bg-white p-10 text-center">
          <h1 className="text-7xl font-extrabold text-[#1488db] tracking-tight">404</h1>
          <p className="mt-3 text-lg font-semibold text-[#032b91]">
            Không tìm thấy trang
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Trang bạn tìm không tồn tại hoặc đã bị di chuyển.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={() => router.push("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>

            <Button
              variant="secondary"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} BKafeteria
        </p>
      </motion.div>
    </div>
  )
}
