"use client";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/store/cart.store";
import { MenuCard } from "@/features/menu/components/MenuCard";
import { MenuItemDto } from "@/features/menu/config/menu.types";
import { useMenuItems } from "@/features/menu/data-access/menu.queries";
import { useActiveVendors } from "@/features/vendor/data-access/vendor.queries";
import { useLanguage } from "@/providers/LanguageProvider";
import { motion } from "framer-motion";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Ensure CATEGORIES is imported and defined correctly
const CATEGORIES = [
  { key: "menu.cat_all", backendValue: "all" },
  { key: "menu.cat_beverages", backendValue: "BEVERAGES" },
  { key: "menu.cat_pastries", backendValue: "PASTRIES" },
  { key: "menu.cat_snacks", backendValue: "SNACKS" },
  { key: "menu.cat_meals", backendValue: "MEALS" },
  { key: "menu.cat_desserts", backendValue: "DESSERTS" },
];
export default function MenuPage() {
  const { t } = useLanguage();
  const [activeCatKey, setActiveCatKey] = useState("menu.cat_all");
  const { addItem } = useCartStore();

  const activeBackendValue = CATEGORIES.find(
    (c) => c.key === activeCatKey,
  )?.backendValue;

  const { data: menuData, isLoading: menuLoading } = useMenuItems({
    category: activeBackendValue === "all" ? undefined : activeBackendValue,
    size: 100,
  });

  const { data: vendors } = useActiveVendors();

  const getVendorName = (vendorId: string) =>
    vendors?.find((v) => v.vendorId === vendorId)?.name ||
    t("menu.default_vendor");

  const handleAddToCart = (item: MenuItemDto) => {
    addItem({
      itemId: item.menuItemId,
      itemName: item.name,
      price: item.price,
      quantity: 1,
      vendorId: item.vendorId,
      vendorName: getVendorName(item.vendorId),
      imageUrl: item.imageUrl,
    });
    toast.success(t("menu.added_to_cart").replace("{name}", item.name));
  };

  if (menuLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const products = menuData?.content || [];

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
          {t("menu.title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          {t("menu.subtitle")}
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.key}
            variant={activeCatKey === cat.key ? "default" : "outline"}
            onClick={() => setActiveCatKey(cat.key)}
            className={`rounded-full px-4 md:px-6 h-8 md:h-10 text-xs md:text-sm font-semibold transition-all shrink-0 ${
              activeCatKey === cat.key
                ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
            }`}
          >
            {t(cat.key)}
          </Button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 space-y-4">
            <div className="p-6 rounded-full bg-secondary/5">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground font-medium">
              {t("menu.not_found")}
            </p>
          </div>
        ) : (
          products.map((product, idx) => (
            <motion.div
              key={product.menuItemId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
            >
              <MenuCard
                item={product}
                vendorName={getVendorName(product.vendorId)}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
