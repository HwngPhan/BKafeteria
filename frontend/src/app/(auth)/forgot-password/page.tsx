"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword, useSendOtp, useVerifyOtp } from "@/features/auth/data-access/auth.queries";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

export default function ResetPasswordPage() {
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const resetPassword = useResetPassword();

  const [step, setStep] = useState<"email" | "otp" | "reset" | "success">("email");

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");
  const [counter, setCounter] = useState(0);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  // countdown
  useEffect(() => {
    if (counter <= 0) return;
    const timer = setInterval(() => setCounter((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  const handleSendOtp = async () => {
    try {
      await sendOtp.mutateAsync(email);
      toast.success("OTP sent to your email");
      setStep("otp");
      setCounter(60);
    } catch (e: any) {
      toast.error(e.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp.mutateAsync({ email, otp });
      toast.success("OTP verified!");
      setStep("reset");
    } catch (e: any) {
      toast.error(e.message || "Invalid OTP");
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirm) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetPassword.mutateAsync({ email, newPassword: password });
      toast.success("Password reset successfully");
      setStep("success");
    } catch (e: any) {
      toast.error(e.message || "Failed to reset password");
    }
  };

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT IMAGE */}
      <div className="relative hidden md:block">
        <Image src="/auth.png" alt="Authentication" fill className="object-cover" />
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md p-6 rounded-2xl shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Follow the steps to recover your account
            </p>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* STEP 1 — Email */}
            {step === "email" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSendOtp}
                  disabled={!email || sendOtp.isPending}
                >
                  {sendOtp.isPending ? "Sending..." : "Send OTP"}
                </Button>
              </div>
            )}

            {/* STEP 2 — OTP */}
            {step === "otp" && (
              <div className="space-y-6 text-center items-center">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit OTP sent to your email
                </p>

                <div className="flex justify-center">
                    <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                        <InputOTPGroup className="flex gap-2">
                        <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                        <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                        <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                        <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                        <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                        <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>


                <Button
                  className="w-full"
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || verifyOtp.isPending}
                >
                  {verifyOtp.isPending ? "Verifying..." : "Verify OTP"}
                </Button>

                <div className="text-sm">
                  {counter > 0 ? (
                    <Badge variant="outline">Resend OTP in {counter}s</Badge>
                  ) : (
                    <Button variant="link" onClick={handleSendOtp}>
                      Resend OTP
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3 — Reset Password */}
            {step === "reset" && (
              <div className="space-y-4">
                <div className="space-y-2"> 
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button
                  className="w-full"
                  onClick={handleResetPassword}
                  disabled={resetPassword.isPending}
                >
                  {resetPassword.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            )}

            {/* STEP 4 — Success */}
            {step === "success" && (
              <div className="text-center space-y-4">
                <h2 className="text-green-600 font-semibold text-lg">
                  Password Reset Successfully!
                </h2>

                <Link href="/login">
                  <Button className="w-full">Go to Login</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
