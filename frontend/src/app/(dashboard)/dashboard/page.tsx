"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { PRODUCTS, PROMOTIONS } from "@/lib/mock-data"
import { motion } from "framer-motion"
import { Bell, MapPin, Search } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
           <p className="text-muted-foreground text-sm flex items-center gap-1">
             <MapPin size={14}/> ĐH Bách Khoa
           </p>
           <h1 className="text-2xl font-bold text-primary">Chào buổi sáng, User! 👋</h1>
        </div>
        <div className="p-3 bg-secondary/10 rounded-full">
           <Bell className="text-secondary" size={20} />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
         <Search className="absolute left-4 top-3.5 text-muted-foreground h-5 w-5" />
         <Input placeholder="Bạn muốn ăn gì hôm nay?" className="h-12 pl-12 rounded-2xl border-secondary/20 bg-secondary/5 border-dashed" />
      </div>

      {/* Promotions (Horizontal Scroll) */}
      <div className="space-y-3">
         <h2 className="text-lg font-bold">Khuyến mãi hot 🔥</h2>
         <ScrollArea className="w-full whitespace-nowrap rounded-2xl">
            <div className="flex w-max space-x-4 pb-4">
               {PROMOTIONS.map((promo, idx) => (
                 <motion.div 
                    key={promo.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                 >
                   <div className={`w-64 h-32 rounded-3xl border-2 border-dashed p-6 flex flex-col justify-center shadow-sm ${promo.color}`}>
                      <h3 className="text-xl font-bold whitespace-normal">{promo.title}</h3>
                      <p className="text-xs mt-2 opacity-80">HSD: 24/10/2024</p>
                   </div>
                 </motion.div>
               ))}
            </div>
            <ScrollBar orientation="horizontal" />
         </ScrollArea>
      </div>

      {/* Suggestions */}
      <div className="space-y-3">
         <h2 className="text-lg font-bold">Gợi ý cho bạn 🍽️</h2>
         <div className="grid grid-cols-2 gap-4">
            {PRODUCTS.slice(0, 4).map((product, idx) => (
               <motion.div
                 key={product.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 + idx * 0.1 }}
               >
                 <Card className="rounded-3xl border-2 border-dashed border-secondary/20 overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                    <div className="h-32 bg-gray-100 relative">
                       {/* Mock Image */}
                       <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-orange-500 shadow-sm flex items-center gap-1">
                          ⭐ {product.rating}
                       </div>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                       <h3 className="font-bold text-base line-clamp-1">{product.name}</h3>
                       <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{product.description}</p>
                       <div className="mt-auto pt-3 flex items-center justify-between">
                          <span className="font-bold text-primary">
                             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                          </span>
                       </div>
                    </CardContent>
                 </Card>
               </motion.div>
            ))}
         </div>
      </div>
    </div>
  )
}