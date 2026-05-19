"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useConfirmOrder,
  useMarkOrderFinished,
  useVendorOrderById,
} from "@/features/vendor/data-access/vendor-order.queries";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  ArrowLeft,
  ChefHat,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  Loader2,
  ShoppingBag,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const statusSteps = [
  { status: "PURCHASED", labelKey: "order_details.status_purchased", icon: ClipboardList },
  { status: "PROCESSING", labelKey: "order_details.status_processing", icon: UtensilsCrossed },
  { status: "COMPLETED", labelKey: "order_details.status_completed", icon: CheckCircle2 },
];

const statusColors: Record<string, string> = {
  PURCHASED: "bg-blue-100 text-blue-700 border-blue-200",
  PROCESSING: "bg-indigo-100 text-indigo-700 border-indigo-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELED: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  PURCHASED: "order_status.purchased",
  PROCESSING: "order_status.processing",
  COMPLETED: "order_status.completed",
  CANCELED: "order_status.canceled",
};

export default function ManagerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const { data: order, isLoading } = useVendorOrderById(params.id as string);
  const confirmOrder = useConfirmOrder();
  const markFinished = useMarkOrderFinished();

  const handleConfirm = async () => {
    if (!order) return;
    try {
      await confirmOrder.mutateAsync(order.vendorOrderId);
      toast.success(t("manager.orders.toast_processing"));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t("common.error_occurred"));
    }
  };

  const handleMarkFinished = async () => {
    if (!order) return;
    try {
      await markFinished.mutateAsync(order.vendorOrderId);
      toast.success(t("manager.orders.toast_finished"));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t("common.error_occurred"));
    }
  };

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
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-primary">
            {t("manager.order_detail.not_found")}
          </h3>
          <p className="text-muted-foreground max-w-xs">
            {t("manager.order_detail.not_found_desc")}
          </p>
        </div>
        <Button
          onClick={() => router.push("/manager/orders")}
          className="rounded-2xl h-12 px-8 font-bold"
        >
          {t("order_detail.back")}
        </Button>
      </div>
    );
  }

  const isCanceled = order.status === "CANCELED";

  const getStatusIndex = (status: string) => {
    switch (status) {
      case "PURCHASED": return 0;
      case "PROCESSING": return 1;
      case "COMPLETED": return 2;
      default: return -1;
    }
  };

  const currentStatusIndex = getStatusIndex(order.status);
  const total = (order.menuItems || []).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
            {t("manager.order_detail.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("manager.order_detail.subtitle")}
          </p>
        </div>
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Status Card */}
        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white">
          <CardHeader className="bg-secondary/5 border-b p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <ClipboardList size={28} />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">
                    #{order.orderId.substring(0, 8)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-2">
                    <Clock size={14} />
                    {t("order_details.ordered_at").replace(
                      "{time}",
                      new Date(order.createdAt).toLocaleString()
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <User size={12} />
                    {t("manager.order_detail.customer_id")}:{" "}
                    {order.customerId.substring(0, 8)}…
                  </p>
                </div>
              </div>
              <Badge
                className={cn(
                  "rounded-full px-6 py-1.5 text-xs font-bold border self-start md:self-center",
                  statusColors[order.status]
                )}
              >
                {t(statusLabels[order.status]) || order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 md:p-12">
            {!isCanceled ? (
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="absolute left-[15px] md:left-0 md:top-[15px] h-full w-[2px] md:h-[2px] md:w-full bg-secondary/10 -z-10" />
                <div
                  className="absolute left-[15px] md:left-0 md:top-[15px] h-full w-[2px] md:h-[2px] bg-primary transition-all duration-1000 -z-10"
                  style={
                    isMobile
                      ? {
                          height: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                          width: "2px",
                        }
                      : {
                          width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                          height: "2px",
                        }
                  }
                />
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isActive = index === currentStatusIndex;
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.status}
                      className="flex md:flex-col items-center gap-4 md:gap-3 group"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                          isCompleted
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-white border-2 border-secondary/20 text-muted-foreground",
                          isActive && "scale-125 ring-4 ring-primary/10"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Circle size={16} />
                        )}
                      </div>
                      <div className="flex flex-col md:items-center">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                            isCompleted ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {t(step.labelKey)}
                        </span>
                        <Icon
                          size={16}
                          className={cn(
                            "mt-1 transition-colors duration-300",
                            isCompleted
                              ? "text-primary"
                              : "text-muted-foreground/30"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-6 rounded-full bg-red-50 text-red-500 mb-4">
                  <UtensilsCrossed size={48} />
                </div>
                <h3 className="text-xl font-bold text-red-600">
                  {t("order_details.canceled_title")}
                </h3>
                <p className="text-muted-foreground mt-2 max-w-xs">
                  {t("order_details.canceled_desc")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 overflow-hidden bg-white">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-bold">
                  {t("order_details.order_items")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                {(order.menuItems || []).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-secondary/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-secondary/5 flex items-center justify-center text-primary font-bold shrink-0">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.itemName}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {t("order_details.unit_price").replace(
                            "{price}",
                            item.price.toLocaleString()
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-sm">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 overflow-hidden bg-primary text-primary-foreground h-fit">
              <CardHeader className="p-8">
                <CardTitle className="text-lg font-bold opacity-80">
                  {t("order_details.total_payment")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium opacity-70">
                    {t("order_details.subtotal")}
                  </span>
                  <span className="text-3xl font-black">
                    {total.toLocaleString()}đ
                  </span>
                </div>

                {!isCanceled && (order.status === "PURCHASED" || order.status === "PROCESSING") && (
                  <>
                    <Separator className="bg-white/20" />
                    <div>
                      {order.status === "PURCHASED" && (
                        <Button
                          onClick={handleConfirm}
                          disabled={confirmOrder.isPending}
                          className="w-full rounded-xl h-12 font-bold gap-2 bg-white text-primary hover:bg-white/90 cursor-pointer"
                        >
                          {confirmOrder.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <ChefHat size={16} />
                          )}
                          {t("manager.orders.start_cooking")}
                        </Button>
                      )}
                      {order.status === "PROCESSING" && (
                        <Button
                          onClick={handleMarkFinished}
                          disabled={markFinished.isPending}
                          className="w-full rounded-xl h-12 font-bold gap-2 bg-white text-primary hover:bg-white/90 cursor-pointer"
                        >
                          {markFinished.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                          {t("manager.orders.finish")}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
