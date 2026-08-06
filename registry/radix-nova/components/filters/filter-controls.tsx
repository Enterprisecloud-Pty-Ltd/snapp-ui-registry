/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const FILTER_INTERACTION_ATTRIBUTE = "data-snapp-filter-interaction"

function FilterMenuSurface({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="filter-menu-surface"
      data-snapp-filter-interaction=""
      className={cn(
        "flex w-65 flex-col gap-2 rounded-lg bg-snapp-surface-primary p-2 text-snapp-text-secondary shadow-snapp-flyout",
        className
      )}
      {...props}
    />
  )
}

function FilterTokenList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="filter-token-list"
      className={cn("flex min-h-9 flex-wrap items-center gap-1", className)}
      {...props}
    />
  )
}

function FilterChip({
  className,
  children,
  removeLabel,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & {
  removeLabel: string
}) {
  return (
    <button
      aria-label={removeLabel}
      data-slot="filter-chip"
      type={type}
      className={cn(
        "inline-flex h-9 w-fit shrink-0 cursor-pointer select-none items-center gap-2 rounded-full bg-snapp-colour-grey-100 px-4 py-2 text-sm font-normal leading-4 text-snapp-text-secondary hover:bg-snapp-colour-grey-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-snapp-border-highlight disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="whitespace-nowrap">{children}</span>
      <span className="flex size-3 shrink-0 items-center justify-center">
        <XIcon aria-hidden="true" className="size-2" />
      </span>
    </button>
  )
}

function isFilterInteraction(event: Event) {
  return event.composedPath().some(
    (node) =>
      typeof Element !== "undefined" &&
      node instanceof Element &&
      node.hasAttribute(FILTER_INTERACTION_ATTRIBUTE)
  )
}

export {
  FILTER_INTERACTION_ATTRIBUTE,
  FilterChip,
  FilterMenuSurface,
  FilterTokenList,
  isFilterInteraction,
}
