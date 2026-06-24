"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BalanceCard } from "@/features/wallet/components/BalanceCard";
import { useLanguage } from "@/providers/LanguageProvider";
import { History } from "lucide-react";

export default function WalletPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
          {t("wallet.title")}
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          {t("wallet.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <BalanceCard />
        </div>

        <div className="lg:col-span-2">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 bg-white h-full">
            <CardHeader className="p-8 border-b border-secondary/5">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <History className="text-primary" />
                {t("wallet.recent_tx")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex items-center justify-center min-h-[300px]">
              <div className="text-center space-y-4">
                <div className="p-6 rounded-full bg-secondary/5 inline-block">
                  <History className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground font-medium">
                  {t("wallet.no_tx")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
