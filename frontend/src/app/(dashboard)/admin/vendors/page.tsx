'use client'

import { useAllVendors, useApproveVendor } from '@/features/vendor/data-access/vendor.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Loader2, 
  Store, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export default function AdminVendorsPage() {
  const { data: vendors, isLoading } = useAllVendors()
  const approveVendor = useApproveVendor()
  const [searchQuery, setSearchQuery] = useState('')

  const handleApprove = (id: string, name: string) => {
    approveVendor.mutate(id, {
      onSuccess: () => {
        toast.success(`Đã phê duyệt cửa hàng ${name}`)
      }
    })
  }

  const filteredVendors = vendors?.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading && !vendors) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    ACCEPTED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    CLOSED: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Chờ duyệt',
    ACCEPTED: 'Đang hoạt động',
    REJECTED: 'Bị từ chối',
    CLOSED: 'Đóng cửa',
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Duyệt cửa hàng</h1>
          <p className="text-muted-foreground mt-1 font-medium">Quản lý và phê duyệt các cửa hàng đăng ký vào hệ thống.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm theo tên cửa hàng..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-11 rounded-2xl h-12 bg-white border-none shadow-lg shadow-secondary/5 focus-visible:ring-primary/20"
          />
        </div>
        <Button variant="outline" className="rounded-2xl h-12 gap-2 border-none bg-white shadow-lg shadow-secondary/5 font-bold">
          <Filter size={18} />
          Bộ lọc
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredVendors && filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <Card key={vendor.vendorId} className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white group hover:shadow-primary/5 transition-all duration-500">
              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-start">
                  <div className="p-4 rounded-3xl bg-secondary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                    <Store size={32} />
                  </div>
                  <Badge className={cn('rounded-full px-4 py-1 text-[10px] font-bold border border-none shadow-sm', statusColors[vendor.status])}>
                    {statusLabels[vendor.status] || vendor.status}
                  </Badge>
                </div>
                <div className="mt-6">
                  <CardTitle className="text-xl font-black text-primary">{vendor.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2 font-medium text-xs leading-relaxed">
                    {vendor.description || 'Chưa có mô tả cho cửa hàng này.'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-3 pt-6 border-t border-secondary/5">
                  <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                    <Clock size={14} className="text-primary/40" />
                    {vendor.workingHourFrom} - {vendor.workingHourTo}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                    <ShieldCheck size={14} className="text-primary/40" />
                    {vendor.certification || 'Chưa có chứng nhận'}
                  </div>
                </div>

                {vendor.status === 'PENDING' && (
                  <div className="pt-2 flex gap-3">
                    <Button 
                      className="rounded-2xl h-12 flex-1 font-black gap-2 shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => handleApprove(vendor.vendorId, vendor.name)}
                      disabled={approveVendor.isPending}
                    >
                      {approveVendor.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={18} />}
                      Duyệt ngay
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="rounded-2xl h-12 px-4 font-bold text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <XCircle size={18} />
                    </Button>
                  </div>
                )}
                
                {vendor.status === 'ACCEPTED' && (
                  <Button 
                    variant="outline" 
                    className="rounded-2xl h-12 w-full font-bold gap-2 border-secondary/10 hover:bg-secondary/5"
                  >
                    Xem chi tiết <ArrowRight size={16} />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="p-8 rounded-full bg-secondary/5">
              <Store className="h-20 w-20 text-muted-foreground/20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-primary">Không có yêu cầu nào</h3>
              <p className="text-muted-foreground max-w-xs font-medium">
                Hiện tại không có cửa hàng nào đang chờ phê duyệt hoặc khớp với tìm kiếm của bạn.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
