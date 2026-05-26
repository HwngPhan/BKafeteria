'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useLanguage } from '@/providers/LanguageProvider'
import { Loader2, Minus, Plus, ShoppingBag, ShoppingCart, Trash2, UtensilsCrossed } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCreateOrder } from '../../order/data-access/order.queries'
import { useCartStore } from '../store/cart.store'

export function CartSheet() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const getItemsByVendor = useCartStore((state) => state.getItemsByVendor)

  const itemsByVendor = getItemsByVendor()
  const total = getTotalPrice()
  const createOrder = useCreateOrder()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  const handleCheckout = async () => {
    if (items.length === 0) return

    try {
      const vendorOrders = Object.entries(itemsByVendor).map(([vendorId, vendorItems]) => ({
        vendorId,
        items: vendorItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity
        }))
      }))

      await createOrder.mutateAsync({ vendorOrders })

      toast.success(t('cart.toast_success'))
      clearCart()
      setIsOpen(false)
      router.push('/orders')
    } catch (error: unknown) {
      toast.error(error?.message || t('cart.toast_error'))
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative border-1 border-slate-400 rounded-xl hover:bg-primary/10 transition-colors">
          <ShoppingCart size={22} className="text-foreground/80" />
          {items.length > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30 border-2 border-background animate-in zoom-in">
              {items.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-none shadow-2xl">
        <SheetHeader className="p-8 border-b bg-secondary/5">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3 text-2xl font-black text-primary">
              <div className="p-2 rounded-xl bg-primary/10">
                <ShoppingBag className="text-primary" size={24} />
              </div>
              {t('cart.title')}
            </SheetTitle>
            <SheetDescription className="sr-only">{t('cart.title')}</SheetDescription>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                disabled={createOrder.isPending}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs"
              >
                {t('cart.clear')}
              </Button>
            )}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-8 text-center">
            <div className="p-10 rounded-[3rem] bg-secondary/5 text-muted-foreground/20">
              <ShoppingCart size={80} />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-primary">{t('cart.empty_title')}</p>
              <p className="text-sm text-muted-foreground max-w-[200px]">{t('cart.empty_desc')}</p>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl h-12 px-8 font-bold border-secondary/20"
              onClick={() => setIsOpen(false)}
            >
              {t('cart.start_shopping')}
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-8 space-y-10">
                {Object.entries(itemsByVendor).map(([vendorId, vendorItems]) => (
                  <div key={vendorId} className="space-y-6">
                    <div className="flex items-center justify-between bg-secondary/5 p-4 rounded-2xl">
                      <h3 className="font-bold text-primary flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-secondary" />
                        {vendorItems[0].vendorName}
                      </h3>
                      <Badge variant="secondary" className="bg-white text-primary font-black shadow-sm">
                        {vendorItems.length} {t('cart.items_unit')}
                      </Badge>
                    </div>
                    <div className="space-y-6">
                      {vendorItems.map((item) => (
                        <div key={item.itemId} className="flex gap-4 group animate-in slide-in-from-right-4 duration-300">
                          <div className="shrink-0 h-24 w-24 rounded-3xl bg-secondary/5 overflow-hidden border-none shadow-inner flex items-center justify-center">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.itemName} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <UtensilsCrossed size={24} className="text-muted-foreground/20" />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                              <h4 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">{item.itemName}</h4>
                              <p className="text-primary font-black text-sm mt-1">
                                {item.price.toLocaleString()}đ
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center bg-secondary/5 rounded-2xl p-1 h-10 border border-secondary/10">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={createOrder.isPending}
                                  className="h-8 w-8 rounded-xl hover:bg-white hover:text-primary transition-all"
                                  onClick={(e) => { e.stopPropagation(); updateQuantity(item.itemId, item.quantity - 1) }}
                                >
                                  <Minus size={14} strokeWidth={3} />
                                </Button>
                                <span className="w-10 text-center text-sm font-black text-primary">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={createOrder.isPending}
                                  className="h-8 w-8 rounded-xl hover:bg-white hover:text-primary transition-all"
                                  onClick={(e) => { e.stopPropagation(); updateQuantity(item.itemId, item.quantity + 1) }}
                                >
                                  <Plus size={14} strokeWidth={3} />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={createOrder.isPending}
                                className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                onClick={() => removeItem(item.itemId)}
                              >
                                <Trash2 size={18} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="p-8 pt-6 border-t bg-secondary/5 flex-col space-y-6">
              <div className="space-y-3 w-full">
                <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <span>{t('cart.subtotal')}</span>
                  <span>{total.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <span>{t('cart.service_fee')}</span>
                  <span className="text-emerald-600">{t('cart.free')}</span>
                </div>
                <Separator className="bg-secondary/10" />
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-primary uppercase tracking-widest">{t('cart.total')}</span>
                  <span className="text-3xl font-black text-primary">{total.toLocaleString()}đ</span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={createOrder.isPending}
                className="w-full h-12 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('cart.processing')}
                  </>
                ) : (
                  t('cart.checkout')
                )}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
