'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FoodCategory } from '@/features/menu/config/menu.config'
import { CATEGORY_MAP } from '@/lib/constants'
import { useLanguage } from '@/providers/LanguageProvider'
import {
  Loader2,
  Package
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface MenuItemFormData {
  name: string
  description: string
  price: string
  remaining: string
  category: FoodCategory
  imageUrl: string
}

interface MenuItemFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: MenuItemFormData, file: File | null) => void
  initialData?: MenuItemFormData | null
  isPending: boolean
  isUploadingImage: boolean
}

const categories: FoodCategory[] = ['BEVERAGES', 'PASTRIES', 'SNACKS', 'MEALS', 'DESSERTS']

export function MenuItemFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  isPending,
  isUploadingImage
}: MenuItemFormDialogProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    price: '',
    remaining: '',
    category: 'MEALS',
    imageUrl: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        remaining: initialData.remaining?.toString() || '0',
        category: initialData.category || 'MEALS',
        imageUrl: initialData.imageUrl || ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        remaining: '50',
        category: 'MEALS',
        imageUrl: ''
      })
    }
    setSelectedFile(null)
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, selectedFile)
  }

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden border-none bg-white shadow-2xl sm:max-w-2xl sm:rounded-[2rem]" showCloseButton={true}>
        <form onSubmit={handleSubmit} className="flex flex-col bg-white text-zinc-950">
          {/* Header */}
          <DialogHeader className="px-8 pt-8 pb-4">
            <DialogTitle className="text-2xl font-black text-primary">
              {initialData ? t('manager.menu.edit_title') : t('manager.menu.add_title')}
            </DialogTitle>
            <DialogDescription className="font-semibold text-xs text-muted-foreground mt-1">
              {t('manager.menu.dialog_desc')}
            </DialogDescription>
          </DialogHeader>

          {/* Form Fields Container */}
          <div className="px-8 pb-6 space-y-6">
            {/* Tên món ăn (Full width) */}
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                {t('manager.menu.field_name')}
              </label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold px-5 text-zinc-950"
                placeholder={t('manager.menu.field_name_placeholder')}
                required
              />
            </div>

            {/* 2 Cột: Left (Description) và Right (Price, Remaining, Category) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Cột trái: Mô tả món ăn */}
              <div className="group space-y-2 flex flex-col h-full">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                  {t('manager.menu.field_desc')}
                </label>
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="rounded-2xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 p-5 text-sm font-medium leading-relaxed resize-none text-zinc-950 flex-1 min-h-[160px] h-full"
                  placeholder={t('manager.menu.field_desc_placeholder')}
                />
              </div>

              {/* Cột phải: Giá bán, Số lượng, Danh mục */}
              <div className="space-y-4 flex flex-col justify-between">
                {/* Giá bán */}
                <div className="group space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                    {t('manager.menu.field_price')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-primary/40 text-xs">VND</span>
                    <Input 
                      type="number"
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                      className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-black pl-14 pr-5 text-zinc-950"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Số lượng còn lại */}
                <div className="group space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                    {t('manager.menu.field_remaining')}
                  </label>
                  <div className="relative">
                    <Package size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                    <Input 
                      type="number"
                      value={formData.remaining} 
                      onChange={e => setFormData({...formData, remaining: e.target.value})} 
                      className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-black pl-12 pr-5 text-zinc-950"
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                {/* Danh mục */}
                <div className="group space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                    {t('manager.menu.field_category')}
                  </label>
                  <Select 
                    value={formData.category} 
                    onValueChange={value => setFormData({...formData, category: value as FoodCategory})}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-base font-bold px-5 text-zinc-950">
                      <SelectValue placeholder={t('manager.menu.field_category_select')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl bg-white p-2">
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat} className="rounded-lg py-2 cursor-pointer focus:bg-primary/5 text-zinc-950">
                          <span className="font-bold text-sm text-primary/80">{t(CATEGORY_MAP[cat]) || cat}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dưới cùng: Placeholder cập nhật hình ảnh món ăn (giống post Facebook) */}
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                {t('manager.menu.form_image')}
              </label>
              <div className="relative w-full rounded-2xl overflow-hidden bg-secondary/5 border-2 border-dashed border-primary/20 p-2 hover:border-primary/40 transition-colors">
                <div className="w-full h-32 rounded-xl overflow-hidden relative bg-white">
                  <ImageUpload 
                    value={formData.imageUrl} 
                    onChange={url => setFormData({...formData, imageUrl: url})} 
                    onFileChange={handleFileChange}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="px-8 pb-8 pt-0 flex gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="h-12 px-6 rounded-xl font-bold flex-1 text-muted-foreground bg-secondary/5 hover:bg-secondary/10"
            >
              {t('manager.menu.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || isUploadingImage}
              className="h-12 px-8 rounded-xl font-bold flex-1 shadow-lg shadow-primary/20"
            >
              {(isPending || isUploadingImage) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {initialData ? t('manager.menu.save') : t('manager.menu.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Save(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}
