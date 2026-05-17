'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MenuCard } from '@/features/menu/components/MenuCard'
import { useMenuItemsByVendorId } from '@/features/menu/data-access/menu.queries'
import { useVendorById } from '@/features/vendor/data-access/vendor.queries'
import { ArrowLeft, Clock, Info, Loader2, Utensils } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: vendor, isLoading: vendorLoading } = useVendorById(id)
  const { data: menuData, isLoading: menuLoading } = useMenuItemsByVendorId(id)

  if (vendorLoading || menuLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Vendor not found</h2>
        <Button asChild variant="link" className="mt-4">
          <Link href="/vendors">Back to vendors</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Header */}
      <div className="relative h-64 w-full rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative h-full flex flex-col justify-end p-8 md:p-12 text-white">
          <Link href="/vendors" className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </Link>

          <div className="space-y-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
              {vendor.status}
            </Badge>
            <h1 className="text-2xl md:text-5xl font-black">{vendor.name}</h1>
            <div className="flex items-center gap-6 text-white/90 text-sm mt-4">
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{vendor.workingHourFrom?.substring(0, 5)} - {vendor.workingHourTo?.substring(0, 5)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info size={18} />
                <span className="max-w-xs truncate">{vendor.description}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-primary flex items-center gap-3">
            <Utensils size={32} className="text-secondary" />
            Menu
          </h2>
          <div className="flex gap-2">
            {/* Filter tags could go here */}
          </div>
        </div>

        {menuData?.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-4 border-dashed border-secondary/10">
            <p className="text-muted-foreground text-lg font-medium">This vendor hasn't uploaded any menu items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menuData?.map((item) => (
              <MenuCard key={item.menuItemId} item={item} vendorName={vendor.name} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
