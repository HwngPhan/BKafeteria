'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getVoucherStatus, VoucherDto } from '@/features/voucher/config/voucher.config'
import {
  useDeleteVoucher,
  useVouchersByVendor,
} from '@/features/voucher/data-access/voucher.queries'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/AuthProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import { motion } from 'framer-motion'
import {
  CalendarCheck,
  CalendarClock,
  Edit2,
  Loader2,
  Percent,
  Plus,
  Ticket,
  Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const statusStyles = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  upcoming: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  expired: 'bg-red-100 text-red-700 border-red-200',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ManagerVouchersPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { user } = useAuth()
  const vendorId = user?.vendorId ?? undefined

  const { data: vouchers, isLoading } = useVouchersByVendor(vendorId)
  const { mutateAsync: deleteVoucher } = useDeleteVoucher()

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; vendorId: string } | null>(null)

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteVoucher(
      { id: deleteTarget.id, vendorId: deleteTarget.vendorId },
      {
        onSuccess: () => {
          toast.success(t('manager.voucher.toast_deleted'))
          setDeleteTarget(null)
        },
        onError: () => setDeleteTarget(null),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
            {t('manager.voucher.title')}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium flex items-center gap-2">
            {t('manager.voucher.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => router.push('/manager/vouchers/create')}
          className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          {t('manager.voucher.add')}
        </Button>
      </div>

      {/* Content */}
      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4">
          <p className="text-sm text-muted-foreground font-medium">
            {vouchers?.length ?? 0} {t('manager.voucher.total_count')}
          </p>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          {vouchers && vouchers.length > 0 ? (
            <div className="space-y-4">
              {vouchers.map((voucher: VoucherDto, index: number) => {
                const status = getVoucherStatus(voucher)
                return (
                  <motion.div
                    key={voucher.voucherId}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-secondary/10 bg-white hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                      {/* Icon */}
                      <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 self-start">
                        <Ticket size={22} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground bg-secondary/5 px-2 py-1 rounded-lg">
                            #{voucher.voucherId.substring(0, 12)}
                          </span>
                          <Badge
                            className={cn(
                              'rounded-full px-3 py-0.5 text-[10px] font-bold border',
                              statusStyles[status]
                            )}
                          >
                            {t(`manager.voucher.status_${status}`)}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1.5 font-black text-primary">
                            <Percent size={14} />
                            <span className="text-lg">{voucher.discountPercentage}%</span>
                            <span className="text-xs text-muted-foreground font-medium">
                              {t('manager.voucher.discount_off')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                            <CalendarClock size={13} />
                            <span>{formatDateTime(voucher.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                            <CalendarCheck size={13} />
                            <span>{formatDateTime(voucher.expiryDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/manager/vouchers/${voucher.voucherId}/edit`)}
                          className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDeleteTarget({
                              id: voucher.voucherId,
                              vendorId: voucher.vendorId,
                            })
                          }
                          className="h-10 w-10 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="p-8 rounded-full bg-secondary/5">
                <Ticket className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">{t('manager.voucher.empty')}</h3>
                <p className="text-muted-foreground max-w-xs">{t('manager.voucher.empty_desc')}</p>
              </div>
              <Button
                onClick={() => router.push('/manager/vouchers/create')}
                className="rounded-2xl h-12 px-8 font-bold gap-2"
              >
                <Plus size={18} />
                {t('manager.voucher.add')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('manager.voucher.delete_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.delete_confirm_cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {t('common.delete_confirm_action')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
