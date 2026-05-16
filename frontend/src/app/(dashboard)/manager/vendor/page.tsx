'use client'

import { useMyVendor, useUpdateVendor, useRegisterVendor } from '@/features/vendor/data-access/vendor.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { VendorFormDialog } from '@/features/vendor/components/VendorFormDialog'
import { Loader2, Store, Clock, FileText, CheckCircle2, Plus, Edit2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/providers/LanguageProvider'

export default function ManagerVendorPage() {
  const { data: vendor, isLoading } = useMyVendor()
  const updateVendor = useUpdateVendor()
  const { t } = useLanguage()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { mutate: registerVendor, isPending: isRegistering } = useRegisterVendor()

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="p-10 rounded-[2.5rem] bg-secondary/5 border-2 border-dashed border-secondary/20 relative group overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Store className="h-20 w-20 text-muted-foreground/30 relative z-10 transition-transform duration-500 group-hover:scale-110" />
        </div>
        <div className="space-y-3 max-w-sm">
          <h3 className="text-2xl font-black text-primary tracking-tight">{t('manager.vendor.no_vendor')}</h3>
          <p className="text-muted-foreground font-medium">{t('manager.vendor.no_vendor_desc')}</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="rounded-2xl h-14 px-10 font-bold gap-3 shadow-2xl shadow-primary/20 text-lg hover:scale-105 transition-transform"
        >
          <Plus className="h-6 w-6" />
          {t('manager.vendor.add_title') || 'Đăng ký ngay'}
        </Button>

        <VendorFormDialog 
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          isPending={isRegistering}
          onSubmit={(data) => {
            registerVendor(data, {
              onSuccess: () => {
                toast.success(t('manager.vendor.toast_register_success') || 'Đã gửi yêu cầu đăng ký cửa hàng!')
                setIsDialogOpen(false)
              }
            })
          }}
        />
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
        <div className="flex items-center gap-3">
          <Badge className={cn('rounded-full px-6 py-2 text-xs font-bold border', statusColors[vendor.status])}>
            {t(statusLabelKeys[vendor.status]) || vendor.status}
          </Badge>
          <Button 
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
            className="rounded-full h-10 px-6 font-bold border-secondary/20 hover:bg-secondary/5"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            {t('manager.vendor.edit_title') || 'Sửa thông tin'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white h-full">
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
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('manager.vendor.name')}</p>
                  <p className="text-lg font-bold text-primary">{vendor.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('manager.vendor.cert')}</p>
                  <p className="text-lg font-bold text-primary">{vendor.certification || t('admin.vendors.no_cert')}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('manager.vendor.desc')}</p>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">{vendor.description || t('manager.vendor.no_desc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-secondary/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-secondary/5 text-primary"><Clock size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('manager.vendor.open')}</p>
                    <p className="font-bold text-primary">{vendor.workingHourFrom}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-secondary/5 text-primary"><Clock size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('manager.vendor.close')}</p>
                    <p className="font-bold text-primary">{vendor.workingHourTo}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 overflow-hidden bg-white">
            <CardHeader className="p-8">
              <CardTitle className="text-lg font-bold">{t('manager.vendor.stats')}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex items-center gap-4 bg-secondary/5 p-4 rounded-3xl group hover:bg-secondary/10 transition-colors">
                <div className="p-3 rounded-2xl bg-white text-primary shadow-sm group-hover:scale-110 transition-transform"><CheckCircle2 size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('manager.vendor.completed')}</p>
                  <p className="text-2xl font-black text-primary">--</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl group hover:bg-primary/10 transition-colors">
                <div className="p-3 rounded-2xl bg-white text-primary shadow-sm group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('manager.vendor.menu')}</p>
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

      <VendorFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={vendor}
        isPending={updateVendor.isPending}
        onSubmit={(data) => {
          updateVendor.mutate({ id: vendor.vendorId, data }, {
            onSuccess: () => {
              toast.success(t('manager.vendor.toast_success'))
              setIsDialogOpen(false)
            },
            onError: () => toast.error(t('manager.vendor.toast_error')),
          })
        }}
      />
    </div>
  )
}
