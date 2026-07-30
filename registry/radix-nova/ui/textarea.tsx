import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"textarea"> & {
  variant?: "default" | "form"
}) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant}
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        variant === "form" &&
          "field-sizing-fixed h-40.5 min-h-40.5 resize-none rounded-lg border-snapp-card-border bg-popover p-4 text-sm font-normal text-foreground shadow-none placeholder:text-foreground/50 focus-visible:border-foreground focus-visible:ring-0 dark:bg-popover",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
