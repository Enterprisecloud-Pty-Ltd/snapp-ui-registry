import { ClockWorkIcon } from "@/components/snapp/work-os/work-item-icons"
import type { WorkItemTone } from "@/components/snapp/work-os/work-item.types"
import { cn } from "@/lib/utils"

interface TimeBadgeProps {
  time: string
  tone?: WorkItemTone
  className?: string
}

function TimeBadge({ time, tone = "green", className }: TimeBadgeProps) {
  const isDanger = tone === "red"

  return (
    <div
      className={cn(
        "flex h-6 w-21.5 items-center gap-1 rounded-sm border border-snapp-border-primary p-1 font-snapp-body font-normal leading-snapp-xxs text-snapp-text-secondary",
        isDanger && "text-snapp-text-red",
        className,
      )}
      data-slot="snapp-time-badge"
    >
      <span className="inline-flex size-4 shrink-0 items-center justify-center">
        <ClockWorkIcon className="size-3" />
      </span>
      <span className="whitespace-nowrap text-snapp-xs">{time}</span>
    </div>
  )
}

export { TimeBadge }
