import { Skeleton } from '@/components/ui/skeleton'

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 md:p-6 shadow-sm">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-8 w-32" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="border-b bg-muted/50 p-3">
        <Skeleton className="h-4 w-full" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b p-3">
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 md:p-6">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-1 h-3 w-60" />
      <Skeleton className="mt-4 h-[300px] w-full rounded-lg" />
    </div>
  )
}
