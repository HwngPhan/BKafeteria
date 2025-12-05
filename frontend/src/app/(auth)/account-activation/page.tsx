"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountActivation } from "@/features/auth/data-access/auth.queries";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ActivatePage() {
  const accountActivate = useAccountActivation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid activation token.");
      return;
    }

    async function activate(token: string) {
      try {
        const delay = Math.random() * 800 + 1200;
        await new Promise((res) => setTimeout(res, delay));
        await accountActivate.mutateAsync(token);

        setStatus("success");
        setMessage("Your account has been successfully activated!");
      } catch (e: any) {
        setStatus("error");
        setMessage(e.message || "Account activation failed.");
      }
    }

    activate(token);
  }, [token]);

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2">
      
      {/* Left Image */}
      <div className="relative hidden md:block">
        <Image
          src="/auth.png"
          alt="Authentication"
          fill
          className="object-cover"
        />
      </div>

      {/* Right Content */}
      <div className="flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md p-6 rounded-2xl shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Account Activation</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Checking your activation token
            </p>
          </CardHeader>

          <CardContent className="text-center space-y-4">

            {status === "loading" && (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="animate-spin w-10 h-10" />
                <Badge variant="outline">Activating your account...</Badge>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle2 className="text-green-600 w-12 h-12" />
                <Badge className="bg-green-600">Activation Successful</Badge>
                <p>{message}</p>

                <Link href="/login">
                  <Button className="mt-2 w-full">Go to Login</Button>
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center space-y-3">
                <XCircle className="text-red-600 w-12 h-12" />
                <Badge className="bg-red-600">Activation Failed</Badge>
                <p>{message}</p>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
