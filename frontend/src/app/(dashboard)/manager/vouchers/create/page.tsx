'use client'

import { Button } from '@/components/ui/button'
import { VoucherForm, VoucherFormData } from '@/features/voucher/components/VoucherForm'
import { useCreateVoucher } from '@/features/voucher/data-access/voucher.queries'
import { useLanguage } from '@/providers/LanguageProvider'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function CreateVoucherPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { mutateAsync: createVoucher, isPending } = useCreateVoucher()

  const handleSubmit = async (data: VoucherFormData) => {
    try {
      await createVoucher({
        discountPercentage: data.discountPercentage,
        // datetime-local gives "YYYY-MM-DDTHH:mm", API needs seconds
        startDate: data.startDate.length === 16 ? `${data.startDate}:00` : data.startDate,
        expiryDate: data.expiryDate.length === 16 ? `${data.expiryDate}:00` : data.expiryDate,
      })
      toast.success(t('manager.voucher.toast_created'))
      router.push('/manager/vouchers')
    } catch {
      // error handled by react-query
    }
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/manager/vouchers')}
          className="rounded-xl h-11 w-11"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
            {t('manager.voucher.create_page_title')}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm">
            {t('manager.voucher.create_page_subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-secondary/5 overflow-hidden">
        <VoucherForm
          isPending={isPending}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/manager/vouchers')}
        />
      </div>
    </div>
  )
}
