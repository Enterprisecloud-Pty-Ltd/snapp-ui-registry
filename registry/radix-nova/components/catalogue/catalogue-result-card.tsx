import type * as React from "react"
import { SquareArrowOutUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface CatalogueResultCardProps
  extends Omit<React.ComponentProps<"button">, "children" | "title"> {
  description?: React.ReactNode
  endIcon?: React.ReactNode | false
  title: React.ReactNode
}

function CatalogueResultCard({
  className,
  description,
  endIcon,
  title,
  type = "button",
  ...props
}: CatalogueResultCardProps) {
  return (
    <button
      className={cn(
        "box-border flex w-full cursor-pointer flex-col items-start justify-center gap-2 overflow-hidden rounded-snapp-m border border-snapp-card-border bg-snapp-surface-primary p-4 text-left transition-colors hover:bg-snapp-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snapp-brand-primary",
        className,
      )}
      data-slot="snapp-catalogue-result-card"
      type={type}
      {...props}
    >
      <span className="flex w-full items-center gap-2">
        <strong className="min-w-0 flex-1 text-base font-normal leading-5 text-snapp-text-brand underline underline-offset-2">
          {title}
        </strong>
        {endIcon === false
          ? null
          : endIcon ?? (
              <SquareArrowOutUpRight
                aria-hidden="true"
                className="shrink-0 text-snapp-text-brand"
                size={20}
                strokeWidth={1.5}
              />
            )}
      </span>
      {description ? (
        <span className="block w-full text-sm font-normal leading-4 text-snapp-text-primary">
          {description}
        </span>
      ) : null}
    </button>
  )
}

export { CatalogueResultCard }
export type { CatalogueResultCardProps }
