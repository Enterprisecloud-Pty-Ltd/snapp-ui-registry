import * as React from "react"

import { cn } from "@/lib/utils"

interface FeatureShellProps extends React.ComponentProps<"div"> {
  navigation?: React.ReactNode
  showNavBar?: boolean
}

function FeatureShell({
  children,
  className,
  navigation,
  showNavBar = true,
  ...props
}: FeatureShellProps) {
  return (
    <div
      className={cn(
        "box-border flex min-h-screen w-full bg-snapp-surface-primary text-snapp-text-brand max-snapp-mobile:flex-col",
        className,
      )}
      data-slot="snapp-feature-shell"
      {...props}
    >
      {showNavBar ? navigation : null}
      {children}
    </div>
  )
}

function PageBody({
  className,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <main
      className={cn(
        "box-border flex min-h-screen min-w-0 flex-1 flex-col gap-6 bg-snapp-surface-primary px-7.5 py-8 max-snapp-mobile:px-4 max-snapp-mobile:py-6",
        className,
      )}
      data-slot="snapp-page-body"
      {...props}
    />
  )
}

interface SurfaceCardProps extends React.ComponentProps<"div"> {
  padding?: "compact" | "default"
}

function SurfaceCard({
  className,
  padding = "default",
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "box-border flex w-full flex-col gap-4 rounded-snapp-m border border-snapp-card-border bg-snapp-surface-primary",
        padding === "compact" ? "p-4" : "p-6",
        className,
      )}
      data-padding={padding}
      data-slot="snapp-surface-card"
      {...props}
    />
  )
}

export { FeatureShell, PageBody, SurfaceCard }
export type { FeatureShellProps, SurfaceCardProps }
