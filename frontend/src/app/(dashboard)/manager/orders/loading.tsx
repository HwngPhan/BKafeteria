import { Skeleton } from "@/components/ui/skeleton"

export default function ManagerOrdersLoading() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-4 w-48 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />
          ))}
        </div>
        <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />
      </div>
    </div>
  )
}
