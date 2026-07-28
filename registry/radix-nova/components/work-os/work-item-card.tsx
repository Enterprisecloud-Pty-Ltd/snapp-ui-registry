import { ProgressMeter } from "@/components/snapp/work-os/progress-meter"
import { TimeBadge } from "@/components/snapp/work-os/time-badge"
import {
  WorkGripIcon,
  WorkTypeIcon,
} from "@/components/snapp/work-os/work-item-icons"
import type { WorkItem } from "@/components/snapp/work-os/work-item.types"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface WorkItemCardProps {
  item: WorkItem
  className?: string
}

function WorkItemCard({ item, className }: WorkItemCardProps) {
  return (
    <Card
      className={cn(
        "h-20.5 gap-1 rounded-sm bg-snapp-surface-primary px-2 py-2 text-snapp-text-primary inset-ring-1 inset-ring-snapp-border-primary ring-0",
        className,
      )}
      data-slot="snapp-work-item-card"
    >
      <div className="flex min-h-0 flex-1 items-center gap-2">
        <div className="flex h-full shrink-0 items-start">
          <div className="flex w-10 items-center justify-between">
            <WorkGripIcon className="h-1.25 w-3 text-snapp-icon-primary" />
            <WorkTypeIcon type={item.icon} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 font-snapp-body font-normal">
          <p className="truncate text-snapp-xs leading-snapp-xxs text-snapp-text-brand">
            {item.action}
          </p>
          <p className="truncate text-snapp-xxs leading-snapp-xxxs text-snapp-text-secondary">
            {item.id} <span>{item.name}</span>
          </p>
          <p className="truncate text-snapp-xxs leading-snapp-xxxs text-snapp-text-secondary">
            {item.assignment}
          </p>
        </div>

        <div className="flex h-full w-21.5 shrink-0 flex-col items-end">
          <TimeBadge time={item.time} tone={item.tone} />
        </div>
      </div>

      <ProgressMeter
        className="pl-12"
        label={item.capacity}
        tone={item.tone}
        value={item.progress}
      />
    </Card>
  )
}

export { WorkItemCard }
export type { WorkItem, WorkItemIcon, WorkItemTone } from "@/components/snapp/work-os/work-item.types"
