'use client'

import { Button } from '@/components/ui/button'
import { MenuItemForm, MenuItemFormData } from '@/features/menu/components/MenuItemForm'
import {
  useCreateMenuItem,
  useUpdateMenuItemImage
} from '@/features/menu/data-access/menu.queries'
import { useUploadImage } from '@/hooks/useUploadImage'
import { useLanguage } from '@/providers/LanguageProvider'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function CreateMenuItemPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { mutateAsync: createItem, isPending } = useCreateMenuItem()
  const { mutateAsync: updateItemImage, isPending: isUpdatingImagePending } = useUpdateMenuItemImage()
  const { uploadImage, isUploading: isUploadingImage } = useUploadImage()

  const handleSubmit = async (data: MenuItemFormData, file: File | null) => {
    const formattedData = {
      ...data,
      price: parseFloat(data.price),
      remaining: parseInt(data.remaining),
    }

    try {
      const createdItem = await createItem({ ...formattedData, imageUrl: '' })

      if (file && createdItem?.menuItemId) {
        try {
          const url = await uploadImage(file)
          if (url) {
            await updateItemImage({ id: createdItem.menuItemId, data: { imageUrl: url } })
          }
          toast.success(t('manager.menu.toast_added'))
        } catch {
          toast.error(t('manager.menu.toast_add_partial'))
        }
      } else {
        toast.success(t('manager.menu.toast_added'))
      }

      if (data.imageUrl.startsWith('blob:')) URL.revokeObjectURL(data.imageUrl)
      router.push('/manager/menu')
    } catch {
      // mutation error handled by TanStack Query
    }
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/manager/menu')}
          className="rounded-xl h-11 w-11"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
            {t('manager.menu.create_page_title')}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm">
            {t('manager.menu.create_page_subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-secondary/5 overflow-hidden">
        <MenuItemForm
          isPending={isPending || isUpdatingImagePending}
          isUploadingImage={isUploadingImage}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/manager/menu')}
        />
      </div>
    </div>
  )
}
