'use client'

import { Button } from '@/components/ui/button'
import { VendorForm, VendorFormData } from '@/features/vendor/components/VendorForm'
import { useRegisterVendor, useUpdateVendor, useUpdateVendorImage } from '@/features/vendor/data-access/vendor.queries'
import { useUploadImage } from '@/hooks/useUploadImage'
import { useLanguage } from '@/providers/LanguageProvider'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function CreateVendorPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { mutateAsync: registerVendor, isPending } = useRegisterVendor()
  const { mutateAsync: updateVendor } = useUpdateVendor()
  const { mutateAsync: updateVendorImage, isPending: isUpdatingImagePending } = useUpdateVendorImage()
  const { uploadImage, isUploading: isUploadingImage } = useUploadImage()

  const handleSubmit = async (data: VendorFormData, imgFile: File | null, certFile: File | null) => {
    try {
      const certIsBlob = data.certification.startsWith('blob:')
      const createdVendor = await registerVendor(
        certIsBlob ? { ...data, certification: '' } : data
      )

      if (imgFile && createdVendor?.vendorId) {
        try {
          const url = await uploadImage(imgFile)
          if (url) {
            await updateVendorImage({ id: createdVendor.vendorId, data: { imgUrl: url } })
          }
        } catch {
          // image upload failure is non-fatal
        }
      }

      if (certFile && createdVendor?.vendorId) {
        try {
          const certUrl = await uploadImage(certFile)
          if (certUrl) {
            await updateVendor({ id: createdVendor.vendorId, data: { certification: certUrl } })
          }
        } catch {
          // cert upload failure is non-fatal
        }
      }

      toast.success(t('manager.vendor.toast_register_success'))
      if (data.imgUrl.startsWith('blob:')) URL.revokeObjectURL(data.imgUrl)
      if (certIsBlob) URL.revokeObjectURL(data.certification)
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
