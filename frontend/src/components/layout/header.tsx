'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function Header() {
    const router = useRouter();

    return (
        <header className="w-full border-b bg-white dark:bg-black">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
            <Image
                src="/logo.png"    // đổi theo logo của bạn
                alt="Logo"
                width={32}
                height={32}
                className="object-contain"
            />
            <span className="text-lg font-semibold text-black dark:text-white">
                BKafeteria
            </span>
            </Link>

            {/* Login button */}
            <Button
                variant="default"
                onClick={() => router.push('/login')}
                className='cursor-pointer'
            >
                Login/Sign up
            </Button>

        </div>
        </header>
    );
}
