'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/providers/LanguageProvider'
import {
  Clock,
  FileText,
  Loader2,
  Save,
  Store,
  X,
  Building2,
  Sparkles
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface VendorFormData {
  name: string
  description: string
  workingHourFrom: string
  workingHourTo: string
  certification: string
}

interface VendorFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: VendorFormData) => void
  initialData?: VendorFormData | null
  isPending: boolean
}

export function VendorFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  isPending
}: VendorFormDialogProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    description: '',
    workingHourFrom: '',
    workingHourTo: '',
    certification: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        workingHourFrom: initialData.workingHourFrom || '',
        workingHourTo: initialData.workingHourTo || '',
        certification: initialData.certification || ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        workingHourFrom: '08:00:00',
        workingHourTo: '20:00:00',
        certification: ''
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden border-none bg-white shadow-2xl sm:max-w-2xl sm:rounded-[2rem]" showCloseButton={true}>
        <form onSubmit={handleSubmit} className="flex flex-col bg-white text-zinc-950">
          {/* Header */}
          <DialogHeader className="px-8 pt-8 pb-4">
            <DialogTitle className="text-2xl font-black text-primary">
              {initialData ? t('manager.vendor.edit_title') || 'Cập nhật' : t('manager.vendor.add_title') || 'Đăng ký'}
            </DialogTitle>
            <DialogDescription className="font-semibold text-xs text-muted-foreground mt-1">
              {t('manager.vendor.dialog_desc') || 'Xây dựng thương hiệu và quản lý vận hành cửa hàng của bạn một cách chuyên nghiệp.'}
            </DialogDescription>
          </DialogHeader>

          {/* Form Fields Container */}
          <div className="px-8 pb-6 space-y-6">
            {/* Tên cửa hàng (Full width) */}
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                {t('manager.vendor.name')}
              </label>
              <div className="relative">
                <Store size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5 text-zinc-950"
                  placeholder={t('manager.vendor.name_placeholder')}
                  required
                />
              </div>
            </div>

            {/* 2 Cột: Left (Description) và Right (Cert & Working Hours) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Cột trái: Mô tả cửa hàng */}
              <div className="group space-y-2 flex flex-col h-full">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                  {t('manager.vendor.desc')}
                </label>
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="rounded-2xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 p-5 text-sm font-medium leading-relaxed resize-none text-zinc-950 flex-1 min-h-[160px] h-full"
                  placeholder={t('manager.vendor.desc_placeholder')}
                />
              </div>

              {/* Cột phải: Chứng nhận & Giờ hoạt động */}
              <div className="space-y-4 flex flex-col justify-between">
                {/* Chứng nhận */}
                <div className="group space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                    {t('manager.vendor.cert')}
                  </label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                    <Input 
                      value={formData.certification} 
                      onChange={e => setFormData({...formData, certification: e.target.value})} 
                      className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5 text-zinc-950"
                      placeholder={t('manager.vendor.cert_placeholder')}
                    />
                  </div>
                </div>

                {/* Giờ mở cửa */}
                <div className="group space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                    {t('manager.vendor.open')}
                  </label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
                    <Input 
                      type="time"
                      step="1"
                      value={formData.workingHourFrom} 
                      onChange={e => setFormData({...formData, workingHourFrom: e.target.value})} 
                      className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5 text-zinc-950"
                      required
                    />
                  </div>
                </div>

                {/* Giờ đóng cửa */}
                <div className="group space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                    {t('manager.vendor.close')}
                  </label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
                    <Input 
                      type="time"
                      step="1"
                      value={formData.workingHourTo} 
                      onChange={e => setFormData({...formData, workingHourTo: e.target.value})} 
                      className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5 text-zinc-950"
                      required
                    />
                  </div>
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
              disabled={isPending}
              className="h-12 px-8 rounded-xl font-bold flex-1 shadow-lg shadow-primary/20"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {initialData ? t('manager.vendor.save') : t('manager.vendor.submit') || 'Đăng ký ngay'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
