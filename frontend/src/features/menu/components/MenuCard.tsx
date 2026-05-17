'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useCartStore } from '@/features/cart/store/cart.store'
import { CATEGORY_MAP } from '@/lib/constants'
import { useLanguage } from '@/providers/LanguageProvider'
import { Minus, Plus, ShoppingCart, Star, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { MenuItemDto } from '../config/menu.types'
import { MenuItemFeedbacksModal } from './MenuItemFeedbacksModal'

interface MenuCardProps {
  item: MenuItemDto
  vendorName: string
}

export function MenuCard({ item, vendorName }: MenuCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [isOpen, setIsOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { t } = useLanguage()
  const [isReviewsOpen, setIsReviewsOpen] = useState(false)

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
    toast.success(t('menu.added_n_items').replace('{n}', String(quantity)).replace('{name}', item.name))
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
    toast.success(t('menu.added_to_cart').replace('{name}', item.name))
  }

  return (
    <>
      <Card
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-none bg-white shadow-md shadow-secondary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
      >
        <CardHeader className="p-0">
          <div className="relative h-28 sm:h-44 w-full overflow-hidden">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="h-full w-full bg-secondary/5 flex items-center justify-center text-muted-foreground/20 italic">
                <UtensilsCrossed size={28} />
              </div>
            )}
            {/* Category badge — hidden on smallest screens to save space */}
            <Badge className="absolute right-2 top-2 hidden sm:flex bg-white/80 text-primary backdrop-blur-md border-none text-[10px]">
              {t(CATEGORY_MAP[item.category]) || item.category}
            </Badge>
            <div
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setIsReviewsOpen(true)
              }}
              className="absolute left-2 bottom-2 flex items-center gap-1 rounded-full bg-primary/90 hover:bg-primary active:scale-95 transition-all px-2 py-0.5 text-[10px] font-bold text-white shadow-lg cursor-pointer z-20"
            >
              <Star size={10} className="fill-white" />
              {item.rating ? item.rating.toFixed(1) : '5.0'}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-5 pb-0">
          <div className="space-y-0.5">
            <CardTitle className="text-sm sm:text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors leading-tight">
              {item.name}
            </CardTitle>
            <CardDescription className="line-clamp-1 sm:line-clamp-2 text-[10px] sm:text-xs hidden sm:block">
              {item.description || t('menu.fresh_daily')}
            </CardDescription>
          </div>
        </CardContent>

        <CardFooter className="p-3 sm:p-5 flex items-center justify-between gap-1">
          <span className="text-sm sm:text-lg font-black text-primary leading-none">
            {item.price.toLocaleString()}đ
          </span>

          <Button
            size="icon"
            onClick={handleQuickAdd}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl shadow-md shadow-primary/20 hover:scale-110 active:scale-95 transition-all shrink-0"
          >
            <Plus size={16} strokeWidth={3} className="sm:hidden" />
            <Plus size={20} strokeWidth={3} className="hidden sm:block" />
          </Button>
        </CardFooter>

        {item.remaining !== undefined && item.remaining <= 5 && (
          <div className="absolute top-0 left-0 w-full bg-red-500/90 text-white text-[9px] font-bold py-0.5 text-center">
            {t('menu.remaining').replace('{n}', String(item.remaining))}
          </div>
        )}
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white max-w-lg mx-3 sm:mx-auto">
          <div className="relative h-44 sm:h-64 w-full">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-secondary/5 flex items-center justify-center text-muted-foreground/20 italic">
                <UtensilsCrossed size={48} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 sm:bottom-6 left-5 sm:left-8 right-5 sm:right-8 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <Badge className="bg-white/20 text-white backdrop-blur-md border-none mb-1.5 text-[10px]">
                  {t(CATEGORY_MAP[item.category]) || item.category}
                </Badge>
                <h2 className="text-xl sm:text-3xl font-black text-white leading-tight line-clamp-1">{item.name}</h2>
                <p className="text-white/80 text-xs sm:text-sm font-medium mt-0.5">{vendorName}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsReviewsOpen(true) }}
                className="flex items-center gap-1 shrink-0 bg-white/25 hover:bg-white/40 active:scale-95 transition-all text-white rounded-full px-2.5 py-1.5 text-[10px] sm:text-xs font-extrabold shadow-lg shadow-black/10 cursor-pointer"
              >
                <Star size={10} className="fill-white text-white" />
                <span className="hidden xs:inline">{item.rating ? item.rating.toFixed(1) : '5.0'}</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-5 sm:space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">{t('menu.desc_title')}</h3>
                <button
                  onClick={() => setIsReviewsOpen(true)}
                  className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/75 transition px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl cursor-pointer shrink-0"
                >
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                  <span>{item.rating ? item.rating.toFixed(1) : '5.0'} • {t('feedback.view_reviews')}</span>
                </button>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm line-clamp-3">
                {item.description || t('menu.desc_default')}
              </p>
            </div>

            <div className="flex items-center justify-between bg-secondary/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem]">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('menu.price_per_unit')}</p>
                <p className="text-xl sm:text-2xl font-black text-primary">{item.price.toLocaleString()}đ</p>
              </div>

              <div className="flex items-center bg-white rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-sm border border-secondary/10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl hover:bg-secondary/10 text-primary transition-all"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus size={16} strokeWidth={3} />
                </Button>
                <span className="w-9 sm:w-12 text-center text-base sm:text-lg font-black text-primary">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl hover:bg-secondary/10 text-primary transition-all"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus size={16} strokeWidth={3} />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-12 sm:h-14 rounded-xl sm:rounded-2xl font-bold flex-1 text-sm"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleAddToCart}
                className="h-12 sm:h-14 rounded-xl sm:rounded-2xl font-bold flex-[2] gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
              >
                <ShoppingCart size={18} />
                {t('menu.add_to_cart_btn')} • {(item.price * quantity).toLocaleString()}đ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MenuItemFeedbacksModal
        open={isReviewsOpen}
        onOpenChange={setIsReviewsOpen}
        menuItemId={item.menuItemId}
        itemName={item.name}
        averageRating={item.rating || 5.0}
      />
    </>
  )
}
