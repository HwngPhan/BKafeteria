"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FoodCategory } from "@/features/menu/config/menu.config";
import { useMenuItemsByVendorId } from "@/features/menu/data-access/menu.queries";
import { CATEGORY_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Loader2,
  Search,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const categories: FoodCategory[] = [
  "BEVERAGES",
  "PASTRIES",
  "SNACKS",
  "MEALS",
  "DESSERTS",
];

export default function StaffMenuPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: menuItems, isLoading } = useMenuItemsByVendorId(user?.vendorId ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FoodCategory | "ALL">("ALL");

  const filteredItems = menuItems?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "ALL" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
          {t("manager.menu.title")}
        </h1>
        <p className="text-muted-foreground mt-1 font-medium flex items-center gap-2">
          {t("manager.menu.subtitle")}
        </p>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("manager.menu.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("ALL")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  activeCategory === "ALL"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-secondary/5 text-muted-foreground hover:bg-secondary/10"
                )}
              >
                {t("menu.cat_all") || "Tất cả"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    activeCategory === cat
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-secondary/5 text-muted-foreground hover:bg-secondary/10"
                  )}
                >
                  {t(CATEGORY_MAP[cat]) || cat}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          {filteredItems && filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.menuItemId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="relative rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 bg-white overflow-hidden">
                    <div className="relative w-full h-56 bg-secondary/5 overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20">
                          <ImageIcon className="h-12 w-12 mb-2" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            {t("manager.menu.no_image") || "NO IMAGE"}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-5 left-5">
                        <Badge className="rounded-2xl bg-white/70 backdrop-blur-md text-primary border-none px-4 py-1.5 shadow-xl shadow-black/5 text-[10px] font-black uppercase tracking-widest">
                          {t(CATEGORY_MAP[item.category]) || item.category}
                        </Badge>
                      </div>
                      {item.remaining === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-black text-sm uppercase tracking-widest bg-red-500/90 px-4 py-1.5 rounded-xl">
                            {t("menu.sold_out") || "Hết hàng"}
                          </span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-7 space-y-5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-black text-xl text-primary leading-tight line-clamp-1 flex-1">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0 bg-amber-400/10 text-amber-600 rounded-full px-2.5 py-1 text-xs font-bold">
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            <span>{item.rating ? item.rating.toFixed(1) : "5.0"}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed min-h-[2.5rem]">
                          {item.description || t("manager.menu.no_desc")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-5 border-t border-secondary/10">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                            {t("manager.menu.price")}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-black text-primary text-xl">
                              {item.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-primary/60 uppercase">VND</span>
                          </div>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                            {t("manager.menu.remaining")}
                          </span>
                          <div className="flex items-center justify-end gap-2">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full animate-pulse",
                                item.remaining === 0
                                  ? "bg-red-500"
                                  : item.remaining > 10
                                    ? "bg-emerald-500"
                                    : "bg-amber-500",
                              )}
                            />
                            <span
                              className={cn(
                                "text-sm font-black",
                                item.remaining === 0
                                  ? "text-red-600"
                                  : item.remaining > 10
                                    ? "text-emerald-600"
                                    : "text-amber-600",
                              )}
                            >
                              {item.remaining}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="p-8 rounded-full bg-secondary/5">
                <UtensilsCrossed className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">
                  {t("manager.menu.empty")}
                </h3>
                <p className="text-muted-foreground max-w-xs">
                  {t("manager.menu.empty_desc")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
