import * as React from "react"

import { cn } from "@/lib/utils"
import orderIcon from "./order.svg"

const DragPreview = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { icon: React.ReactNode }
>(({ className, icon, children, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="drag-preview"
    className={cn(
      "inline-flex h-8 w-fit max-w-full items-center gap-2 rounded-snapp-rounded border border-snapp-border-primary bg-snapp-surface-primary px-2 font-snapp-body text-snapp-sm leading-snapp-xxs font-normal whitespace-nowrap text-snapp-text-primary shadow-snapp-drag-preview",
      className
    )}
    {...props}
  >
    <img
      alt=""
      aria-hidden="true"
      className="h-1.25 w-3 shrink-0"
      src={orderIcon}
    />
    <span
      aria-hidden="true"
      className="flex size-5 shrink-0 items-center justify-center overflow-hidden [&_img]:size-full [&_svg]:size-5"
    >
      {icon}
    </span>
    <span className="min-w-0 truncate">{children}</span>
  </div>
))

DragPreview.displayName = "DragPreview"

function DropIndicator({
  className,
  position = "before",
  ...props
}: React.ComponentProps<"div"> & {
  position?: "before" | "after"
}) {
  return (
    <div
      aria-hidden="true"
      data-position={position}
      data-slot="drop-indicator"
      className={cn(
        "pointer-events-none absolute right-0 left-0 z-10 h-0.5 bg-snapp-border-highlight data-[position=after]:-bottom-px data-[position=before]:-top-px",
        className
      )}
      {...props}
    >
      <span className="absolute -left-px top-1/2 h-0 w-0 -translate-y-1/2 border-y-5 border-l-8 border-y-transparent border-l-snapp-border-highlight" />
    </div>
  )
}

export { DragPreview, DropIndicator }
