"use client";

import { Button } from "@/components/ui/button";
import { OrderDetails } from "@/features/order/components/OrderDetails";
import { useOrderById } from "@/features/order/data-access/order.queries";
import { useLanguage } from "@/providers/LanguageProvider";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { data: order, isLoading } = useOrderById(params.id as string);
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
        <div className="p-8 rounded-full bg-secondary/5">
          <ArrowLeft className="h-16 w-16 text-muted-foreground/30" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-primary">
            {t("order_detail.not_found")}
          </h3>
          <p className="text-muted-foreground max-w-xs">
            {t("order_detail.not_found_desc")}
          </p>
        </div>
        <Button
          onClick={() => router.push("/orders")}
          className="rounded-2xl h-12 px-8 font-bold"
        >
          {t("order_detail.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-xl h-12 w-12 hover:bg-secondary/5"
        >
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
            {t("order_detail.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("order_detail.subtitle")}
          </p>
        </div>
      </div>

      <OrderDetails order={order} />
    </div>
  );
}
