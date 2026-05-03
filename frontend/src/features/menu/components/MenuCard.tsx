'use client'

import { MenuItemDto } from '../config/menu.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/features/cart/store/cart.store'
import { toast } from 'sonner'

interface MenuCardProps {
  item: MenuItemDto
  vendorName: string
}

export function MenuCard({ item, vendorName }: MenuCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem({
      itemId: item.menuItemId,
      itemName: item.name,
      price: item.price,
      quantity: 1,
      vendorId: item.vendorId,
      vendorName: vendorName,
      imageUrl: item.imageUrl,
    })
    toast.success(`Added ${item.name} to cart`)
  }

  return (
    <Card className="group relative overflow-hidden rounded-3xl border-none bg-white shadow-lg shadow-secondary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
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
              No image
            </div>
          )}
          <Badge className="absolute right-3 top-3 bg-white/80 text-primary backdrop-blur-md border-none">
            {item.category}
          </Badge>
          <div className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-xs font-bold text-white shadow-lg">
            <Star size={12} className="fill-white" />
            {item.rating || '5.0'}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pb-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold line-clamp-1">{item.name}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs min-h-[32px]">
            {item.description || 'Deliciously prepared with fresh ingredients.'}
          </CardDescription>
        </div>
      </CardContent>

      <CardFooter className="p-5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Price</span>
          <span className="text-lg font-black text-primary">{item.price.toLocaleString()}đ</span>
        </div>
        
        <Button 
          size="icon" 
          onClick={handleAddToCart}
          className="h-10 w-10 rounded-2xl shadow-lg shadow-primary/20 hover:scale-110 transition-transform"
        >
          <Plus size={20} />
        </Button>
      </CardFooter>
      
      {item.remaining !== undefined && item.remaining <= 5 && (
        <div className="absolute top-0 left-0 w-full bg-red-500/90 text-white text-[10px] font-bold py-0.5 text-center">
          Only {item.remaining} left!
        </div>
      )}
    </Card>
  )
}
