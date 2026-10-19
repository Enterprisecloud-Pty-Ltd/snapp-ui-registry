import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const primary = cva("bg-snapp-surface-brand text-snapp-text-invert hover:bg-[#43576c] active:bg-snapp-surface-invert focus-visible:inset-ring focus-visible:inset-ring-snapp-border-highlight disabled:bg-[#eaeaeb] disabled:text-[#aaabab]")
const secondary = cva("bg-snapp-surface-red text-snapp-text-invert hover:bg-[#971b13] active:bg-[#7a150f] focus-visible:inset-ring focus-visible:inset-ring-snapp-surface-red disabled:bg-[#eaeaeb] disabled:text-[#aaabab]")
const outline = cva("inset-ring inset-ring-[#7f8082] bg-snapp-surface-primary text-snapp-text-primary hover:bg-snapp-surface-secondary active:bg-snapp-surface-secondary focus-visible:inset-ring focus-visible:inset-ring-snapp-border-highlight disabled:bg-[#eaeaeb] disabled:text-[#aaabab]")
const text = cva("border-0 bg-transparent text-snapp-text-brand hover:text-snapp-text-secondary active:text-snapp-text-primary focus-visible:text-snapp-text-blue disabled:text-[#aaabab]")

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-clip-padding font-sans text-sm leading-5 font-normal whitespace-nowrap outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:inset-ring aria-invalid:inset-ring-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: primary(),
        primary: primary(),
        secondary: secondary(),
        outline: outline(),
        text: text(),
        "form-primary": primary(),
        "form-secondary": outline(),
        "form-destructive": secondary(),
        destructive: secondary(),
        ghost: "bg-transparent text-snapp-text-brand hover:bg-snapp-surface-secondary active:bg-[#eaeaeb] focus-visible:inset-ring focus-visible:inset-ring-snapp-border-highlight disabled:text-[#aaabab]",
        overflow: "border-0 bg-transparent text-snapp-icon-primary hover:bg-snapp-surface-secondary focus-visible:ring-1 focus-visible:ring-snapp-border-highlight disabled:text-[#aaabab]",
        link: text(),
      },
      size: {
        default: "h-11 gap-2.5 px-6 py-3",
        form: "h-11 gap-2.5 px-6 py-3",
        xs: "h-6 gap-1 rounded px-2 text-xs leading-4 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-2 rounded px-3 py-1.5",
        lg: "h-12 gap-2 px-6 py-3",
        text: "h-5 gap-2 rounded-none p-0",
        icon: "size-11 p-0",
        overflow: "h-5 w-5.5 rounded-sm p-0",
        "icon-xs": "size-6 rounded p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded p-0",
        "icon-lg": "size-9 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({ className, variant = "default", size, asChild = false, type, ...props }:
  React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  const resolvedSize = size ?? (variant === "text" || variant === "link" ? "text" : "default")
  return <Comp data-slot="button" data-variant={variant} data-size={resolvedSize} type={type ?? (asChild ? undefined : "button")} className={cn(buttonVariants({ variant, size: resolvedSize }), className)} {...props} />
}

export { Button, buttonVariants }
