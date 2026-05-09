'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useCartStore } from '@/features/cart/store/cart.store'
import { CATEGORY_MAP } from '@/lib/constants'
import { Minus, Plus, ShoppingCart, Star, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { MenuItemDto } from '../config/menu.types'

interface MenuCardProps {
  item: MenuItemDto
  vendorName: string
}

export function MenuCard({ item, vendorName }: MenuCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [isOpen, setIsOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    addItem({
      itemId: item.menuItemId,
      itemName: item.name,
      price: item.price,
      quantity: quantity,
      vendorId: item.vendorId,
      vendorName: vendorName,
      imageUrl: item.imageUrl,
    })
    toast.success(`Đã thêm ${quantity} x ${item.name} vào giỏ hàng`)
    setIsOpen(false)
    setQuantity(1)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({
      itemId: item.menuItemId,
      itemName: item.name,
      price: item.price,
      quantity: 1,
      vendorId: item.vendorId,
      vendorName: vendorName,
      imageUrl: item.imageUrl,
    })
    toast.success(`Đã thêm ${item.name} vào giỏ hàng`)
  }

  return (
    <>
      <Card
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-3xl border-none bg-white shadow-lg shadow-secondary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
      >
        <CardHeader className="p-0">
          <div className="relative h-44 w-full overflow-hidden">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="h-full w-full bg-secondary/5 flex items-center justify-center text-muted-foreground/20 italic">
                <UtensilsCrossed size={32} />
              </div>
            )}
            <Badge className="absolute right-3 top-3 bg-white/80 text-primary backdrop-blur-md border-none">
              {CATEGORY_MAP[item.category] || item.category}
            </Badge>
            <div className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-xs font-bold text-white shadow-lg">
              <Star size={12} className="fill-white" />
              {item.rating || '5.0'}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pb-0">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">{item.name}</CardTitle>
            <CardDescription className="line-clamp-2 text-xs min-h-[32px]">
              {item.description || 'Được chế biến tươi ngon mỗi ngày.'}
            </CardDescription>
          </div>
        </CardContent>

        <CardFooter className="p-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">Giá</span>
            <span className="text-lg font-black text-primary">{item.price.toLocaleString()}đ</span>
          </div>

          <Button
            size="icon"
            onClick={handleQuickAdd}
            className="h-10 w-10 rounded-2xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
          </Button>
        </CardFooter>

        {item.remaining !== undefined && item.remaining <= 5 && (
          <div className="absolute top-0 left-0 w-full bg-red-500/90 text-white text-[10px] font-bold py-0.5 text-center">
            Chỉ còn {item.remaining} phần!
          </div>
        )}
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white max-w-lg">
          <div className="relative h-64 w-full">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-secondary/5 flex items-center justify-center text-muted-foreground/20 italic">
                <UtensilsCrossed size={64} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-8 right-8">
              <Badge className="bg-white/20 text-white backdrop-blur-md border-none mb-2">
                {CATEGORY_MAP[item.category] || item.category}
              </Badge>
              <h2 className="text-3xl font-black text-white">{item.name}</h2>
              <p className="text-white/80 text-sm font-medium">{vendorName}</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Mô tả món ăn</h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description || 'Món ăn được chế biến từ những nguyên liệu tươi ngon nhất, đảm bảo vệ sinh an toàn thực phẩm và hương vị đậm đà khó quên.'}
              </p>
            </div>

            <div className="flex items-center justify-between bg-secondary/5 p-6 rounded-[2rem]">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Giá mỗi phần</p>
                <p className="text-2xl font-black text-primary">{item.price.toLocaleString()}đ</p>
              </div>

              <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-sm border border-secondary/10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl hover:bg-secondary/10 text-primary transition-all"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus size={18} strokeWidth={3} />
                </Button>
                <span className="w-12 text-center text-lg font-black text-primary">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl hover:bg-secondary/10 text-primary transition-all"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus size={18} strokeWidth={3} />
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-14 rounded-2xl font-bold flex-1"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleAddToCart}
                className="h-14 rounded-2xl font-bold flex-[2] gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <ShoppingCart size={20} />
                Thêm vào giỏ • {(item.price * quantity).toLocaleString()}đ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
