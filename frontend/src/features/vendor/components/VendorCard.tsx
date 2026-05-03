'use client'

import { VendorDto } from '../config/vendor.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Store, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface VendorCardProps {
  vendor: VendorDto
}

const statusLabels: Record<string, string> = {
  PENDING: 'Đang chờ',
  ACCEPTED: 'Đang mở',
  REJECTED: 'Đã đóng',
  CLOSED: 'Tạm nghỉ',
}

export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-3xl border-none bg-white shadow-xl shadow-secondary/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
      <div className="absolute top-0 h-2 w-full bg-gradient-to-r from-primary to-secondary opacity-0 transition-opacity group-hover:opacity-100" />
      
      <CardHeader className="p-0">
        <div className="relative h-48 w-full overflow-hidden">
          <div className="absolute inset-0 bg-secondary/10 flex items-center justify-center">
            <Store className="h-16 w-16 text-secondary/30" />
          </div>
          <Badge className="absolute left-4 top-4 bg-white/80 text-primary backdrop-blur-md border-none">
            {statusLabels[vendor.status] || vendor.status}
          </Badge>
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-xs font-bold text-yellow-600 backdrop-blur-md">
            <Star size={12} className="fill-yellow-600" />
            4.5
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
              {vendor.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-2">
              {vendor.description || 'Chưa có mô tả cho cửa hàng này.'}
            </CardDescription>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-secondary" />
              <span>{vendor.workingHourFrom?.substring(0, 5)} - {vendor.workingHourTo?.substring(0, 5)}</span>
            </div>
          </div>

          <Button asChild className="w-full rounded-2xl h-12 font-bold transition-all group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20">
            <Link href={`/vendors/${vendor.vendorId}`}>
              Xem thực đơn <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
