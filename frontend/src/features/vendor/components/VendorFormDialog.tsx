'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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
  initialData?: any
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
      <DialogContent className="p-0 overflow-hidden border-none bg-transparent shadow-none max-w-3xl sm:rounded-[2.5rem]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white dark:bg-zinc-950 shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/20"
        >
          <div className="flex flex-col md:flex-row h-full min-h-[500px]">
            {/* Left Section */}
            <div className="md:w-5/12 bg-gradient-to-br from-indigo-500/10 via-primary/5 to-purple-500/10 p-8 flex flex-col border-r border-secondary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-primary/10 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-secondary/10 blur-2xl"></div>
              
              <div className="relative z-10 space-y-6">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                  <Building2 size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-primary">
                    {initialData ? t('manager.vendor.edit_title') || 'Cập nhật' : t('manager.vendor.add_title') || 'Đăng ký'}
                  </h2>
                  <p className="text-muted-foreground font-medium text-sm mt-1 leading-relaxed">
                    {t('manager.vendor.dialog_desc') || 'Xây dựng thương hiệu và quản lý vận hành cửa hàng của bạn một cách chuyên nghiệp.'}
                  </p>
                </div>

                <div className="space-y-4 pt-6">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wider">
                      {t('manager.vendor.dialog_hint')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto relative z-10">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 w-fit">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Store Management</span>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="md:w-7/12 p-8 md:p-10 flex flex-col">
              <div className="flex justify-between items-center mb-8 md:hidden">
                <h2 className="text-xl font-bold">{initialData ? t('manager.vendor.edit_title') || 'Cập nhật' : t('manager.vendor.add_title') || 'Đăng ký'}</h2>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}><X size={20}/></Button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">
                <div className="space-y-6">
                  {/* Name Input */}
                  <div className="group space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                      {t('manager.vendor.name')}
                    </label>
                    <div className="relative">
                      <Store size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="h-14 rounded-2xl bg-secondary/10 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5"
                        placeholder={t('manager.vendor.name_placeholder')}
                        required
                      />
                    </div>
                  </div>

                  {/* Certification */}
                  <div className="group space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                      {t('manager.vendor.cert')}
                    </label>
                    <div className="relative">
                      <FileText size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                      <Input 
                        value={formData.certification} 
                        onChange={e => setFormData({...formData, certification: e.target.value})} 
                        className="h-14 rounded-2xl bg-secondary/10 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5"
                        placeholder={t('manager.vendor.cert_placeholder')}
                      />
                    </div>
                  </div>

                  {/* Working Hours Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="group space-y-2">
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
                          className="h-14 rounded-2xl bg-secondary/10 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5"
                          required
                        />
                      </div>
                    </div>
                    <div className="group space-y-2">
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
                          className="h-14 rounded-2xl bg-secondary/10 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="group space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                      {t('manager.vendor.desc')}
                    </label>
                    <Textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      className="rounded-3xl min-h-[140px] bg-secondary/10 border-none focus-visible:ring-2 focus-visible:ring-primary/20 p-5 text-sm font-medium leading-relaxed resize-none"
                      placeholder={t('manager.vendor.desc_placeholder')}
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
                    disabled={isPending}
                    className="h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest gap-3 shadow-xl shadow-primary/25 flex-[1.5]"
                  >
                    {isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      initialData ? <Save size={18} /> : <Sparkles size={18} />
                    )}
                    {initialData ? t('manager.vendor.save') : t('manager.vendor.submit') || 'Đăng ký ngay'}
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
