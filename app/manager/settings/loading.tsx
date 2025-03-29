import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <Skeleton className="h-8 w-32 mb-6" />

      <div className="rounded-lg border">
        <div className="p-6 border-b">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-48" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          <Skeleton className="h-10 w-32 mt-4" />
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="p-6 border-b">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="p-6 space-y-6">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                {index < 3 && <Skeleton className="h-px w-full" />}
              </div>
            ))}

          <Skeleton className="h-10 w-48 mt-4" />
        </div>
      </div>
    </div>
  )
}

