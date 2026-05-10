'use client'

import { useVendorOrders, useMarkOrderFinished } from '@/features/vendor/data-access/vendor-order.queries'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ShoppingBag, Clock, CheckCircle2, AlertCircle, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { useState, useMemo } from 'react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

export default function ManagerOrdersPage() {
  const { data: orders, isLoading } = useVendorOrders()
  const markFinished = useMarkOrderFinished()
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')

  const sortedOrders = useMemo(() => {
    if (!orders) return []
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })
  }, [orders, sortBy])

  const pendingOrders = sortedOrders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING')
  const historyOrders = sortedOrders.filter(o => o.status === 'FINISHED' || o.status === 'CANCELLED')

  const handleMarkFinished = async (id: string) => {
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    )
  }

  const pendingOrders = orders?.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING') || []
  const historyOrders = orders?.filter(o => o.status === 'FINISHED' || o.status === 'CANCELLED') || []

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground mt-1 font-medium">Theo dõi và xử lý các đơn hàng đang đến.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-40 rounded-xl border-secondary/20 h-10">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-muted-foreground" />
                <SelectValue placeholder="Sắp xếp" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-xl">
              <SelectItem value="newest" className="rounded-lg cursor-pointer">Mới nhất</SelectItem>
              <SelectItem value="oldest" className="rounded-lg cursor-pointer">Cũ nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              Đang xử lý
              <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-none">
                {pendingOrders.length}
              </Badge>
            </h2>
          </div>

          {pendingOrders.length > 0 ? (
            pendingOrders.map((order) => (
              <Card key={order.vendorOrderId} className="rounded-[2rem] border-none shadow-xl shadow-secondary/5 bg-white overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <CardHeader className="p-6 bg-secondary/5 border-b flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-primary">Đơn #{order.orderId.substring(0, 8)}</CardTitle>
                      <CardDescription className="text-[10px] flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(order.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="rounded-full px-3 py-0.5 text-[10px] font-bold bg-yellow-100 text-yellow-700 border-yellow-200 uppercase">
                    {order.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-6">
                   <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">ID Đơn hàng Vendor:</span>
                        <span className="text-xs font-mono bg-secondary/5 px-2 py-1 rounded-lg">{order.vendorOrderId}</span>
                      </div>
                   </div>
                </CardContent>
                <Separator className="bg-secondary/5" />
                <div className="p-6 bg-secondary/5 flex justify-end">
                  <Button 
                    onClick={() => handleMarkFinished(order.vendorOrderId)}
                    disabled={markFinished.isPending}
                    className="rounded-xl h-10 px-6 font-bold shadow-lg shadow-primary/20 gap-2"
                  >
                    {markFinished.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Hoàn thành
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-secondary/5 rounded-[2.5rem] text-center space-y-4">
              <div className="p-4 rounded-full bg-white text-muted-foreground/20">
                <ShoppingBag size={40} />
              </div>
              <p className="text-muted-foreground font-medium">Không có đơn hàng nào đang chờ.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-primary">Lịch sử đơn hàng</h2>
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 bg-white overflow-hidden h-full min-h-[500px]">
            <CardContent className="p-8">
              {historyOrders.length > 0 ? (
                <div className="space-y-4">
                  {historyOrders.map((order) => (
                    <div key={order.vendorOrderId} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/5">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 size={16} />
                         </div>
                         <div>
                            <p className="text-sm font-bold">Đơn #{order.orderId.substring(0, 8)}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <Badge variant="outline" className="rounded-full text-[10px] font-bold border-emerald-200 text-emerald-600">
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
                  <AlertCircle size={40} className="text-muted-foreground/20" />
                  <p className="text-muted-foreground font-medium">Chưa có lịch sử đơn hàng.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
