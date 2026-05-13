'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { FoodCategory } from '@/features/menu/config/menu.types'
import { useCreateMenuItem, useDeleteMenuItem, useMyMenu, useUpdateMenuItem, useUpdateMenuItemImage } from '@/features/menu/data-access/menu.queries'
import { useUploadImage } from '@/hooks/useUploadImage'
import { CATEGORY_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/providers/LanguageProvider'
import {
  DollarSign,
  Edit2,
  Filter,
  Layers,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
  Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'

const categories: FoodCategory[] = ['BEVERAGES', 'PASTRIES', 'SNACKS', 'MEALS', 'DESSERTS']

export default function ManagerMenuPage() {
  const { t } = useLanguage()
  const { data: menuItems, isLoading } = useMyMenu()
  const { mutateAsync: createItem, isPending: isCreatingPending } = useCreateMenuItem()
  const { mutateAsync: updateItem, isPending: isUpdatingPending } = useUpdateMenuItem()
  const { mutateAsync: updateItemImage, isPending: isUpdatingImagePending } = useUpdateMenuItemImage()
  const { mutateAsync: deleteItem } = useDeleteMenuItem()


  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    remaining: '',
    category: 'MEALS' as FoodCategory,
    imageUrl: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { uploadImage, isUploading: isUploadingImage } = useUploadImage()

  const filteredItems = menuItems?.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenDialog = (item: any = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        remaining: item.remaining?.toString() || '0',
        category: item.category || 'MEALS' as FoodCategory,
        imageUrl: item.imageUrl || ''
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        remaining: '50',
        category: 'MEALS' as FoodCategory,
        imageUrl: ''
      })
    }
    // Clean up any existing blob URL if we're resetting
    if (formData.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imageUrl)
    }
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      remaining: parseInt(formData.remaining)
    }

    const cleanup = () => {
      if (formData.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.imageUrl)
      }
      setSelectedFile(null)
    }

    if (editingItem) {
      const isNewFileSelected = !!selectedFile;
      const initialData = isNewFileSelected 
        ? { ...data, imageUrl: editingItem.imageUrl } 
        : data;

      updateItem({
        id: editingItem.menuItemId,
        data: initialData
      }, {
        onSuccess: async () => {
          try {
            if (selectedFile) {
              const url = await uploadImage(selectedFile)
              if (url) {
                console.log('Updating menu item with new image URL:', url)
                await updateItemImage({
                  id: editingItem.menuItemId,
                  data: { imageUrl: url }
                })
              }
            }
            toast.success(t('manager.menu.toast_updated'))
          } catch (error) {
            console.error('Failed to update image:', error)
            toast.error(t('manager.menu.toast_update_partial'))
          } finally {
            cleanup()
            setIsDialogOpen(false)
          }
        }
      })
    } else {
      createItem({ ...data, imageUrl: '' }, {
        onSuccess: async (createdItem) => {
          try {
            console.log("Created Item: ", createdItem)
            if (selectedFile) {
              const url = await uploadImage(selectedFile)
              if (url && createdItem.menuItemId) {
                await updateItemImage({
                  id: createdItem.menuItemId,
                  data: { imageUrl: url }
                })
              }
            }
            toast.success(t('manager.menu.toast_added'))
          } catch (error) {
            console.error('Failed to upload image:', error)
            toast.error(t('manager.menu.toast_add_partial'))
          } finally {
            cleanup()
            setIsDialogOpen(false)
          }
        }
      })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t('manager.menu.confirm_delete'))) {
      deleteItem(id, {
        onSuccess: () => {
          toast.success(t('manager.menu.toast_deleted'))
        }
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">{t('manager.menu.title')}</h1>
          <p className="text-muted-foreground mt-1 font-medium flex items-center gap-2">
            {t('manager.menu.subtitle')}
          </p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()} 
          className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          {t('manager.menu.add')}
        </Button>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('manager.menu.search')} 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 border-secondary/20">
                <Filter size={18} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          {filteredItems && filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.menuItemId} className="rounded-3xl border-none shadow-xl shadow-secondary/5 bg-white group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                  <div className="relative w-full h-48 bg-secondary/5">
                    {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                        <ImageIcon className="h-10 w-10 mb-2" />
                        <span className="text-xs font-medium">Chưa có ảnh</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="rounded-full bg-white/90 text-primary hover:bg-white border-none px-3 py-1 shadow-sm text-xs font-bold backdrop-blur-sm">
                        {CATEGORY_MAP[item.category] || item.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        onClick={() => handleOpenDialog(item)}
                        className="h-8 w-8 rounded-full bg-white/90 text-blue-600 hover:bg-white hover:text-blue-700 shadow-sm backdrop-blur-sm"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        onClick={() => handleDelete(item.menuItemId)}
                        className="h-8 w-8 rounded-full bg-white/90 text-red-600 hover:bg-white hover:text-red-700 shadow-sm backdrop-blur-sm"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-primary">{item.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[2.5rem]">
                        {item.description || t('manager.menu.no_desc')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-secondary/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('manager.menu.price')}</span>
                        <span className="font-black text-primary text-lg">{item.price.toLocaleString()}đ</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('manager.menu.remaining')}</span>
                        <Badge variant="outline" className={cn(
                          "rounded-full px-3 py-0.5 text-sm font-black border-2",
                          item.remaining > 10 ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-amber-600 bg-amber-50 border-amber-200"
                        )}>
                          {item.remaining}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="p-8 rounded-full bg-secondary/5">
                <UtensilsCrossed className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">{t('manager.menu.empty')}</h3>
                <p className="text-muted-foreground max-w-xs">
                  {t('manager.menu.empty_desc')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          if (formData.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(formData.imageUrl)
          }
        }
        setIsDialogOpen(open)
      }}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white max-w-5xl">
          <DialogHeader className="p-8 bg-secondary/5 border-b">
            <DialogTitle className="text-2xl font-black text-primary">
              {editingItem ? t('manager.menu.edit_title') : t('manager.menu.add_title')}
            </DialogTitle>
            <DialogDescription className="font-medium text-sm mt-2">
              {t('manager.menu.dialog_desc')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10">
              {/* Left Column: Image */}
              <div className="md:col-span-5 space-y-4 flex flex-col">
                <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">{t('manager.menu.form_image')}</label>
                <div className="flex-1 min-h-[350px] flex items-center justify-center bg-secondary/5 rounded-[2rem] border-2 border-dashed border-secondary/20 p-4">
                  <ImageUpload 
                    value={formData.imageUrl} 
                    onChange={url => setFormData({...formData, imageUrl: url})} 
                    onFileChange={file => setSelectedFile(file)}
                  />
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="md:col-span-7 space-y-7">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">{t('manager.menu.field_name')}</label>
                  <div className="relative">
                    <UtensilsCrossed className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="pl-12 rounded-2xl h-14 bg-secondary/5 border-none focus-visible:ring-primary/20 text-base"
                      placeholder={t('manager.menu.field_name_placeholder')}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">{t('manager.menu.field_price')}</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        type="number"
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})} 
                        className="pl-12 rounded-2xl h-14 bg-secondary/5 border-none focus-visible:ring-primary/20 text-base"
                        placeholder="35000"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">{t('manager.menu.field_remaining')}</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        type="number"
                        value={formData.remaining} 
                        onChange={e => setFormData({...formData, remaining: e.target.value})} 
                        className="pl-12 rounded-2xl h-14 bg-secondary/5 border-none focus-visible:ring-primary/20 text-base"
                        placeholder="50"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">{t('manager.menu.field_category')}</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-4 h-5 w-5 text-muted-foreground z-10" />
                    <Select 
                      value={formData.category} 
                      onValueChange={value => setFormData({...formData, category: value as FoodCategory})}
                    >
                      <SelectTrigger className="pl-12 rounded-2xl h-14 bg-secondary/5 border-none focus-visible:ring-primary/20 text-base">
                        <SelectValue placeholder={t('manager.menu.field_category_select')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-xl">
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat} className="rounded-xl py-3">
                            {CATEGORY_MAP[cat] || cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">{t('manager.menu.field_desc')}</label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="rounded-3xl min-h-[140px] bg-secondary/5 border-none focus-visible:ring-primary/20 p-5 text-base"
                    placeholder={t('manager.menu.field_desc_placeholder')}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="p-8 pt-0 flex gap-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)}
                className="rounded-2xl h-14 px-8 font-bold flex-1 text-base bg-secondary/5 hover:bg-secondary/10"
              >
                {t('manager.menu.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isCreatingPending || isUpdatingPending || isUploadingImage}
                className="rounded-2xl h-14 px-10 font-bold flex-1 gap-2 shadow-xl shadow-primary/20 text-base"
              >
                {(isCreatingPending || isUpdatingPending || isUploadingImage) ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus size={20} />
                )}
                {editingItem ? t('manager.menu.save') : t('manager.menu.submit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
