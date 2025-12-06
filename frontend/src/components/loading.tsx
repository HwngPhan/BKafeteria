"use client";

import { Spinner } from "@/components/ui/spinner";

export const PageLoading = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Spinner className="w-10 h-10" />
    </div>
  );
};
