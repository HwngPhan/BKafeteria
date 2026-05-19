import { Skeleton } from "@/components/ui/skeleton"

export default function AdminUsersLoading() {
  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-2">
        <Skeleton className="h-10 w-72 rounded-2xl" />
        <Skeleton className="h-4 w-56 rounded-xl" />
      </div>
      <div className="rounded-[2.5rem] bg-white shadow-2xl overflow-hidden">
        <div className="p-8 pb-4">
          <Skeleton className="h-12 w-96 rounded-2xl" />
        </div>
        <div className="p-8 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
