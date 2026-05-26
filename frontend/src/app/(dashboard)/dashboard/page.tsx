"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVendorDashboard } from "@/features/vendor/data-access/vendor.queries";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { CheckCircle2, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

function VendorDashboardSummary() {
  const { data: dashboard } = useVendorDashboard();
  const { t } = useLanguage();

  if (!dashboard) return null;

  const formatVND = (value: number) => value.toLocaleString('vi-VN') + 'đ';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
      <Card className="rounded-[2rem] border-none shadow-xl shadow-primary/5 bg-white">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {t('dashboard.today_income') || 'Hôm nay'}
            </p>
            <p className="text-lg font-black text-primary">{formatVND(dashboard.todayIncome)}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-[2rem] border-none shadow-xl shadow-primary/5 bg-white">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {t('dashboard.completed') || 'Hoàn thành'}
            </p>
            <p className="text-lg font-black text-emerald-600">{dashboard.completedOrders}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-[2rem] border-none shadow-xl shadow-primary/5 bg-white">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {t('dashboard.pending') || 'Đang chờ'}
            </p>
            <p className="text-lg font-black text-amber-600">{dashboard.pendingOrders}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const firstName = user?.fullName?.split(" ").pop() || "bạn";

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12
      ? "dashboard.greeting_morning"
      : hour < 18
        ? "dashboard.greeting_afternoon"
        : "dashboard.greeting_evening";

  const isVendorRole = user?.role === "MANAGER" || user?.role === "STAFF";

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="p-6">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-primary break-words text-center">
          {t(greetingKey)}, {firstName}!
        </h1>
      </div>
      <p className="text-muted-foreground text-xl font-medium">
        {t("dashboard.question")}
      </p>

      {isVendorRole && <VendorDashboardSummary />}

      <div className="flex flex-wrap justify-center gap-4 pt-4">
        {isVendorRole ? (
          <>
            <Button
              asChild
              className="rounded-2xl h-14 px-8 font-bold text-lg shadow-xl shadow-primary/20"
            >
              <Link href={user?.role === "MANAGER" ? "/manager/orders" : "/staff/orders"}>
                {t("dashboard.manage_orders") || "Quản lý đơn hàng"}
              </Link>
            </Button>
            {user?.role === "MANAGER" && (
              <Button
                asChild
                variant="outline"
                className="rounded-2xl h-14 px-8 font-bold text-lg border-secondary/20 hover:bg-secondary/5"
              >
                <Link href="/manager/vendor">{t("dashboard.my_vendor") || "Cửa hàng của tôi"}</Link>
              </Button>
            )}
            {user?.role === "STAFF" && (
              <Button
                asChild
                variant="outline"
                className="rounded-2xl h-14 px-8 font-bold text-lg border-secondary/20 hover:bg-secondary/5"
              >
                <Link href="/staff/vendor">{t("dashboard.my_vendor") || "Cửa hàng của tôi"}</Link>
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              asChild
              className="rounded-2xl h-14 px-8 font-bold text-lg shadow-xl shadow-primary/20"
            >
              <Link href="/vendors">{t("dashboard.explore_stores")}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-2xl h-14 px-8 font-bold text-lg border-secondary/20 hover:bg-secondary/5"
            >
              <Link href="/menu">{t("dashboard.view_menu")}</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
