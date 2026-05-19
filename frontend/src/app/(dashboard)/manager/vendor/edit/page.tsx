'use client'

import { Button } from '@/components/ui/button'
import { VendorForm, VendorFormData } from '@/features/vendor/components/VendorForm'
import { useMyVendor, useUpdateVendor } from '@/features/vendor/data-access/vendor.queries'
import { useLanguage } from '@/providers/LanguageProvider'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function EditVendorPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { data: vendor, isLoading } = useMyVendor()
  const { mutateAsync: updateVendor, isPending } = useUpdateVendor()

  const handleSubmit = async (data: VendorFormData) => {
    if (!vendor) return
    try {
      await updateVendor({ id: vendor.vendorId, data })
      toast.success(t('manager.vendor.toast_success'))
      router.push('/manager/vendor')
    } catch {
      toast.error(t('manager.vendor.toast_error'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    )
  }

  if (!vendor) {
    router.push('/manager/vendor')
    return null
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
            {t('manager.vendor.edit_title')}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm">
            {t('manager.vendor.edit_subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-secondary/5 overflow-hidden">
        <VendorForm
          initialData={vendor}
          isPending={isPending}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/manager/vendor')}
        />
      </div>
    </div>
  )
}
