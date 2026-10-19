import * as React from "react"
import { cn } from "@/lib/utils"

// The native 1px border consumes one pixel of Figma’s 16px inside-stroke inset.
function Textarea({ className, variant = "default", ...props }: React.ComponentProps<"textarea"> & { variant?: "default" | "form" | "inter" }) {
  return <textarea data-slot="textarea" data-variant={variant} className={cn(
    "flex field-sizing-content min-h-20 w-full rounded-lg border border-snapp-border-primary bg-snapp-surface-primary p-3.75 font-sans text-sm leading-5 font-normal text-snapp-text-primary outline-none placeholder:text-snapp-text-secondary focus-visible:border-snapp-border-brand disabled:cursor-not-allowed disabled:bg-[#eaeaeb] disabled:text-[#aaabab] aria-invalid:border-snapp-surface-red",
    variant === "form" && "field-sizing-fixed h-20 min-h-20 resize-none",
    variant === "inter" && "rounded-md border-[#e5e5e5] p-2.75 font-snapp-inter text-base leading-6 text-[#0a0a0a] placeholder:text-[#737373]",
    className
  )} {...props} />
}

export { Textarea }
