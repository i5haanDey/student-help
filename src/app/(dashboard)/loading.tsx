import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  )
}
