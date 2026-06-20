"use client"

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  subtext?: string
}

export function StatCard({ label, value, icon, subtext }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {subtext && (
            <p className="text-xs text-muted-foreground">{subtext}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
