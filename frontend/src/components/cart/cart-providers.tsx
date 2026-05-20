"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Product } from "@/lib/mock-data"
import { ShoppingCart, Trash2 } from "lucide-react"
import React, { createContext, useContext, useState } from "react"
import { toast } from "sonner"
import { useLanguage } from "@/providers/LanguageProvider"

type CartItem = Product & { quantity: number }

type CartContextType = {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { t } = useLanguage()

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(p => p.id === product.id)
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    toast.success(t('cart.providers.added').replace('{name}', product.name))
  }

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(p => p.id !== productId))
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}

export function CartFloatingButton() {
  const { items, total, count, removeFromCart } = useCart()
  const { t } = useLanguage()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-xl z-50 bg-primary hover:bg-primary/90">
          <div className="relative">
            <ShoppingCart className="text-white" />
            {count > 0 && (
              <span className="absolute -top-3 -right-3 h-6 w-6 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                {count}
              </span>
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-primary flex items-center gap-2">
             <ShoppingCart /> {t('cart.providers.title')}
          </SheetTitle>
          <SheetDescription className="sr-only">{t('cart.providers.title')}</SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6 my-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 mt-20">
               <ShoppingCart size={64} className="opacity-20"/>
               <p>{t('cart.providers.empty')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-secondary/30 bg-secondary/5">
                   <div className="h-16 w-16 rounded-lg bg-white overflow-hidden relative shadow-sm shrink-0">
                      {/* Placeholder image */}
                      <div className="w-full h-full bg-gray-200" /> 
                   </div>
                   <div className="flex-1">
                      <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-primary font-semibold text-sm">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                      </p>
                   </div>
                   <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-base h-8 w-8 flex items-center justify-center p-0">x{item.quantity}</Badge>
                      <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={18} />
                      </Button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t pt-4 space-y-4">
           <div className="flex justify-between items-center text-lg font-bold">
              <span>{t('cart.providers.total')}</span>
              <span className="text-primary text-xl">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
              </span>
           </div>
           <Button className="w-full h-14 text-lg font-bold rounded-xl" disabled={items.length === 0}>
             {t('cart.providers.checkout')}
           </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}