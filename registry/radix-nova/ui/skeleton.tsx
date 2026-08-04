import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-snapp-skeleton-soft motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  )
}

interface SkeletonGroupProps
  extends Omit<
    React.ComponentProps<"div">,
    "aria-busy" | "aria-label" | "role"
  > {
  "aria-label": string
  "data-slot"?: string
}

function SkeletonGroup({
  "aria-label": ariaLabel,
  className,
  "data-slot": dataSlot = "skeleton-group",
  ...props
}: SkeletonGroupProps) {
  return (
    <div
      {...props}
      aria-busy="true"
      aria-label={ariaLabel}
      className={cn(className)}
      data-slot={dataSlot}
      role="status"
    />
  )
}

export { Skeleton, SkeletonGroup }
export type { SkeletonGroupProps }
