import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/components/cart/cart-providers";
import QueryProvider from "@/providers/QueryProvider";
import { WebSocketProvider } from "@/providers/WebSocketProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner"; // ⬅️ thêm dòng này
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BKAfeteria",
  description: "Eat better, study better. Order your meals online with BKAfeteria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster richColors position="bottom-right" />   {/* ⬅️ đặt ở đây */}
        <QueryProvider>
          <LanguageProvider>
            <CartProvider>
              <AuthProvider>
                <WebSocketProvider>
                  {children}
                </WebSocketProvider>
              </AuthProvider>
            </CartProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
