"use client"
import { useCart } from "@/components/cart/cart-providers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PRODUCTS, Vendor, VENDORS } from "@/lib/mock-data"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, MapPin, Search, Star } from "lucide-react"
import { useState } from "react"

export default function VendorPage() {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const { addToCart } = useCart()

  // --- VIEW: VENDOR DETAIL ---
  if (selectedVendor) {
     const vendorProducts = PRODUCTS.filter(p => p.vendorId === selectedVendor.id)
     
     return (
       <div className="min-h-screen bg-background">
          {/* Header Image */}
          <div className="h-48 bg-gray-200 relative">
             <Button 
               variant="secondary" 
               size="icon" 
               className="absolute top-4 left-4 rounded-full shadow-lg bg-white/80 backdrop-blur hover:bg-white"
               onClick={() => setSelectedVendor(null)}
             >
               <ArrowLeft size={20} className="text-foreground"/>
             </Button>
          </div>
          
          {/* Content */}
          <div className="-mt-10 rounded-t-3xl bg-background relative px-6 pt-8 pb-20">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold">{selectedVendor.name}</h1>
                  <div className="flex gap-3 text-sm text-muted-foreground mt-2">
                     <span className="flex items-center gap-1"><Star size={14} className="text-orange-500 fill-orange-500"/> {selectedVendor.rating}</span>
                     <span className="flex items-center gap-1"><Clock size={14}/> {selectedVendor.time}</span>
                     <span className="flex items-center gap-1"><MapPin size={14}/> {selectedVendor.distance}</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-white shadow-md border-2 border-dashed border-secondary/30 -mt-16 flex items-center justify-center">
                   <span className="font-bold text-xs text-center px-1">Logo</span>
                </div>
             </div>

             <h2 className="font-bold text-lg mb-4">Menu ({vendorProducts.length})</h2>
             <div className="space-y-4">
                {vendorProducts.map((product) => (
                   <Card key={product.id} className="rounded-2xl border border-secondary/20 shadow-none flex p-3 gap-3">
                      <div className="h-20 w-20 rounded-xl bg-gray-100 shrink-0"/>
                      <div className="flex-1 flex flex-col justify-between">
                         <h4 className="font-bold line-clamp-1">{product.name}</h4>
                         <div className="flex justify-between items-center mt-2">
                            <span className="font-bold text-primary">{product.price.toLocaleString()}đ</span>
                            <Button size="sm" className="h-8 rounded-lg px-3" onClick={() => addToCart(product)}>Thêm</Button>
                         </div>
                      </div>
                   </Card>
                ))}
             </div>
          </div>
       </div>
     )
  }

  // --- VIEW: LIST VENDORS ---
  return (
    <div className="px-4 py-6 space-y-6">
       <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Đối tác</h1>
          <p className="text-muted-foreground">Các thương hiệu đồng hành cùng BKAFETERIA</p>
       </div>

       <div className="relative">
         <Search className="absolute left-4 top-3.5 text-muted-foreground h-5 w-5" />
         <Input placeholder="Tìm quán ăn..." className="h-12 pl-12 rounded-2xl border-secondary/20 bg-secondary/5 border-dashed" />
      </div>

       <div className="grid grid-cols-1 gap-4 pb-20">
          {VENDORS.map((vendor, idx) => (
             <motion.div
               key={vendor.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               onClick={() => setSelectedVendor(vendor)}
               className="cursor-pointer"
             >
                <Card className="rounded-3xl border-2 border-dashed border-secondary/30 overflow-hidden hover:border-secondary hover:shadow-lg transition-all">
                   <div className="h-32 bg-gray-100 relative">
                      <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                         <Clock size={12}/> {vendor.time} • {vendor.distance}
                      </div>
                   </div>
                   <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30 shrink-0 text-xs font-bold text-secondary">
                         Logo
                      </div>
                      <div className="flex-1">
                         <h3 className="font-bold text-lg">{vendor.name}</h3>
                         <div className="flex gap-1 mt-1">
                            {[1,2,3,4,5].map((s) => (
                               <Star key={s} size={12} className={`${s <= Math.round(vendor.rating) ? "text-orange-400 fill-orange-400" : "text-gray-300"}`} />
                            ))}
                         </div>
                      </div>
                      <Badge variant="secondary" className="rounded-lg">
                         4.8
                      </Badge>
                   </CardContent>
                </Card>
             </motion.div>
          ))}
       </div>
    </div>
  )
}