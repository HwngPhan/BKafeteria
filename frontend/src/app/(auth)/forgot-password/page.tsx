"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Loader2, Utensils } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  useResetPassword,
  useSendOtp,
  useVerifyOtp,
} from "@/features/auth/data-access/auth.queries";
import { useLanguage } from "@/providers/LanguageProvider";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const { mutateAsync: sendOtp, isPending: isSendOtpPending } = useSendOtp();
  const { mutateAsync: verifyOtp, isPending: isVerifyOtpPending } = useVerifyOtp();
  const resetPassword = useResetPassword();

  const [step, setStep] = useState<"email" | "otp" | "reset" | "success">("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [counter, setCounter] = useState(0);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  // Countdown effect
  useEffect(() => {
    if (counter <= 0) return;
    const timer = setInterval(() => setCounter((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  // Handlers
  const handleSendOtp = async () => {
    try {
      await sendOtp(email);
      toast.success(t("forgot.otp_sent"));
      setStep("otp");
      setCounter(60);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : t("forgot.otp_send_failed");
      toast.error(errorMessage);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp({ email, otp });
      toast.success(t("forgot.otp_verified"));
      setStep("reset");
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : t("forgot.otp_wrong");
      toast.error(errorMessage);
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirm) {
      setError(t("forgot.password_mismatch"));
      toast.error(t("forgot.password_mismatch"));
      return;
    }
    setError("");

    try {
      await resetPassword.mutateAsync({ email, newPassword: password });
      toast.success(t("forgot.changed"));
      setStep("success");
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : t("forgot.change_failed");
      toast.error(errorMessage);
    }
  };

  // Helper render cho từng bước
  const renderStepContent = () => {
    switch (step) {
      case "email":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="font-medium">{t("forgot.email_label")}</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border-secondary/20 bg-secondary/5 focus:bg-background transition-colors"
              />
            </div>

            <Button
              className="h-14 w-full rounded-xl bg-primary text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.01]"
              onClick={handleSendOtp}
              disabled={!email || isSendOtpPending}
            >
              {isSendOtpPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {t("forgot.send_otp")}
            </Button>

            <div className="text-center">
                <Button variant="link" asChild className="px-1 font-bold text-secondary text-base">
                    <Link href="/login">{t("forgot.back_login")}</Link>
                </Button>
            </div>
          </div>
        );

      case "otp":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center">
            <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                {t("forgot.otp_sent_to")}
                <br />
                <span className="font-semibold text-foreground">{email}</span>
                </p>
            </div>

            <InputOTP value={otp} onChange={setOtp} maxLength={6}>
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="h-12 w-10 md:w-12 rounded-lg border border-secondary/20 text-lg font-semibold shadow-sm"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <Button
              className="h-14 w-full rounded-xl bg-primary text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.01]"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isVerifyOtpPending}
            >
              {isVerifyOtpPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {t("forgot.verify")}
            </Button>

            <div className="text-sm text-center w-full">
              {counter > 0 ? (
                <Badge variant="outline" className="px-3 py-1 border-secondary/30 text-muted-foreground">
                  {t("forgot.resend_after").replace("{s}", counter.toString())}
                </Badge>
              ) : (
                <div className="space-x-1">
                    <span className="text-muted-foreground">{t("forgot.no_code")}</span>
                    <Button variant="link" onClick={handleSendOtp} className="p-0 h-auto font-bold text-secondary">
                    {t("forgot.resend")}
                    </Button>
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={() => setStep("email")} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2"/> {t("forgot.other_email")}
            </Button>
          </div>
        );

      case "reset":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="font-medium">{t("forgot.new_password")}</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-xl border-secondary/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">{t("forgot.confirm_password")}</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-12 w-full rounded-xl border-secondary/20"
              />
            </div>

            {error && <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">{error}</p>}

            <Button
              className="h-14 w-full rounded-xl bg-primary text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.01]"
              onClick={handleResetPassword}
              disabled={resetPassword.isPending}
            >
              {resetPassword.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {t("forgot.change_password")}
            </Button>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-300 py-4">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-600">
                {t("forgot.success_title")}
                </h2>
                <p className="text-muted-foreground">
                    {t("forgot.success_desc")}
                </p>
            </div>

            <Button asChild className="h-14 w-full rounded-xl bg-primary text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90">
              <Link href="/login">{t("forgot.login")}</Link>
            </Button>
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
              {t("forgot.title")}
            </CardTitle>
            <CardDescription className="mt-2 text-base">
                {step === "email" && t("forgot.step1")}
                {step === "otp" && t("forgot.step2")}
                {step === "reset" && t("forgot.step3")}
                {step === "success" && t("forgot.step4")}
            </CardDescription>
          </CardHeader>

          {/* ---------------- CONTENT ---------------- */}
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}