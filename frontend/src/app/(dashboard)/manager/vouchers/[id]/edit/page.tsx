'use client'

import { Button } from '@/components/ui/button'
import { VoucherForm, VoucherFormData } from '@/features/voucher/components/VoucherForm'
import { useUpdateVoucher, useVoucherById } from '@/features/voucher/data-access/voucher.queries'
import { useLanguage } from '@/providers/LanguageProvider'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { toast } from 'sonner'

export default function EditVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t } = useLanguage()
  const router = useRouter()

  const { data: voucher, isLoading } = useVoucherById(id)
  const { mutateAsync: updateVoucher, isPending } = useUpdateVoucher()

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    )
  }

  if (!voucher) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">{t('manager.voucher.not_found')}</h2>
        <p className="text-muted-foreground">{t('manager.voucher.not_found_desc')}</p>
        <Button onClick={() => router.push('/manager/vouchers')} className="rounded-2xl">
          {t('manager.voucher.back')}
        </Button>
      </div>
    )
  }

  const handleSubmit = async (data: VoucherFormData) => {
    try {
      await updateVoucher({
        id: voucher.voucherId,
        data: {
          discountPercentage: data.discountPercentage,
          startDate: data.startDate.length === 16 ? `${data.startDate}:00` : data.startDate,
          expiryDate: data.expiryDate.length === 16 ? `${data.expiryDate}:00` : data.expiryDate,
        },
      })
      toast.success(t('manager.voucher.toast_updated'))
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
            {t('manager.voucher.edit_page_title')}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm">
            {t('manager.voucher.edit_page_subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-secondary/5 overflow-hidden">
        <VoucherForm
          initialData={{
            discountPercentage: voucher.discountPercentage,
            // Convert ISO to datetime-local format (trim seconds)
            startDate: voucher.startDate.substring(0, 16),
            expiryDate: voucher.expiryDate.substring(0, 16),
          }}
          isPending={isPending}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/manager/vouchers')}
        />
      </div>
    </div>
  )
}
