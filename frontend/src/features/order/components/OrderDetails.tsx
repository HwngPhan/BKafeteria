'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Circle,
  Truck,
  UtensilsCrossed,
  Store,
  Tag,
  Star,
  CreditCard,
  Loader2,
  Ticket,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/providers/LanguageProvider'
import { useIsMobile } from '@/hooks/use-mobile'
import { useState } from 'react'
import { useMyFeedbacks } from '@/features/menu/data-access/feedback.queries'
import { FeedbackModal } from '@/features/menu/components/FeedbackModal'
import { FeedbackDto } from '@/features/menu/config/feedback.types'
import { isVoucherValid, VoucherDto } from '@/features/voucher/config/voucher.config'
import { useVouchersByVendor } from '@/features/voucher/data-access/voucher.queries'
import { usePayOrder } from '../data-access/order.queries'
import { OrderDto, OrderStatus } from '../config/order.config'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface OrderDetailsProps {
  order: OrderDto
}

interface SelectedVoucher {
  voucherId: string
  discountPct: number
}

const statusSteps: { status: OrderStatus; labelKey: string; icon: LucideIcon }[] = [
  { status: 'PENDING', labelKey: 'order_details.status_pending', icon: Clock },
  { status: 'PURCHASED', labelKey: 'order_details.status_purchased', icon: ClipboardList },
  { status: 'PROCESSING', labelKey: 'order_details.status_processing', icon: UtensilsCrossed },
  { status: 'COMPLETED', labelKey: 'order_details.status_completed', icon: CheckCircle2 },
]

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PURCHASED: 'bg-blue-100 text-blue-700 border-blue-200',
  PROCESSING: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELED: 'bg-red-100 text-red-700 border-red-200',
}

const statusLabels: Record<string, string> = {
  PENDING: 'order_status.pending',
  PURCHASED: 'order_status.purchased',
  PROCESSING: 'order_status.processing',
  COMPLETED: 'order_status.completed',
  DELIVERED: 'order_status.delivered',
  CANCELED: 'order_status.canceled',
}

// Voucher selector per vendor — fetches valid vouchers and lets user pick one
function VendorVoucherSelector({
  vendorId,
  vendorName,
  selectedVoucherId,
  onSelect,
}: {
  vendorId: string
  vendorName: string
  selectedVoucherId: string | undefined
  onSelect: (voucher: SelectedVoucher | undefined) => void
}) {
  const { t } = useLanguage()
  const { data: allVouchers, isLoading } = useVouchersByVendor(vendorId)
  const validVouchers = (allVouchers ?? []).filter(isVoucherValid)

  if (isLoading || validVouchers.length === 0) return null

  const handleChange = (val: string) => {
    if (val === 'none') {
      onSelect(undefined)
      return
    }
    const found = validVouchers.find((v) => v.voucherId === val)
    if (found) {
      onSelect({ voucherId: found.voucherId, discountPct: found.discountPercentage })
    }
  }

  return (
    <div className="mt-3 flex items-center gap-3 bg-primary/5 rounded-2xl px-4 py-3">
      <Ticket size={16} className="text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1">
          {t('order_details.voucher_label')} — {vendorName}
        </p>
        <Select value={selectedVoucherId ?? 'none'} onValueChange={handleChange}>
          <SelectTrigger className="h-9 rounded-xl bg-white border-primary/20 text-xs font-bold">
            <SelectValue placeholder={t('order_details.no_voucher')} />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-2xl bg-white p-2">
            <SelectItem value="none" className="rounded-lg py-2 cursor-pointer text-xs">
              <span className="text-muted-foreground">{t('order_details.no_voucher')}</span>
            </SelectItem>
            {validVouchers.map((v: VoucherDto) => (
              <SelectItem
                key={v.voucherId}
                value={v.voucherId}
                className="rounded-lg py-2 cursor-pointer text-xs"
              >
                <span className="font-bold text-primary">-{v.discountPercentage}%</span>
                <span className="text-muted-foreground ml-2">
                  #{v.voucherId.substring(0, 8)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const { t } = useLanguage()
  const isMobile = useIsMobile()
  const router = useRouter()
  const { data: myFeedbacks } = useMyFeedbacks()
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('')
  const [selectedItemName, setSelectedItemName] = useState('')
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackDto | null>(null)

  // Voucher state: vendorId → { voucherId, discountPct }
  const [selectedVouchers, setSelectedVouchers] = useState<Record<string, SelectedVoucher>>({})

  const payOrderMutation = usePayOrder()
  const isPending = order.status === 'PENDING'

  const getStatusIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'PENDING': return 0
      case 'PURCHASED': return 1
      case 'PROCESSING': return 2
      case 'COMPLETED':
      case 'DELIVERED':
        return 3
      default: return -1
    }
  }
  const currentStatusIndex = getStatusIndex(order.status)
  const isCanceled = order.status === 'CANCELED'

  const originalPrice = (order.vendorOrders || []).reduce(
    (sum, vo) => sum + (vo.vendorPrice || 0),
    0
  )
  const discount = originalPrice > 0 ? originalPrice - order.totalPrice : 0
  const discountPercent =
    originalPrice > 0 ? Math.round((discount / originalPrice) * 100) : 0

  // Local discounted total preview (optimistic — backend recalculates at payment)
  const localTotal = (order.vendorOrders || []).reduce((sum, vo) => {
    const selected = selectedVouchers[vo.vendorId]
    const price = selected
      ? vo.vendorPrice * (1 - selected.discountPct / 100)
      : vo.vendorPrice
    return sum + price
  }, 0)

  const voucherSaving = originalPrice - localTotal
  const hasSelectedVouchers = Object.keys(selectedVouchers).length > 0

  const handlePay = async () => {
    const voucherIds = Object.values(selectedVouchers).map((v) => v.voucherId)
    try {
      await payOrderMutation.mutateAsync({ id: order.orderId, voucherIds })
      toast.success(t('order_card.toast_pay_success'))
      router.back()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : undefined
      toast.error(msg || t('order_card.toast_pay_error'))
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Status Timeline */}
      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white">
        <CardHeader className="bg-secondary/5 border-b p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <ClipboardList size={28} />
              </div>
              <div>
                <CardTitle className="text-xl font-black">
                  {t('order_card.id')}{order.orderId.substring(0, 8)}
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-2">
                  <Clock size={14} />
                  {t('order_details.ordered_at').replace(
                    '{time}',
                    new Date(order.createdAt).toLocaleString()
                  )}
                </p>
              </div>
            </div>
            <Badge
              className={cn(
                'rounded-full px-6 py-1.5 text-xs font-bold border self-start md:self-center',
                statusColors[order.status]
              )}
            >
              {t(statusLabels[order.status]) || order.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8 md:p-12">
          {!isCanceled ? (
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              {/* Progress Line */}
              <div className="absolute left-[15px] md:left-0 md:top-[15px] h-full w-[2px] md:h-[2px] md:w-full bg-secondary/10 -z-10" />
              <div
                className="absolute left-[15px] md:left-0 md:top-[15px] h-full w-[2px] md:h-[2px] bg-primary transition-all duration-1000 -z-10"
                style={
                  isMobile
                    ? {
                        height: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                        width: '2px',
                      }
                    : {
                        width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                        height: '2px',
                      }
                }
              />
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex
                const isActive = index === currentStatusIndex
                const Icon = step.icon
                return (
                  <div
                    key={step.status}
                    className="flex md:flex-col items-center gap-4 md:gap-3 group"
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10',
                        isCompleted
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'bg-white border-2 border-secondary/20 text-muted-foreground',
                        isActive && 'scale-125 ring-4 ring-primary/10'
                      )}
                    >
                      {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </div>
                    <div className="flex flex-col md:items-center">
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider transition-colors duration-300',
                          isCompleted ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        {t(step.labelKey)}
                      </span>
                      <Icon
                        size={16}
                        className={cn(
                          'mt-1 transition-colors duration-300',
                          isCompleted ? 'text-primary' : 'text-muted-foreground/30'
                        )}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-6 rounded-full bg-red-50 text-red-500 mb-4">
                <UtensilsCrossed size={48} />
              </div>
              <h3 className="text-xl font-bold text-red-600">
                {t('order_details.canceled_title')}
              </h3>
              <p className="text-muted-foreground mt-2 max-w-xs">
                {t('order_details.canceled_desc')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-bold">
                {t('order_details.order_items')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              {(order.vendorOrders || []).map((vendorOrder, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center justify-between bg-secondary/5 p-4 rounded-2xl">
                    <h4 className="font-bold text-primary flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      {vendorOrder.vendorName}
                    </h4>
                    <div className="flex items-center gap-2">
                      {vendorOrder.status && (
                        <Badge
                          className={cn(
                            'rounded-full px-3 py-0.5 text-[10px] font-bold border',
                            statusColors[vendorOrder.status]
                          )}
                        >
                          {t(statusLabels[vendorOrder.status]) || vendorOrder.status}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="rounded-full bg-white border-secondary/20"
                      >
                        {vendorOrder.vendorPrice.toLocaleString()}đ
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4 px-2">
                    {(vendorOrder.orderItems || []).map((item, i) => {
                      const isOrderFinished =
                        order.status === 'COMPLETED' || order.status === 'DELIVERED'
                      const feedback = myFeedbacks?.find(
                        (fb) => fb.menuItemId === item.itemId
                      )
                      return (
                        <div
                          key={i}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl transition-all duration-300 hover:bg-secondary/5"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-secondary/5 flex items-center justify-center text-primary font-bold shrink-0">
                              {item.quantity}x
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm">{item.itemName}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">
                                {t('order_details.unit_price').replace(
                                  '{price}',
                                  item.price.toLocaleString()
                                )}
                              </p>
                              {isOrderFinished && feedback && (
                                <div className="mt-2 p-2 bg-amber-50/50 border border-amber-100/50 rounded-xl max-w-xs sm:max-w-md">
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        size={12}
                                        className={cn(
                                          star <= feedback.rating
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-muted-foreground/20'
                                        )}
                                      />
                                    ))}
                                    <span className="text-[10px] font-black text-amber-600 ml-1">
                                      {feedback.rating}/5
                                    </span>
                                  </div>
                                  {feedback.comment && (
                                    <p className="text-[10px] text-muted-foreground italic mt-1 pl-1 line-clamp-2">
                                      &ldquo;{feedback.comment}&rdquo;
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0">
                            <span className="font-black text-sm">
                              {(item.price * item.quantity).toLocaleString()}đ
                            </span>
                            {isOrderFinished && (
                              <Button
                                size="sm"
                                variant={feedback ? 'ghost' : 'outline'}
                                onClick={() => {
                                  setSelectedMenuItemId(item.itemId)
                                  setSelectedItemName(item.itemName)
                                  setSelectedFeedback(feedback || null)
                                  setIsFeedbackOpen(true)
                                }}
                                className={cn(
                                  'rounded-xl h-8 text-[10px] font-extrabold px-3 transition-all cursor-pointer',
                                  feedback
                                    ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50/50'
                                    : 'border-primary/20 text-primary hover:bg-primary hover:text-white'
                                )}
                              >
                                {feedback ? t('feedback.edit_rate') : t('feedback.rate_item')}
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Voucher selector — only for PENDING orders */}
                  {isPending && (
                    <VendorVoucherSelector
                      vendorId={vendorOrder.vendorId}
                      vendorName={vendorOrder.vendorName}
                      selectedVoucherId={selectedVouchers[vendorOrder.vendorId]?.voucherId}
                      onSelect={(v) => {
                        setSelectedVouchers((prev) => {
                          const next = { ...prev }
                          if (v) {
                            next[vendorOrder.vendorId] = v
                          } else {
                            delete next[vendorOrder.vendorId]
                          }
                          return next
                        })
                      }}
                    />
                  )}

                  {idx < (order.vendorOrders?.length || 0) - 1 && (
                    <Separator className="bg-secondary/5" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Voucher discount preview — shown when vouchers selected */}
          {isPending && hasSelectedVouchers && (
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-primary/5 overflow-hidden bg-primary/5 border border-primary/10">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Ticket size={18} />
                  </div>
                  <h3 className="font-bold text-primary">
                    {t('order_details.voucher_label')}
                  </h3>
                  <Badge className="ml-auto rounded-full bg-primary/10 text-primary border-none font-bold text-xs px-3">
                    -{Math.round((voucherSaving / originalPrice) * 100)}%
                  </Badge>
                </div>
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('order_details.original_price')}</span>
                    <span className="font-medium line-through text-muted-foreground">
                      {originalPrice.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary font-medium">{t('order_details.discount')}</span>
                    <span className="font-bold text-primary">-{voucherSaving.toLocaleString()}đ</span>
                  </div>
                  <Separator className="bg-primary/10" />
                  <div className="flex justify-between">
                    <span className="font-bold text-sm">{t('order_details.subtotal')}</span>
                    <span className="font-black text-primary text-lg">
                      {Math.round(localTotal).toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Member discount (after payment) */}
          {discount > 0 && !isPending && (
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-emerald-100/50 overflow-hidden bg-emerald-50">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                    <Tag size={18} />
                  </div>
                  <h3 className="font-bold text-emerald-700">{t('order_details.member_offer')}</h3>
                  <Badge className="ml-auto rounded-full bg-emerald-100 text-emerald-700 border-none font-bold text-xs px-3">
                    -{discountPercent}%
                  </Badge>
                </div>
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('order_details.original_price')}</span>
                    <span className="font-medium line-through text-muted-foreground">
                      {originalPrice.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 font-medium">{t('order_details.discount')}</span>
                    <span className="font-bold text-emerald-600">-{discount.toLocaleString()}đ</span>
                  </div>
                  <Separator className="bg-emerald-100" />
                  <div className="flex justify-between">
                    <span className="font-bold text-sm">{t('order_details.subtotal')}</span>
                    <span className="font-black text-primary">{order.totalPrice.toLocaleString()}đ</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 overflow-hidden bg-primary text-primary-foreground h-fit">
            <CardHeader className="p-8">
              <CardTitle className="text-lg font-bold opacity-80">
                {t('order_details.total_payment')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium opacity-70">
                  {t('order_details.subtotal')}
                </span>
                <span className="text-3xl font-black">
                  {isPending && hasSelectedVouchers
                    ? `~${Math.round(localTotal).toLocaleString()}đ`
                    : `${order.totalPrice.toLocaleString()}đ`}
                </span>
              </div>
              <Separator className="bg-white/20" />
              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <div className="p-2 rounded-xl bg-white/20">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold">{t('order_details.pickup_location')}</p>
                  <p className="text-[10px] opacity-70">{t('order_details.pickup_desc')}</p>
                </div>
              </div>

              {/* Pay button — only for PENDING orders */}
              {isPending && (
                <Button
                  onClick={handlePay}
                  disabled={payOrderMutation.isPending}
                  className="w-full h-12 rounded-2xl font-bold bg-white text-primary hover:bg-white/90 shadow-lg gap-2"
                >
                  {payOrderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard size={18} />
                  )}
                  {hasSelectedVouchers
                    ? t('order_details.pay_with_voucher')
                    : t('order_card.pay_btn')}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feedback Dialog */}
      <FeedbackModal
        open={isFeedbackOpen}
        onOpenChange={setIsFeedbackOpen}
        menuItemId={selectedMenuItemId}
        itemName={selectedItemName}
        existingFeedback={selectedFeedback}
      />
    </div>
  )
}
