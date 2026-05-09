'use client'

import { OrderDto, OrderStatus } from '../config/order.types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Package, 
  Truck, 
  UtensilsCrossed,
  Store
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderDetailsProps {
  order: OrderDto
}

const statusSteps: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'PENDING', label: 'Chờ thanh toán', icon: Clock },
  { status: 'PURCHASED', label: 'Đã thanh toán', icon: ClipboardList },
  { status: 'PROCESSING', label: 'Đang chế biến', icon: UtensilsCrossed },
  { status: 'COMPLETED', label: 'Đã chuẩn bị', icon: Package },
  { status: 'DELIVERED', label: 'Đã giao hàng', icon: CheckCircle2 },
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
  PENDING: 'Chờ thanh toán',
  PURCHASED: 'Đã thanh toán',
  PROCESSING: 'Đang chế biến',
  COMPLETED: 'Hoàn thành',
  DELIVERED: 'Đã giao',
  CANCELED: 'Đã hủy',
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const currentStatusIndex = statusSteps.findIndex(s => s.status === order.status)
  const isCanceled = order.status === 'CANCELED'

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
                <CardTitle className="text-xl font-black">Chi tiết đơn hàng #{order.orderId.substring(0, 8)}</CardTitle>
                <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-2">
                  <Clock size={14} />
                  Đặt lúc: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge className={cn('rounded-full px-6 py-1.5 text-xs font-bold border self-start md:self-center', statusColors[order.status])}>
              {statusLabels[order.status] || order.status}
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
                style={{ 
                  height: typeof window !== 'undefined' && window.innerWidth < 768 ? `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` : '2px',
                  width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` : '2px'
                }} 
              />

              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex
                const isActive = index === currentStatusIndex
                const Icon = step.icon

                return (
                  <div key={step.status} className="flex md:flex-col items-center gap-4 md:gap-3 group">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                      isCompleted ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white border-2 border-secondary/20 text-muted-foreground",
                      isActive && "scale-125 ring-4 ring-primary/10"
                    )}>
                      {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </div>
                    <div className="flex flex-col md:items-center">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                        isCompleted ? "text-primary" : "text-muted-foreground"
                      )}>
                        {step.label}
                      </span>
                      <Icon size={16} className={cn(
                        "mt-1 transition-colors duration-300",
                        isCompleted ? "text-primary" : "text-muted-foreground/30"
                      )} />
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
              <h3 className="text-xl font-bold text-red-600">Đơn hàng đã bị hủy</h3>
              <p className="text-muted-foreground mt-2 max-w-xs">
                Đơn hàng này đã được hủy và không còn được xử lý.
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
              <CardTitle className="text-lg font-bold">Món đã đặt</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              {order.orderItems.map((vendorOrder, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center justify-between bg-secondary/5 p-4 rounded-2xl">
                    <h4 className="font-bold text-primary flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      {vendorOrder.vendorName}
                    </h4>
                    <Badge variant="outline" className="rounded-full bg-white border-secondary/20">
                      {vendorOrder.vendorPrice.toLocaleString()}đ
                    </Badge>
                  </div>
                  <div className="space-y-4 px-2">
                    {vendorOrder.menuItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-secondary/5 flex items-center justify-center text-primary font-bold">
                            {item.quantity}x
                          </div>
                          <div>
                            <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.itemName}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{item.price.toLocaleString()}đ / món</p>
                          </div>
                        </div>
                        <span className="font-black text-sm">{(item.price * item.quantity).toLocaleString()}đ</span>
                      </div>
                    ))}
                  </div>
                  {idx < order.orderItems.length - 1 && <Separator className="bg-secondary/5" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 overflow-hidden bg-primary text-primary-foreground h-fit">
            <CardHeader className="p-8">
              <CardTitle className="text-lg font-bold opacity-80">Tổng thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium opacity-70">Thành tiền</span>
                <span className="text-3xl font-black">{order.totalPrice.toLocaleString()}đ</span>
              </div>
              <Separator className="bg-white/20" />
              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <div className="p-2 rounded-xl bg-white/20">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold">Địa điểm nhận món</p>
                  <p className="text-[10px] opacity-70">Vui lòng đến quầy khi có thông báo "Hoàn thành"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
