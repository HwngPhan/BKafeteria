import { Skeleton } from "@/components/ui/skeleton"

export default function ManagerMenuLoading() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-4 w-48 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-36 rounded-2xl" />
      </div>
      <div className="rounded-[2.5rem] bg-white shadow-2xl p-8 space-y-6">
        <Skeleton className="h-12 w-96 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[2.5rem] overflow-hidden bg-white shadow-xl">
              <Skeleton className="h-56 w-full" />
              <div className="p-7 space-y-4">
                <Skeleton className="h-6 w-3/4 rounded-xl" />
                <Skeleton className="h-4 w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
