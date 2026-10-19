import * as React from "react"
import { cn } from "@/lib/utils"

// Figma measures the 16px content inset from the outside of its inside stroke.
// Keep the native border and subtract its pixel from the CSS padding.
function Input({ className, type, variant = "default", ...props }: React.ComponentProps<"input"> & { variant?: "default" | "form" | "inter" }) {
  return <input type={type} data-slot="input" data-variant={variant} className={cn(
    "h-10.25 w-full min-w-0 rounded-lg border border-snapp-border-primary bg-snapp-surface-primary px-3.75 py-0 font-sans text-sm leading-5 font-normal text-snapp-text-primary outline-none placeholder:text-snapp-text-secondary focus-visible:border-snapp-border-brand disabled:cursor-not-allowed disabled:bg-[#eaeaeb] disabled:text-[#aaabab] disabled:placeholder:text-[#aaabab] aria-invalid:border-snapp-surface-red file:mr-2 file:border-0 file:bg-transparent file:text-sm file:font-normal",
    variant === "inter" && "h-9 rounded-md border-[#e5e5e5] px-2.75 py-1 font-snapp-inter text-sm leading-5 text-[#0a0a0a] shadow-[0_1px_2px_rgb(0_0_0/0.1)] placeholder:text-[#737373]",
    className
  )} {...props} />
}

export { Input }
