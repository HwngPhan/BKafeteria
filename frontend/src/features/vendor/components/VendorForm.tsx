'use client'

import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/providers/LanguageProvider'
import { Clock, FileText, Loader2, Store } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface VendorFormData {
  name: string
  description: string
  workingHourFrom: string
  workingHourTo: string
  certification: string
  imgUrl: string
}

interface VendorFormProps {
  initialData?: VendorFormData | null
  isPending: boolean
  isUploadingImage?: boolean
  onSubmit: (data: VendorFormData, file: File | null) => void
  onCancel: () => void
}

export function VendorForm({ initialData, isPending, isUploadingImage = false, onSubmit, onCancel }: VendorFormProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    description: '',
    workingHourFrom: '08:00:00',
    workingHourTo: '20:00:00',
    certification: '',
    imgUrl: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        workingHourFrom: initialData.workingHourFrom || '08:00:00',
        workingHourTo: initialData.workingHourTo || '20:00:00',
        certification: initialData.certification || '',
        imgUrl: initialData.imgUrl || '',
      })
    }
    setSelectedFile(null)
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, selectedFile)
  }

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-white text-zinc-950">
      <div className="px-8 py-8 space-y-6">
        {/* Store name */}
        <div className="group space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
            {t('manager.vendor.name')}
          </label>
          <div className="relative">
            <Store size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
            <Input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5 text-zinc-950"
              placeholder={t('manager.vendor.name_placeholder')}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Description */}
          <div className="group space-y-2 flex flex-col h-full">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
              {t('manager.vendor.desc')}
            </label>
            <Textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="rounded-2xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 p-5 text-sm font-medium leading-relaxed resize-none text-zinc-950 flex-1 min-h-[160px] h-full"
              placeholder={t('manager.vendor.desc_placeholder')}
            />
          </div>

          {/* Cert + Hours */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="group space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
                {t('manager.vendor.cert')}
              </label>
              <div className="relative">
                <FileText size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                <Input
                  value={formData.certification}
                  onChange={e => setFormData({ ...formData, certification: e.target.value })}
                  className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5 text-zinc-950"
                  placeholder={t('manager.vendor.cert_placeholder')}
                />
              </div>
            </div>

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
                  onChange={e => setFormData({ ...formData, workingHourFrom: e.target.value })}
                  className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5 text-zinc-950"
                  required
                />
              </div>
            </div>

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
                  onChange={e => setFormData({ ...formData, workingHourTo: e.target.value })}
                  className="h-12 rounded-xl bg-secondary/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-12 pr-5 text-zinc-950"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image upload */}
        <div className="group space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">
            {t('manager.vendor.image')}
          </label>
          <div className="relative w-full rounded-2xl overflow-hidden bg-secondary/5 border-2 border-dashed border-primary/20 p-2 hover:border-primary/40 transition-colors">
            <div className="w-full h-32 rounded-xl overflow-hidden relative bg-white">
              <ImageUpload
                value={formData.imgUrl}
                onChange={url => setFormData({ ...formData, imgUrl: url })}
                onFileChange={handleFileChange}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-0 flex gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-12 px-6 rounded-xl font-bold flex-1 text-muted-foreground bg-secondary/5 hover:bg-secondary/10"
        >
          {t('manager.menu.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending || isUploadingImage}
          className="h-12 px-8 rounded-xl font-bold flex-1 shadow-lg shadow-primary/20"
        >
          {(isPending || isUploadingImage) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {initialData ? t('manager.vendor.save') : t('manager.vendor.submit')}
        </Button>
      </div>
    </form>
  )
}
