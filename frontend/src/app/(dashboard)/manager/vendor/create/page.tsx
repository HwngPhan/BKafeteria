'use client'

import { Button } from '@/components/ui/button'
import { VendorForm, VendorFormData } from '@/features/vendor/components/VendorForm'
import { useRegisterVendor, useUpdateVendorImage } from '@/features/vendor/data-access/vendor.queries'
import { useUploadImage } from '@/hooks/useUploadImage'
import { useLanguage } from '@/providers/LanguageProvider'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function CreateVendorPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { mutateAsync: registerVendor, isPending } = useRegisterVendor()
  const { mutateAsync: updateVendorImage, isPending: isUpdatingImagePending } = useUpdateVendorImage()
  const { uploadImage, isUploading: isUploadingImage } = useUploadImage()

  const handleSubmit = async (data: VendorFormData, file: File | null) => {
    try {
      const createdVendor = await registerVendor(data)

      if (file && createdVendor?.vendorId) {
        try {
          const url = await uploadImage(file)
          if (url) {
            await updateVendorImage({ id: createdVendor.vendorId, data: { imgUrl: url } })
          }
        } catch {
          // image upload failure is non-fatal
        }
      }

      toast.success(t('manager.vendor.toast_register_success'))
      if (data.imgUrl.startsWith('blob:')) URL.revokeObjectURL(data.imgUrl)
      router.push('/manager/vendor')
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
          onClick={() => router.push('/manager/vendor')}
          className="rounded-xl h-11 w-11"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
            {t('manager.vendor.add_title')}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm">
            {t('manager.vendor.create_subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-secondary/5 overflow-hidden">
        <VendorForm
          isPending={isPending || isUpdatingImagePending}
          isUploadingImage={isUploadingImage}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/manager/vendor')}
        />
      </div>
    </div>
  )
}
