import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const snappTextSizes = [
  "snapp-tiny",
  "snapp-micro",
  "snapp-caption",
  "snapp-body-sm",
  "snapp-xxs",
  "snapp-xs",
  "snapp-sm",
  "snapp-md",
  "snapp-lg",
  "snapp-xl",
  "snapp-2xl",
  "snapp-3xl",
  "snapp-4xl",
  "snapp-5xl",
  "snapp-display-sm",
  "snapp-display",
] as const

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...snappTextSizes] }],
    },
  },
})

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { cn }
