'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '../store/cart.store'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

export function CartSheet() {
  const { items, removeItem, updateQuantity, getTotalPrice, getItemsByVendor, clearCart } = useCartStore()
  const itemsByVendor = getItemsByVendor()
  const total = getTotalPrice()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-secondary/10">
          <ShoppingCart size={22} className="text-foreground/80" />
          {items.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {items.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold">
              <ShoppingBag className="text-primary" />
              Giỏ hàng của bạn
            </SheetTitle>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground hover:text-red-500">
                Xóa tất cả
              </Button>
            )}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-6">
            <div className="p-6 rounded-full bg-secondary/5">
              <ShoppingCart size={64} className="text-muted-foreground/30" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">Giỏ hàng trống</p>
            <Button variant="outline" className="rounded-full">Bắt đầu mua sắm</Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="py-6 space-y-8">
                {Object.entries(itemsByVendor).map(([vendorId, vendorItems]) => (
                  <div key={vendorId} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-primary">{vendorItems[0].vendorName}</h3>
                      <Badge variant="secondary" className="bg-primary/5 text-primary">
                        {vendorItems.length} món
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {vendorItems.map((item) => (
                        <div key={item.itemId} className="flex gap-4 group">
                          <div className="shrink-0 h-20 w-20 rounded-2xl bg-secondary/5 overflow-hidden border">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.itemName} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground/20 italic text-xs">Không có ảnh</div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                              <h4 className="font-semibold text-sm line-clamp-1">{item.itemName}</h4>
                              <p className="text-primary font-bold text-sm">
                                {item.price.toLocaleString()}đ
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-secondary/10 rounded-full p-1 h-8">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full"
                                  onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                                >
                                  <Minus size={14} />
                                </Button>
                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full"
                                  onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                                >
                                  <Plus size={14} />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeItem(item.itemId)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="bg-secondary/10" />
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="p-6 border-t bg-secondary/5 flex-col space-y-4">
              <div className="space-y-2 w-full">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{total.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Phí dịch vụ</span>
                  <span>0đ</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{total.toLocaleString()}đ</span>
                </div>
              </div>
              <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                Thanh toán ngay
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
