"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Utensils, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAccountActivation } from "@/features/auth/data-access/auth.queries";

export default function ActivatePage() {
  const accountActivate = useAccountActivation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xử lý yêu cầu...");

  useEffect(() => {
    // Nếu không có token, báo lỗi ngay
    if (!token) {
      setStatus("error");
      setMessage("Mã kích hoạt không hợp lệ hoặc đường dẫn bị thiếu.");
      return;
    }

    async function activate(token: string) {
      try {
        // Giả lập delay một chút để UI không bị giật (UX tốt hơn)
        const delay = Math.random() * 500 + 1000;
        await new Promise((res) => setTimeout(res, delay));
        
        // Gọi API
        await accountActivate.mutateAsync(token);

        setStatus("success");
        setMessage("Tài khoản của bạn đã được kích hoạt thành công!");
      } catch (e: any) {
        setStatus("error");
        setMessage(e.message || "Kích hoạt thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.");
      }
    }

    activate(token);
  }, [token, accountActivate]); // Thêm dependencies chuẩn

  // Helper render content dựa theo status
  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center space-y-6 py-4 animate-in fade-in duration-500">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-secondary/50 animate-pulse" />
                </div>
            </div>
            <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-foreground">Đang kích hoạt...</h3>
                <p className="text-muted-foreground text-sm">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center ring-4 ring-green-50">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-green-700">Thành công!</h3>
              <p className="text-muted-foreground">{message}</p>
            </div>

            <Button asChild className="h-14 w-full rounded-xl bg-primary text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 mt-2 transition-all hover:scale-[1.01]">
              <Link href="/login">
                Đăng nhập ngay <ArrowRight className="ml-2 w-5 h-5"/>
              </Link>
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="flex flex-col items-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center ring-4 ring-red-50">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-red-700">Đã có lỗi xảy ra</h3>
              <p className="text-muted-foreground px-4">{message}</p>
            </div>

            <div className="w-full space-y-3 pt-2">
                <Button asChild variant="secondary" className="h-12 w-full rounded-xl border-secondary/20">
                    <Link href="/login">Quay lại trang đăng nhập</Link>
                </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card className="rounded-3xl border-4 border-dashed border-secondary/30 shadow-xl overflow-hidden">
          {/* ---------------- HEADER ---------------- */}
          <CardHeader className="bg-secondary/5 text-center pt-10 pb-8">
            <div className="mx-auto mb-4 w-fit rounded-2xl bg-white p-4 shadow-sm">
              <Utensils className="h-10 w-10 text-secondary" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              Kích hoạt tài khoản
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Chào mừng bạn đến với{' '}
              <span className="font-semibold text-secondary">
                BKAFETERIA
              </span>
            </CardDescription>
          </CardHeader>

          {/* ---------------- CONTENT ---------------- */}
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}