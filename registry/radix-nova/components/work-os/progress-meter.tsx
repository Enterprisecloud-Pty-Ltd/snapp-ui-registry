import type { WorkItemTone } from "@/components/snapp/work-os/work-item.types"
import { cn } from "@/lib/utils"

const progressClasses: Record<WorkItemTone, string> = {
  green: "bg-snapp-surface-green",
  amber: "bg-snapp-surface-amber",
  red: "bg-snapp-surface-red",
}

interface ProgressMeterProps {
  value: number
  label: string
  tone?: WorkItemTone
  className?: string
}

function ProgressMeter({
  value,
  label,
  tone = "green",
  className,
}: ProgressMeterProps) {
  const percentage = Math.min(100, Math.max(0, value))

  return (
    <div
      className={cn("flex h-4 items-center gap-2", className)}
      data-slot="snapp-progress-meter"
    >
      <div
        aria-label={`${label}: ${percentage}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={percentage}
        className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-snapp-surface-secondary"
        role="progressbar"
      >
        <div
          className={cn("h-full rounded-full", progressClasses[tone])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-10.5 shrink-0 text-snapp-xs leading-snapp-xxs text-snapp-text-secondary">
        {label}
      </span>
    </div>
  )
}

export { ProgressMeter }
