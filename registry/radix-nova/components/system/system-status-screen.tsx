import * as React from "react"

import { cn } from "@/lib/utils"

const statusContent = {
  error: {
    title: "Error",
    lines: ["Something went wrong.", "Please contact your administrator."],
    role: "alert" as const,
    live: "assertive" as const,
  },
  "subscription-required": {
    title: "Sorry!",
    lines: [
      "It seems like you don’t have a subscription with us.",
      "Please contact your administrator.",
    ],
    role: "status" as const,
    live: "polite" as const,
  },
}

type SnappSystemStatusVariant = keyof typeof statusContent

interface SnappSystemStatusScreenProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  variant: SnappSystemStatusVariant
  viewport?: boolean
}

function SnappSystemStatusScreen({
  className,
  variant,
  viewport = false,
  ...props
}: SnappSystemStatusScreenProps) {
  const titleId = React.useId()
  const content = statusContent[variant]

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full items-center justify-center bg-background p-6 font-snapp-body",
        viewport && "min-h-screen",
        className,
      )}
      data-slot="snapp-system-status-screen"
      data-variant={variant}
      {...props}
    >
      <section
        aria-labelledby={titleId}
        aria-live={content.live}
        className="flex min-h-31 w-full max-w-120 flex-col items-center justify-center gap-snapp-m rounded-snapp-standard p-snapp-lg text-center text-snapp-text-brand"
        role={content.role}
      >
        <h1
          className="m-0 whitespace-nowrap text-snapp-2xl leading-snapp-md font-light"
          id={titleId}
        >
          {content.title}
        </h1>
        <p className="m-0 text-snapp-sm leading-snapp-xxs font-normal whitespace-pre-wrap">
          {content.lines[0]}
          <br aria-hidden="true" />
          {content.lines[1]}
        </p>
      </section>
    </div>
  )
}

export { SnappSystemStatusScreen }
export type { SnappSystemStatusScreenProps, SnappSystemStatusVariant }
