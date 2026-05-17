"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/features/cart/store/cart.store"
import { MenuItemDto } from "@/features/menu/config/menu.types"
import { useMenuItems } from "@/features/menu/data-access/menu.queries"
import { useActiveVendors } from "@/features/vendor/data-access/vendor.queries"
import { CATEGORY_MAP } from "@/lib/constants"
import { useLanguage } from "@/providers/LanguageProvider"
import { motion } from "framer-motion"
import { Loader2, Plus, Star, UtensilsCrossed } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

// Ensure CATEGORIES is imported and defined correctly
const CATEGORIES = [
  { key: 'menu.cat_all', backendValue: 'all' },
  { key: 'menu.cat_beverages', backendValue: 'BEVERAGES' },
  { key: 'menu.cat_pastries', backendValue: 'PASTRIES' },
  { key: 'menu.cat_snacks', backendValue: 'SNACKS' },
  { key: 'menu.cat_meals', backendValue: 'MEALS' },
  { key: 'menu.cat_desserts', backendValue: 'DESSERTS' },
]
export default function MenuPage() {
  const { t } = useLanguage()
  const [activeCatKey, setActiveCatKey] = useState('menu.cat_all')
  const { addItem } = useCartStore()

  const activeBackendValue = CATEGORIES.find(c => c.key === activeCatKey)?.backendValue

  const { data: menuData, isLoading: menuLoading } = useMenuItems({
    category: activeBackendValue === 'all' ? undefined : activeBackendValue,
    size: 100,
  })

  const { data: vendors } = useActiveVendors()

  const getVendorName = (vendorId: string) =>
    vendors?.find(v => v.vendorId === vendorId)?.name || t('menu.default_vendor')

  const handleAddToCart = (item: MenuItemDto) => {
    addItem({
      itemId: item.menuItemId,
      itemName: item.name,
      price: item.price,
      quantity: 1,
      vendorId: item.vendorId,
      vendorName: getVendorName(item.vendorId),
      imageUrl: item.imageUrl,
    })
    toast.success(t('menu.added_to_cart').replace('{name}', item.name))
  }

  if (menuLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const products = menuData?.content || []

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-primary">{t('menu.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('menu.subtitle')}</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.key}
            variant={activeCatKey === cat.key ? "default" : "outline"}
            onClick={() => setActiveCatKey(cat.key)}
            className={`rounded-full px-6 h-10 font-semibold transition-all ${
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 space-y-4">
            <div className="p-6 rounded-full bg-secondary/5">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground font-medium">{t('menu.not_found')}</p>
          </div>
        ) : (
          products.map((product, idx) => (
            <motion.div
              key={product.menuItemId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
            >
              <div className="group relative overflow-hidden rounded-3xl bg-white border-none shadow-lg shadow-secondary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                <div className="relative h-44 w-full overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-secondary/5 to-primary/5 flex items-center justify-center">
                      <UtensilsCrossed className="h-10 w-10 text-muted-foreground/15" />
                    </div>
                  )}
                  <Badge className="absolute right-3 top-3 bg-white/80 text-primary backdrop-blur-md border-none font-semibold text-xs">
                    {t(CATEGORY_MAP[product.category])}
                  </Badge>
                  <div className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                    <Star size={12} className="fill-white" />
                    {product.rating}
                  </div>
                  {product.remaining !== undefined && product.remaining <= 5 && (
                    <div className="absolute top-0 left-0 w-full bg-red-500/90 text-white text-[10px] font-bold py-0.5 text-center">
                      {t('menu.remaining').replace('{n}', String(product.remaining))}
                    </div>
                  )}
                </div>

                <div className="p-5 pb-0 space-y-1">
                  <h3 className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                    {product.description || t('menu.fresh_daily')}
                  </p>
                </div>

                <div className="p-5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-medium">{getVendorName(product.vendorId)}</span>
                    <span className="text-lg font-black text-primary">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    onClick={() => handleAddToCart(product)}
                    className="h-10 w-10 rounded-2xl shadow-lg shadow-primary/20 hover:scale-110 transition-transform"
                  >
                    <Plus size={20} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
