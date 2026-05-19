"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderCard } from "@/features/order/components/OrderCard";
import { OrderDto } from "@/features/order/config/order.types";
import { useMyOrders } from "@/features/order/data-access/order.queries";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  RefreshCcw,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useReducer, useState } from "react";

const ACTIVE_STATUSES = ["PENDING", "PURCHASED", "PROCESSING"];
const HISTORY_STATUSES = ["COMPLETED", "DELIVERED", "CANCELED"];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PURCHASED: "bg-blue-100 text-blue-700 border-blue-200",
  PROCESSING: "bg-indigo-100 text-indigo-700 border-indigo-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELED: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  PENDING: "order_status.pending",
  PURCHASED: "order_status.purchased",
  PROCESSING: "order_status.processing",
  COMPLETED: "order_status.completed",
  DELIVERED: "order_status.delivered",
  CANCELED: "order_status.canceled",
};

const HISTORY_PAGE_SIZE = 6;

type OrdersState = { allOrders: OrderDto[]; hasMorePages: boolean };
type OrdersAction =
  | { type: "SET"; content: OrderDto[]; hasNextPage: boolean }
  | { type: "APPEND"; content: OrderDto[]; hasNextPage: boolean };

function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case "SET":
      return { allOrders: action.content, hasMorePages: action.hasNextPage };
    case "APPEND": {
      const existingIds = new Set(state.allOrders.map((o) => o.orderId));
      const newOnes = action.content.filter((o) => !existingIds.has(o.orderId));
      return {
        allOrders: [...state.allOrders, ...newOnes],
        hasMorePages: action.hasNextPage,
      };
    }
  }
}

export default function OrdersPage() {
  const [page, setPage] = useState(0);
  const [historyPage, setHistoryPage] = useState(0);
  const [{ allOrders, hasMorePages }, dispatch] = useReducer(ordersReducer, {
    allOrders: [],
    hasMorePages: false,
  });
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  // Fetch a large batch so we can split active vs history client-side
  const { data: ordersPage, isLoading, refetch } = useMyOrders(page, 50);
  const { t } = useLanguage();
  const applyUpdates = useRealtimeOrders((state) => state.applyUpdates);
  const updates = useRealtimeOrders((state) => state.updates);

  useEffect(() => {
    if (ordersPage) {
      dispatch({
        type: page === 0 ? "SET" : "APPEND",
        content: ordersPage.content,
        hasNextPage: ordersPage.hasNextPage,
      });
    }
  }, [ordersPage, page]);

  const mergedOrders = useMemo(
    () => (updates.size > 0 ? applyUpdates(allOrders) : allOrders),
    [allOrders, updates, applyUpdates],
  );

  const activeOrders = useMemo(
    () =>
      mergedOrders
        .filter((o) => ACTIVE_STATUSES.includes(o.status))
        .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortBy === "newest" ? dateB - dateA : dateA - dateB;
        }),
    [mergedOrders, sortBy],
  );

  const historyOrders = useMemo(
    () =>
      mergedOrders
        .filter((o) => HISTORY_STATUSES.includes(o.status))
        .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortBy === "newest" ? dateB - dateA : dateA - dateB;
        }),
    [mergedOrders, sortBy],
  );

  const totalHistoryPages = Math.ceil(historyOrders.length / HISTORY_PAGE_SIZE);
  const pagedHistory = historyOrders.slice(
    historyPage * HISTORY_PAGE_SIZE,
    (historyPage + 1) * HISTORY_PAGE_SIZE,
  );

  const isEmpty = allOrders.length === 0;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
            {t("orders.title")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("orders.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={sortBy}
            onValueChange={(v: "newest" | "oldest") => {
              setSortBy(v);
              setHistoryPage(0);
            }}
          >
            <SelectTrigger className="w-40 rounded-xl border-secondary/20 h-10">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-muted-foreground" />
                <SelectValue placeholder={t("manager.orders.sort")} />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-xl">
              <SelectItem value="newest" className="rounded-lg cursor-pointer">
                {t("manager.orders.newest")}
              </SelectItem>
              <SelectItem value="oldest" className="rounded-lg cursor-pointer">
                {t("manager.orders.oldest")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPage(0);
              refetch();
            }}
            className="rounded-xl h-10 gap-2 border-secondary/20 hover:bg-secondary/5"
          >
            <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
            {t("orders.refresh")}
          </Button>
        </div>
      </div>

      {isLoading && allOrders.length === 0 ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center h-96 text-center space-y-6 bg-white rounded-[3rem] shadow-xl shadow-secondary/5 border-none">
          <div className="p-8 rounded-full bg-secondary/5">
            <ClipboardList className="h-16 w-16 text-muted-foreground/30" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-primary">
              {t("orders.empty")}
            </h3>
            <p className="text-muted-foreground max-w-xs">
              {t("orders.empty_desc")}
            </p>
          </div>
          <Button asChild className="rounded-2xl h-12 px-8 font-bold">
            <Link href="/vendors">{t("orders.order_now")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Orders */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-primary">
                {t("orders.active_orders")}
              </h2>
              <Badge
                variant="secondary"
                className="rounded-full bg-primary/10 text-primary border-none"
              >
                {activeOrders.length}
              </Badge>
            </div>

            {activeOrders.length > 0 ? (
              <div className="space-y-6">
                {activeOrders.map((order) => (
                  <OrderCard key={order.orderId} order={order} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-secondary/5 rounded-[2.5rem] text-center space-y-4">
                <div className="p-4 rounded-full bg-white text-muted-foreground/20">
                  <ShoppingBag size={40} />
                </div>
                <p className="text-muted-foreground font-medium">
                  {t("orders.no_active")}
                </p>
              </div>
            )}
          </div>

          {/* Order History */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary">
              {t("orders.history")}
            </h2>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-secondary/5 overflow-hidden min-h-[400px] flex flex-col">
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                {pagedHistory.length > 0 ? (
                  <>
                    <div className="space-y-3 flex-1">
                      {pagedHistory.map((order) => (
                        <Link
                          key={order.orderId}
                          href={`/orders/${order.orderId}`}
                          className="flex items-center justify-between p-4 rounded-2xl bg-secondary/5 hover:bg-secondary/10 transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                                order.status === "CANCELED"
                                  ? "bg-red-100 text-red-500"
                                  : "bg-emerald-100 text-emerald-600",
                              )}
                            >
                              <CheckCircle2 size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">
                                #{order.orderId.substring(0, 8)}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                                {" · "}
                                {(order.totalPrice || 0).toLocaleString()}đ
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={cn(
                              "rounded-full text-[10px] font-bold border shrink-0 ml-2",
                              statusColors[order.status],
                            )}
                          >
                            {t(statusLabels[order.status]) || order.status}
                          </Badge>
                        </Link>
                      ))}
                    </div>

                    {totalHistoryPages > 1 && (
                      <div className="flex items-center justify-center gap-4 pt-6 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryPage((p) => p - 1)}
                          disabled={historyPage === 0}
                          className="rounded-xl h-9 gap-1 border-secondary/20 hover:bg-secondary/5"
                        >
                          <ChevronLeft size={14} />
                        </Button>
                        <span className="text-xs text-muted-foreground font-medium">
                          {historyPage + 1} / {totalHistoryPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryPage((p) => p + 1)}
                          disabled={historyPage >= totalHistoryPages - 1}
                          className="rounded-xl h-9 gap-1 border-secondary/20 hover:bg-secondary/5"
                        >
                          <ChevronRight size={14} />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-20 text-center space-y-4">
                    <CheckCircle2
                      size={40}
                      className="text-muted-foreground/20"
                    />
                    <p className="text-muted-foreground font-medium">
                      {t("orders.no_history")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {hasMorePages && (
              <Button
                variant="outline"
                className="w-full rounded-2xl h-12 border-secondary/20 hover:bg-secondary/5 font-medium"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : null}
                {t("orders.load_more")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
