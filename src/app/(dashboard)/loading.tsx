import { DashboardSkeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <DashboardSkeleton />
    </div>
  )
}
