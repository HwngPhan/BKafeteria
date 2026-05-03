"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Plus, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"
import { useMenuItems } from "@/features/menu/data-access/menu.queries"
import { useActiveVendors } from "@/features/vendor/data-access/vendor.queries"
import { useCartStore } from "@/features/cart/store/cart.store"
import { MenuItemDto } from "@/features/menu/config/menu.types"

const UI_CATEGORIES = ["Tất cả", "Món ăn", "Đồ uống", "Ăn vặt", "Tráng miệng"]

const CATEGORY_MAP: Record<string, string> = {
  "Món ăn": "Food",
  "Đồ uống": "Drink",
  "Ăn vặt": "Snack",
  "Tráng miệng": "Dessert"
}

export default function MenuPage() {
  const [activeCat, setActiveCat] = useState("All")
  const { addItem } = useCartStore()
  
  const { data: menuData, isLoading: menuLoading } = useMenuItems({
    category: activeCat === "All" ? undefined : CATEGORY_MAP[activeCat],
    size: 100
  })

  const { data: vendors } = useActiveVendors()

  const getVendorName = (vendorId: string) => {
    return vendors?.find(v => v.vendorId === vendorId)?.name || "Cửa hàng"
  }

  const handleAddToCart = (item: MenuItemDto) => {
    addItem({
      itemId: item.menuItemId,
      itemName: item.name,
      price: item.price,
      quantity: 1,
      vendorId: item.vendorId,
      vendorName: getVendorName(item.vendorId),
      imageUrl: item.imageUrl
    })
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
    <div className="px-4 py-6 space-y-6">
       <h1 className="text-3xl font-bold text-primary text-center">Thực đơn</h1>
       
       {/* Category Filter */}
       <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {UI_CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCat === cat ? "default" : "outline"}
              onClick={() => setActiveCat(cat)}
              className={`rounded-xl px-6 ${activeCat === cat ? "bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-secondary/30" : "border-secondary/30 text-muted-foreground"}`}
            >
              {cat}
            </Button>
          ))}
       </div>

       {/* List Items */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
          {products.length === 0 ? (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              Không tìm thấy món ăn nào trong danh mục này.
            </div>
          ) : (
            products.map((product, idx) => (
              <motion.div
                key={product.menuItemId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="rounded-3xl border-2 border-dashed border-secondary/20 p-3 flex gap-4 items-center shadow-sm hover:border-secondary transition-colors group">
                   <div className="h-24 w-24 rounded-2xl bg-secondary/5 overflow-hidden shrink-0 border relative">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 italic text-[10px] text-center px-1">Không có ảnh</div>
                      )}
                   </div>
                   <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                         <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                         <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-lg text-[10px]">
                            {product.category}
                         </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-end pt-2">
                         <div className="flex flex-col">
                            <span className="text-lg font-bold text-primary">
                               {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{getVendorName(product.vendorId)}</span>
                         </div>
                         <Button 
                           size="sm" 
                           className="rounded-xl h-10 w-10 p-0 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-transform active:scale-95"
                           onClick={() => handleAddToCart(product)}
                         >
                           <Plus strokeWidth={3} />
                         </Button>
                      </div>
                   </div>
                </Card>
              </motion.div>
            ))
          )}
       </div>
    </div>
  )
}