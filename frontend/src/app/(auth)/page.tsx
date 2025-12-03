'use client'

import Header from "@/components/layout/header";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-zinc-50 font-sans dark:bg-black overflow-hidden">

      {/* Header đè lên image + shadow */}
      <div className="absolute top-0 left-0 z-30 w-full shadow-md">
        <Header />
      </div>

      {/* Ảnh nền */}
      <div className="relative z-0 pb-10">
        <Image
          src="/bg-full.png"
          alt="Background"
          width={1920}
          height={1080}
          className="w-full object-cover"
          priority
        />
      </div>

      {/* Text đè lên image */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 text-center">
        <h1 className="text-white dark:text-white text-4xl font-bold">
          Welcome to the BKafeteria System
        </h1>

        {/* Description nhỏ */}
        <p className="mt-2 text-white/80 dark:text-white/80 text-xl">
          Order your meals online, check the daily menu, and manage your cafeteria account easily.
        </p>
      </div>

    </div>
  );
}
