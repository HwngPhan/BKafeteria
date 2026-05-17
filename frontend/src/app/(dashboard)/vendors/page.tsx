'use client'

import { useActiveVendors } from '@/features/vendor/data-access/vendor.queries'
import { VendorCard } from '@/features/vendor/components/VendorCard'
import { Loader2, Store, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useLanguage } from '@/providers/LanguageProvider'

export default function VendorsPage() {
  const { data: vendors, isLoading } = useActiveVendors()
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useLanguage()

  const filteredVendors = vendors?.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">{t('vendors.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('vendors.subtitle')}</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('vendors.search')}
            className="pl-10 h-12 rounded-2xl border-none bg-white shadow-lg shadow-secondary/5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      ) : filteredVendors && filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.vendorId} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <div className="p-6 rounded-full bg-secondary/5">
            <Store className="h-12 w-12 text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground font-medium">{t('vendors.not_found')}</p>
        </div>
      )}
    </div>
  )
}
