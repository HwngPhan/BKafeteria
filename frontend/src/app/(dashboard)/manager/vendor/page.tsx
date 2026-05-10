'use client'

import { useMyVendor, useUpdateVendor } from '@/features/vendor/data-access/vendor.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Store, Save, Clock, FileText, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/providers/LanguageProvider'

export default function ManagerVendorPage() {
  const { data: vendor, isLoading } = useMyVendor()
  const updateVendor = useUpdateVendor()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workingHourFrom: '',
    workingHourTo: '',
    certification: ''
  })

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        description: vendor.description || '',
        workingHourFrom: vendor.workingHourFrom || '',
        workingHourTo: vendor.workingHourTo || '',
        certification: vendor.certification || ''
      })
    }
  }, [vendor])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendor) return
    updateVendor.mutate({ id: vendor.vendorId, data: formData }, {
      onSuccess: () => toast.success(t('manager.vendor.toast_success')),
      onError: () => toast.error(t('manager.vendor.toast_error')),
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
        <div className="p-8 rounded-full bg-secondary/5">
          <Store className="h-16 w-16 text-muted-foreground/30" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-primary">{t('manager.vendor.no_vendor')}</h3>
          <p className="text-muted-foreground max-w-xs">{t('manager.vendor.no_vendor_desc')}</p>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    ACCEPTED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    CLOSED: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const statusLabelKeys: Record<string, string> = {
    PENDING: 'manager.vendor.status_pending',
    ACCEPTED: 'manager.vendor.status_accepted',
    REJECTED: 'manager.vendor.status_rejected',
    CLOSED: 'manager.vendor.status_closed',
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">{t('manager.vendor.title')}</h1>
          <p className="text-muted-foreground mt-1 font-medium">{t('manager.vendor.subtitle')}</p>
        </div>
        <Badge className={cn('rounded-full px-6 py-2 text-xs font-bold border self-start md:self-center', statusColors[vendor.status])}>
          {t(statusLabelKeys[vendor.status]) || vendor.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white">
            <CardHeader className="p-8 border-b bg-secondary/5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Store size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">{t('manager.vendor.card_title')}</CardTitle>
                  <CardDescription className="font-medium text-xs">{t('manager.vendor.card_desc')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">{t('manager.vendor.name')}</label>
                    <div className="relative">
                      <Store className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20"
                        placeholder={t('manager.vendor.name_placeholder')}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">{t('manager.vendor.cert')}</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={formData.certification}
                        onChange={e => setFormData({...formData, certification: e.target.value})}
                        className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20"
                        placeholder={t('manager.vendor.cert_placeholder')}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">{t('manager.vendor.desc')}</label>
                  <Textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="rounded-3xl min-h-[120px] bg-secondary/5 border-none focus-visible:ring-primary/20 p-4"
                    placeholder={t('manager.vendor.desc_placeholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">{t('manager.vendor.open')}</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="time" step="1" value={formData.workingHourFrom}
                        onChange={e => setFormData({...formData, workingHourFrom: e.target.value})}
                        className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">{t('manager.vendor.close')}</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="time" step="1" value={formData.workingHourTo}
                        onChange={e => setFormData({...formData, workingHourTo: e.target.value})}
                        className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={updateVendor.isPending}
                    className="rounded-2xl h-12 px-8 font-bold gap-2 shadow-lg shadow-primary/20">
                    {updateVendor.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
                    {t('manager.vendor.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 overflow-hidden bg-white">
            <CardHeader className="p-8">
              <CardTitle className="text-lg font-bold">{t('manager.vendor.stats')}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex items-center gap-4 bg-secondary/5 p-4 rounded-3xl">
                <div className="p-3 rounded-2xl bg-white text-primary"><CheckCircle2 size={24} /></div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('manager.vendor.completed')}</p>
                  <p className="text-2xl font-black text-primary">--</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl">
                <div className="p-3 rounded-2xl bg-white text-primary"><FileText size={24} /></div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('manager.vendor.menu')}</p>
                  <p className="text-2xl font-black text-primary">--</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 overflow-hidden bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <CardContent className="p-8 space-y-4">
              <h4 className="font-bold">{t('manager.vendor.tip_title')}</h4>
              <p className="text-sm opacity-80 leading-relaxed font-medium">{t('manager.vendor.tip_desc')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
