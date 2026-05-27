'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { useLanguage } from '@/providers/LanguageProvider'
import { AlertTriangle, CalendarClock, Loader2, Percent } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface VoucherFormData {
  discountPercentage: number
  startDate: string // datetime-local: "YYYY-MM-DDTHH:mm"
  expiryDate: string // datetime-local: "YYYY-MM-DDTHH:mm"
}

interface VoucherFormProps {
  initialData?: VoucherFormData | null
  isPending: boolean
  onSubmit: (data: VoucherFormData) => void
  onCancel: () => void
}

const MAX_DISCOUNT = 50

export function VoucherForm({ initialData, isPending, onSubmit, onCancel }: VoucherFormProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<VoucherFormData>({
    discountPercentage: 10,
    startDate: '',
    expiryDate: '',
  })

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        discountPercentage: Math.min(initialData.discountPercentage, MAX_DISCOUNT),
        startDate: initialData.startDate || '',
        expiryDate: initialData.expiryDate || '',
      })
    } else {
      setFormData({ discountPercentage: 10, startDate: '', expiryDate: '' })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const discountColor =
    formData.discountPercentage <= 20
      ? 'text-emerald-600'
      : formData.discountPercentage <= 35
        ? 'text-amber-600'
        : 'text-red-600'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-white text-zinc-950">
      <div className="px-8 pt-8 pb-4">
        <p className="text-xs font-semibold text-muted-foreground mt-1">
          {t('manager.voucher.form_desc')}
        </p>
      </div>

      <div className="px-8 pb-6 space-y-8">
        {/* Discount Percentage Slider */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">
            {t('manager.voucher.field_discount')}
          </label>

          <div className="bg-secondary/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t('manager.voucher.discount_label')}
                </span>
              </div>
              <div className={`text-3xl font-black ${discountColor}`}>
                {formData.discountPercentage}%
              </div>
            </div>

            <Slider
              min={1}
              max={MAX_DISCOUNT}
              step={1}
              value={[formData.discountPercentage]}
              onValueChange={([val]) =>
                setFormData({ ...formData, discountPercentage: val })
              }
              className="w-full"
            />

            <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
              <span>1%</span>
              <span className="text-primary font-black">Max {MAX_DISCOUNT}%</span>
            </div>

            {formData.discountPercentage > 35 && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-2 text-xs font-semibold">
                <AlertTriangle size={14} />
                {t('manager.voucher.discount_warning')}
              </div>
            )}
          </div>
        </div>

        {/* Start Date */}
        <div className="group space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
            {t('manager.voucher.field_start')}
          </label>
          <div className="relative">
            <CalendarClock
              size={16}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40"
            />
            <Input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5 text-zinc-950"
              required
            />
          </div>
        </div>

        {/* Expiry Date */}
        <div className="group space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
            {t('manager.voucher.field_expiry')}
          </label>
          <div className="relative">
            <CalendarClock
              size={16}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40"
            />
            <Input
              type="datetime-local"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5 text-zinc-950"
              required
            />
          </div>
          {formData.startDate &&
            formData.expiryDate &&
            formData.expiryDate <= formData.startDate && (
              <p className="text-xs text-red-500 font-semibold ml-2">
                {t('manager.voucher.expiry_before_start')}
              </p>
            )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="px-8 pb-8 pt-0 flex gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-12 px-6 rounded-xl font-bold flex-1 text-muted-foreground bg-secondary/5 hover:bg-secondary/10"
        >
          {t('manager.voucher.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={
            isPending ||
            !formData.startDate ||
            !formData.expiryDate ||
            formData.expiryDate <= formData.startDate
          }
          className="h-12 px-8 rounded-xl font-bold flex-1 shadow-lg shadow-primary/20"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {initialData ? t('manager.voucher.save') : t('manager.voucher.submit')}
        </Button>
      </div>
    </form>
  )
}
