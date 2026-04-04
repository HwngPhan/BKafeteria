"use client"
import { useCart } from "@/components/cart/cart-providers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PRODUCTS } from "@/lib/mock-data"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { useState } from "react"

const CATEGORIES = ["All", "Food", "Drink", "Snack", "Healthy"]

export default function MenuPage() {
  const { addToCart } = useCart()
  const [activeCat, setActiveCat] = useState("All")

  const filteredProducts = activeCat === "All" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCat)

  return (
    <div className="px-4 py-6 space-y-6">
       <h1 className="text-3xl font-bold text-primary text-center">Thực đơn</h1>
       
       {/* Category Filter */}
       <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
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
       <div className="space-y-4 pb-20">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="rounded-3xl border-2 border-dashed border-secondary/20 p-3 flex gap-4 items-center shadow-sm hover:border-secondary transition-colors">
                 <div className="h-24 w-24 rounded-2xl bg-gray-100 shrink-0" />
                 <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                       <h3 className="font-bold text-lg">{product.name}</h3>
                       <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-lg">
                          {product.category}
                       </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-end pt-2">
                       <span className="text-lg font-bold text-primary">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                       </span>
                       <Button 
                         size="sm" 
                         className="rounded-xl h-10 w-10 p-0 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                         onClick={() => addToCart(product)}
                       >
                         <Plus strokeWidth={3} />
                       </Button>
                    </div>
                 </div>
              </Card>
            </motion.div>
          ))}
       </div>
    </div>
  )
}