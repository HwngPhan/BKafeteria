"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useVendorById,
  useVendorDashboard,
} from "@/features/vendor/data-access/vendor.queries";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Store,
  TrendingUp,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import Image from "next/image";

export default function StaffVendorPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: vendor, isLoading } = useVendorById(user?.vendorId ?? "");
  const { data: dashboard } = useVendorDashboard();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4">
        <Store className="h-20 w-20 text-muted-foreground/30" />
        <p className="text-muted-foreground font-medium">{t("manager.vendor.no_vendor_desc")}</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    ACCEPTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    CLOSED: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const statusLabelKeys: Record<string, string> = {
    PENDING: "manager.vendor.status_pending",
    ACCEPTED: "manager.vendor.status_accepted",
    REJECTED: "manager.vendor.status_rejected",
    CLOSED: "manager.vendor.status_closed",
  };

  const formatVND = (value: number) => value.toLocaleString('vi-VN') + 'đ';

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
            {t("manager.vendor.title")}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            {t("manager.vendor.subtitle")}
          </p>
        </div>
        <Badge
          className={cn(
            "rounded-full px-6 py-2 text-xs font-bold border self-start md:self-auto",
            statusColors[vendor.status],
          )}
        >
          {t(statusLabelKeys[vendor.status]) || vendor.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white">
            <CardHeader className="p-8 border-b bg-secondary/5">
              <div className="flex items-center gap-4">
                {vendor.imgUrl ? (
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-primary/10 shrink-0">
                    <Image src={vendor.imgUrl} alt={vendor.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                    <Store size={24} />
                  </div>
                )}
                <div>
                  <CardTitle className="text-xl font-bold">
                    {t("manager.vendor.card_title")}
                  </CardTitle>
                  <CardDescription className="font-medium text-xs">
                    {t("manager.vendor.card_desc")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {t("manager.vendor.name")}
                  </p>
                  <p className="text-lg font-bold text-primary">{vendor.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {t("manager.vendor.cert")}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {vendor.certification || t("admin.vendors.no_cert")}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {t("manager.vendor.desc")}
                </p>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  {vendor.description || t("manager.vendor.no_desc")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-secondary/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-secondary/5 text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {t("manager.vendor.open")}
                    </p>
                    <p className="font-bold text-primary">{vendor.workingHourFrom}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-secondary/5 text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {t("manager.vendor.close")}
                    </p>
                    <p className="font-bold text-primary">{vendor.workingHourTo}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income cards */}
          {dashboard && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: t('dashboard.today_income') || 'Hôm nay', value: formatVND(dashboard.todayIncome) },
                { label: t('dashboard.week_income') || 'Tuần này', value: formatVND(dashboard.weekIncome) },
                { label: t('dashboard.month_income') || 'Tháng này', value: formatVND(dashboard.monthIncome) },
              ].map((item) => (
                <Card key={item.label} className="rounded-[2rem] border-none shadow-xl shadow-secondary/5 bg-white">
                  <CardContent className="p-6 space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
                    <p className="text-lg font-black text-primary truncate">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Top dishes */}
          {dashboard && dashboard.topDishes.length > 0 && (
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 bg-white">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp size={20} className="text-primary" />
                  {t('dashboard.top_dishes') || 'Món bán chạy'}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-3">
                {dashboard.topDishes.map((dish, i) => (
                  <div key={dish.itemId} className="flex items-center justify-between bg-secondary/5 rounded-2xl px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-primary/40 w-5">#{i + 1}</span>
                      <span className="text-sm font-bold text-zinc-900">{dish.itemName}</span>
                    </div>
                    <span className="text-xs font-black text-primary">{dish.totalQuantity} {t('dashboard.sold') || 'phần'}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 overflow-hidden bg-white">
            <CardHeader className="p-8">
              <CardTitle className="text-lg font-bold">
                {t("manager.vendor.stats")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              <div className="flex items-center gap-4 bg-secondary/5 p-4 rounded-3xl">
                <div className="p-3 rounded-2xl bg-white text-primary shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {t("manager.vendor.completed")}
                  </p>
                  <p className="text-2xl font-black text-primary">
                    {dashboard ? dashboard.completedOrders : '--'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-3xl">
                <div className="p-3 rounded-2xl bg-white text-amber-600 shadow-sm">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {t("manager.vendor.pending") || 'Đang chờ'}
                  </p>
                  <p className="text-2xl font-black text-amber-600">
                    {dashboard ? dashboard.pendingOrders : '--'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-red-50 p-4 rounded-3xl">
                <div className="p-3 rounded-2xl bg-white text-red-500 shadow-sm">
                  <XCircle size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {t("manager.vendor.canceled") || 'Đã hủy'}
                  </p>
                  <p className="text-2xl font-black text-red-500">
                    {dashboard ? dashboard.canceledOrders : '--'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl">
                <div className="p-3 rounded-2xl bg-white text-primary shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {t('dashboard.total_orders') || 'Tổng đơn'}
                  </p>
                  <p className="text-2xl font-black text-primary">
                    {dashboard ? dashboard.totalOrders : '--'}
                  </p>
                </div>
              </div>
              {dashboard && (
                <div className="flex items-center gap-4 bg-secondary/5 p-4 rounded-3xl">
                  <div className="p-3 rounded-2xl bg-white text-primary shadow-sm">
                    <UtensilsCrossed size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {t('dashboard.avg_prep') || 'Thời gian TB'}
                    </p>
                    <p className="text-2xl font-black text-primary">
                      {Math.round(dashboard.averagePrepTimeMinutes)}<span className="text-xs font-bold ml-1">phút</span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
