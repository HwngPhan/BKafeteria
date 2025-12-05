// Updated Login Page with basic form validation

"use client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MailCheck } from "lucide-react";
import Image from "next/image";

export default function VerifyPage() {

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="relative hidden md:block">
        <Image src="/auth.png" alt="Authentication" fill className="object-cover" />
      </div>

      <div className="flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md p-6 rounded-2xl shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Activate your account</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <MailCheck className="mx-auto mb-4 text-primary" size={100} />
            <p className="text-center text-muted-foreground">
              A verification link has been sent to your email address. Please check your inbox and click on the link to activate your account.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
              <a href="/login" className="text-primary font-medium hover:underline flex items-center gap-2">
               <span> <ArrowLeft/> </span> Back to Login
              </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
