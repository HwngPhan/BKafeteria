'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { FoodCategory } from '@/features/menu/config/menu.types'
import { CATEGORY_MAP } from '@/lib/constants'
import { useLanguage } from '@/providers/LanguageProvider'
import {
  DollarSign,
  Layers,
  Loader2,
  Package,
  Plus,
  UtensilsCrossed,
  X,
  Sparkles,
  Info
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

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
  initialData?: any
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
      <DialogContent className="p-0 overflow-hidden border-none bg-transparent shadow-none max-w-4xl sm:rounded-[2.5rem]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white dark:bg-zinc-950 shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/20"
        >
          <div className="flex flex-col md:flex-row h-full min-h-[600px]">
            {/* Left Section: Visual & Header Integration */}
            <div className="md:w-5/12 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-8 flex flex-col border-r border-secondary/10">
              <div className="space-y-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                  <UtensilsCrossed size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-primary">
                    {initialData ? t('manager.menu.edit_title') : t('manager.menu.add_title')}
                  </h2>
                  <p className="text-muted-foreground font-medium text-sm mt-1 leading-relaxed">
                    {t('manager.menu.dialog_desc')}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center gap-6">
                <div className="w-full space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 opacity-70">
                    {t('manager.menu.form_image')}
                  </label>
                  <div className="aspect-[3/4] w-full rounded-[2rem] overflow-hidden bg-white/50 backdrop-blur-sm border-2 border-dashed border-primary/20 p-2 group transition-all hover:border-primary/40 shadow-inner">
                    <div className="h-full w-full rounded-[1.5rem] overflow-hidden relative">
                      <ImageUpload 
                        value={formData.imageUrl} 
                        onChange={url => setFormData({...formData, imageUrl: url})} 
                        onFileChange={handleFileChange}
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-3">
                  <Sparkles size={14} className="text-primary" />
                  <span>{initialData ? t('manager.menu.dialog_update_hint') : t('manager.menu.dialog_add_hint')}</span>
                </div>
              </div>
            </div>

            {/* Right Section: Form Fields */}
            <div className="md:w-7/12 p-8 md:p-10 flex flex-col">
              <div className="flex justify-between items-center mb-8 md:hidden">
                <h2 className="text-xl font-bold">{initialData ? t('manager.menu.edit_title') : t('manager.menu.add_title')}</h2>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}><X size={20}/></Button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">
                <div className="space-y-6">
                  {/* Name Input */}
                  <div className="group space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                      {t('manager.menu.field_name')}
                    </label>
                    <div className="relative">
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="h-14 rounded-2xl bg-secondary/10 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-5 placeholder:font-medium placeholder:opacity-50"
                        placeholder={t('manager.menu.field_name_placeholder')}
                        required
                      />
                    </div>
                  </div>

                  {/* Price & Stock Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="group space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                        {t('manager.menu.field_price')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-primary/40 text-sm">VND</span>
                        <Input 
                          type="number"
                          value={formData.price} 
                          onChange={e => setFormData({...formData, price: e.target.value})} 
                          className="h-14 rounded-2xl bg-secondary/10 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-lg font-black pl-14 pr-5"
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>
                    <div className="group space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                        {t('manager.menu.field_remaining')}
                      </label>
                      <div className="relative">
                        <Package size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                        <Input 
                          type="number"
                          value={formData.remaining} 
                          onChange={e => setFormData({...formData, remaining: e.target.value})} 
                          className="h-14 rounded-2xl bg-secondary/10 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-lg font-black pl-12 pr-5"
                          placeholder="50"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="group space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                      {t('manager.menu.field_category')}
                    </label>
                    <Select 
                      value={formData.category} 
                      onValueChange={value => setFormData({...formData, category: value as FoodCategory})}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-secondary/10 border-none focus:ring-2 focus:ring-primary/20 text-base font-bold px-5">
                        <SelectValue placeholder={t('manager.menu.field_category_select')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl bg-white p-2">
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat} className="rounded-xl py-3 cursor-pointer focus:bg-primary/5">
                            <span className="font-bold text-sm text-primary/80">{t(CATEGORY_MAP[cat]) || cat}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="group space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                      {t('manager.menu.field_desc')}
                    </label>
                    <Textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      className="rounded-3xl min-h-[140px] bg-secondary/10 border-none focus-visible:ring-2 focus-visible:ring-primary/20 p-5 text-sm font-medium leading-relaxed resize-none"
                      placeholder={t('manager.menu.field_desc_placeholder')}
                    />
                  </div>
                </div>

                <div className="mt-auto flex gap-4 pt-6">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => onOpenChange(false)}
                    className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-muted-foreground bg-secondary/5 hover:bg-secondary/10 flex-1"
                  >
                    {t('manager.menu.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending || isUploadingImage}
                    className="h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest gap-3 shadow-xl shadow-primary/25 flex-[1.5]"
                  >
                    {(isPending || isUploadingImage) ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      initialData ? <Save size={18} /> : <Plus size={18} />
                    )}
                    {initialData ? t('manager.menu.save') : t('manager.menu.submit')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

function Save(props: any) {
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
