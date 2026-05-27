"use client";

import { Button } from "@/components/ui/button";
import { OrderDetails } from "@/features/order/components/OrderDetails";
import { orderKeys, useOrderById } from "@/features/order/data-access/order.queries";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: order, isLoading } = useOrderById(orderId);
  const { t } = useLanguage();

  // Subscribe to real-time updates and invalidate the query when this order is updated
  const queryClient = useQueryClient();
  const realtimeUpdates = useRealtimeOrders((state) => state.updates);
  useEffect(() => {
    if (realtimeUpdates.has(orderId)) {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    }
  }, [realtimeUpdates, orderId, queryClient]);

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
