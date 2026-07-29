import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LandingSkeletonProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  itemCount?: number
}

function LandingSkeleton({
  "aria-label": ariaLabel = "Loading catalogue",
  className,
  itemCount = 4,
  ...props
}: LandingSkeletonProps) {
  const itemKeys = Array.from(
    { length: Math.max(0, itemCount) },
    (_, index) => `landing-skeleton-${index}`,
  )

  return (
    <div
      aria-busy="true"
      aria-label={ariaLabel}
      className={cn(
        "flex min-h-screen flex-1 bg-snapp-surface-primary",
        className,
      )}
      data-slot="snapp-landing-skeleton"
      role="status"
      {...props}
    >
      <main className="flex flex-1 flex-col justify-between">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <section className="box-border flex w-full flex-col items-start px-snapp-hero-x py-20 max-snapp-wide:px-8 max-snapp-mobile:py-14 max-snapp-compact:px-4">
            <div className="mx-auto flex w-full max-w-snapp-content flex-col items-start gap-12 max-snapp-mobile:gap-8">
              <div className="flex w-full flex-col items-center gap-6 text-center">
                <div className="flex w-full flex-col items-center gap-1">
                  <Skeleton className="h-15.5 w-snapp-hero-title bg-snapp-skeleton-soft" />
                  <Skeleton className="h-5.75 w-snapp-hero-copy bg-snapp-skeleton-soft" />
                </div>
                <Skeleton className="h-14 w-full rounded-full bg-snapp-skeleton-soft" />
              </div>

              <div className="flex w-full flex-wrap items-start gap-6">
                {itemKeys.map((key) => (
                  <div
                    className="flex h-snapp-card w-snapp-card-width flex-col items-center justify-center gap-3 rounded-lg border border-snapp-skeleton-line bg-snapp-surface-primary p-5.75 max-snapp-mobile:w-snapp-card-half max-snapp-compact:w-full"
                    key={key}
                  >
                    <Skeleton className="size-10 bg-snapp-skeleton-icon" />
                    <Skeleton className="h-5 w-36 bg-snapp-skeleton-line" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <footer className="pb-6 text-center">
          <Skeleton className="mx-auto h-4 w-64 bg-snapp-skeleton-soft" />
        </footer>
      </main>
    </div>
  )
}

export { LandingSkeleton }
export type { LandingSkeletonProps }
