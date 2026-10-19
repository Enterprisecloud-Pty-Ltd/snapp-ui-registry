"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FormIcon, type FormIconName } from "@/components/snapp/forms/figma-form-icons"

interface QuickActionItem {
  id: string
  label: React.ReactNode
  icon?: FormIconName
  disabled?: boolean
  onSelect?: () => void
  children?: readonly QuickActionItem[]
}
interface QuickActionsProps {
  children: React.ReactNode
  items: readonly QuickActionItem[]
  title?: React.ReactNode
  compact?: boolean
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function QuickActionRows({ items, compact, depth = 0 }: { items: readonly QuickActionItem[]; compact: boolean; depth?: number }) {
  return <div className="flex w-full flex-col gap-1">
    {items.map(item => item.children?.length ? <DropdownMenuSub key={item.id}>
      <DropdownMenuSubTrigger size="quick-actions" disabled={item.disabled}>{item.label}</DropdownMenuSubTrigger>
      {/* The trigger ends 9px inside the panel edge (8px padding + 1px border).
          Figma 36:4388/36:4428 joins the panels at that edge, with the first
          submenu 13px above its trigger and later submenus 9px above theirs. */}
      <DropdownMenuSubContent size="quick-actions-compact" sideOffset={9} alignOffset={depth === 0 ? -13 : -9}><QuickActionRows items={item.children} compact={false} depth={depth + 1} /></DropdownMenuSubContent>
    </DropdownMenuSub> : <DropdownMenuItem key={item.id} size={compact ? "quick-actions-compact" : "quick-actions"} className={cn(!compact && depth > 0 && "px-1")} disabled={item.disabled} onSelect={item.onSelect}>{item.icon && <FormIcon name={item.icon} />}{item.label}</DropdownMenuItem>)}
  </div>
}

function QuickActions({ children, items, title, compact = false, className, open, onOpenChange }: QuickActionsProps) {
  return <DropdownMenu open={open} onOpenChange={onOpenChange}>
    <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
    <DropdownMenuContent size="quick-actions" className={cn(!title && "gap-1", className)}>
      {title && <DropdownMenuLabel className="p-0 font-sans text-sm leading-5 font-normal text-snapp-text-blue">{title}</DropdownMenuLabel>}
      <QuickActionRows items={items} compact={compact} />
    </DropdownMenuContent>
  </DropdownMenu>
}

export { QuickActions }
export type { QuickActionItem, QuickActionsProps }
