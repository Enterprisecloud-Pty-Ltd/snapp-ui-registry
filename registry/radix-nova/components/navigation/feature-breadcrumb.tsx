import type * as React from "react"
import { Fragment } from "react"
import { BookOpen, ChevronRight } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

interface FeatureBreadcrumbItem {
  id: string
  label: React.ReactNode
  onSelect?: () => void
  current?: boolean
}

interface FeatureBreadcrumbProps
  extends Omit<React.ComponentProps<typeof Breadcrumb>, "children"> {
  icon?: React.ReactNode
  items: FeatureBreadcrumbItem[]
}

function FeatureBreadcrumb({
  className,
  icon,
  items,
  ...props
}: FeatureBreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <Breadcrumb
      className={cn("text-sm font-normal leading-4", className)}
      data-slot="snapp-feature-breadcrumb"
      {...props}
    >
      <BreadcrumbList className="m-0 list-none gap-2 p-0 text-snapp-text-soft">
        <BreadcrumbItem aria-hidden="true">
          {icon ?? <BookOpen className="size-5" strokeWidth={1.5} />}
        </BreadcrumbItem>
        {items.map((item, index) => (
          <Fragment key={item.id}>
            {index > 0 ? (
              <BreadcrumbSeparator className="[&>svg]:size-4">
                <ChevronRight strokeWidth={1.5} />
              </BreadcrumbSeparator>
            ) : null}
            <BreadcrumbItem>
              {item.onSelect ? (
                <button
                  aria-current={item.current ? "page" : undefined}
                  className="min-h-7 cursor-pointer rounded-full border-0 bg-snapp-skeleton-soft px-4 py-1.5 text-snapp-text-soft transition-colors hover:bg-snapp-surface-secondary hover:text-snapp-text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snapp-brand-primary"
                  type="button"
                  onClick={item.onSelect}
                >
                  {item.label}
                </button>
              ) : (
                <BreadcrumbPage className="min-h-7 max-w-64 truncate rounded-full bg-snapp-skeleton-soft px-4 py-1.5 text-snapp-text-brand">
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export { FeatureBreadcrumb }
export type { FeatureBreadcrumbItem, FeatureBreadcrumbProps }
