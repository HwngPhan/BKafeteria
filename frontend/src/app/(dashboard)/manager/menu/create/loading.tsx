import { Skeleton } from "@/components/ui/skeleton"

export default function CreateMenuItemLoading() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-4 w-48 rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-[600px] w-full rounded-[2.5rem]" />
    </div>
  )
}
