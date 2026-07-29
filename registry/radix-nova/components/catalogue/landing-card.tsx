import { cn } from "@/lib/utils"

interface LandingCardProps
  extends Omit<React.ComponentProps<"button">, "children"> {
  children: React.ReactNode
  icon: React.ReactNode
}

function LandingCard({
  children,
  className,
  icon,
  type = "button",
  ...props
}: LandingCardProps) {
  return (
    <button
      data-slot="snapp-landing-card"
      type={type}
      className={cn(
        "flex h-snapp-card w-snapp-card-width cursor-pointer flex-col items-center gap-3 rounded-lg border border-snapp-card bg-transparent p-6 text-center font-snapp-body text-base leading-5 text-snapp-text-primary transition-[background-color,box-shadow] duration-150 hover:bg-snapp-surface-primary hover:shadow-snapp-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snapp-brand-primary disabled:cursor-not-allowed disabled:opacity-50 max-snapp-mobile:w-snapp-card-half max-snapp-compact:w-full",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center text-snapp-icon-accent [&>svg]:size-10"
        data-slot="snapp-landing-card-icon"
      >
        {icon}
      </span>
      <span className="w-full" data-slot="snapp-landing-card-label">
        {children}
      </span>
    </button>
  )
}

export { LandingCard }
export type { LandingCardProps }
