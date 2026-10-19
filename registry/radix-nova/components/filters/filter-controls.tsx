/* eslint-disable react-refresh/only-export-components */
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FormIcon, type FormIconName } from "@/components/snapp/forms/figma-form-icons"

const FILTER_INTERACTION_ATTRIBUTE = "data-snapp-filter-interaction"

// Include the native stroke in Figma's 12px horizontal and 8px vertical insets.
function FilterMenuSurface({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="filter-menu-surface" data-snapp-filter-interaction="" className={cn("flex w-91 max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-lg border border-snapp-border-primary bg-snapp-surface-primary px-2.75 py-1.75 font-sans text-sm leading-5 font-normal text-snapp-text-primary shadow-snapp-flyout", className)} {...props} />
}

function FilterTokenList({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="filter-token-list" className={cn("flex min-h-7 flex-wrap items-center gap-2", className)} {...props} />
}

function FilterChip({ className, children, removeLabel, type = "button", variant = "standard", ...props }: React.ComponentProps<"button"> & { removeLabel: string; variant?: "standard" | "white" }) {
  return <button aria-label={removeLabel} data-slot="filter-chip" type={type} className={cn("inline-flex h-9 w-fit shrink-0 cursor-pointer items-center gap-2 rounded-full bg-snapp-surface-secondary px-4 py-2 font-sans text-sm leading-5 font-normal whitespace-nowrap text-snapp-text-secondary select-none focus-visible:outline-1 focus-visible:outline-snapp-border-highlight disabled:cursor-not-allowed disabled:opacity-50", variant === "white" && "bg-snapp-surface-primary", className)} {...props}>{children}<FormIcon name="dismiss12" /></button>
}

function FilterButton({ children = "Filter", count = 0, className, ...props }: React.ComponentProps<"button"> & { count?: number }) {
  return <button type="button" data-slot="filter-button" data-snapp-filter-interaction="" className={cn("inline-flex h-9 cursor-pointer items-center gap-2 rounded border border-snapp-border-primary bg-snapp-surface-primary px-2.75 py-1.75 font-sans text-sm leading-5 font-normal text-snapp-text-primary hover:bg-snapp-surface-secondary focus-visible:outline-1 focus-visible:outline-snapp-border-highlight disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}><FormIcon name="filter" /><span>{children}{count > 0 && " (" + count + ")"}</span></button>
}

function FilterSelection({ className, children, icon = "person", checked, onCheckedChange, draggable, onDragStart, disabled, onClick, ...props }: Omit<React.ComponentProps<"button">, "draggable" | "onDragStart"> & { icon?: FormIconName | null; checked?: boolean; onCheckedChange?: (checked: boolean) => void; draggable?: boolean; onDragStart?: React.DragEventHandler<HTMLSpanElement> }) {
  return <div data-slot="filter-selection" className={cn("flex h-7 w-full items-center gap-2 rounded font-sans text-sm leading-5 font-normal text-snapp-text-primary", className)}>
    {draggable && <span draggable onDragStart={onDragStart} className="cursor-grab" aria-label="Drag to reorder"><FormIcon name="draggable" /></span>}
    <button type="button" disabled={disabled} aria-pressed={checked} className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 rounded text-left outline-none hover:bg-snapp-surface-secondary focus-visible:outline-1 focus-visible:outline-snapp-border-highlight disabled:cursor-not-allowed disabled:opacity-50" onClick={event => { onClick?.(event); if (!event.defaultPrevented && checked !== undefined) onCheckedChange?.(!checked) }} {...props}>
      {icon && <FormIcon name={icon} />}
      {checked !== undefined && <span aria-hidden="true" className={cn("grid size-4 shrink-0 place-items-center rounded-xs border border-snapp-border-primary", checked && "border-snapp-surface-green bg-snapp-surface-green")}>{checked && <FormIcon name="checkboxCheck" />}</span>}
      <span className="min-w-0 truncate">{children}</span>
    </button>
  </div>
}

function FilterToken({ field, operator = "is", children, removeLabel, onRemove, className }: { field: React.ReactNode; operator?: React.ReactNode; children: React.ReactNode; removeLabel: string; onRemove: () => void; className?: string }) {
  return <span data-slot="filter-token" className={cn("inline-flex h-7 shrink-0 items-stretch gap-0.5 font-sans text-sm leading-5 font-normal text-snapp-text-primary [&>span]:flex [&>span]:items-center [&>span]:bg-[#eaeaeb] [&>span]:px-2", className)}><span className="rounded-l">{field}</span><span className="text-snapp-text-secondary">{operator}</span><span>{children}</span><button type="button" onClick={onRemove} aria-label={removeLabel} className="flex cursor-pointer items-center rounded-r bg-[#eaeaeb] px-2 focus-visible:outline-1 focus-visible:outline-snapp-border-highlight"><FormIcon name="filterDismiss" /></button></span>
}

interface FilterOption { value: string; label: string }
interface FilterCategory { id: string; label: string; icon?: FormIconName; options: readonly FilterOption[] }
interface AppliedFilter { id: string; categoryId: string; value: string }
interface FilterControlProps {
  categories: readonly FilterCategory[]
  filters: readonly AppliedFilter[]
  onFiltersChange: (filters: AppliedFilter[]) => void
  label?: string
  clearLabel?: string
  searchLabel?: string
  backLabel?: string
  addLabel?: string
  operatorLabel?: string
  removeLabel?: (label: string) => string
  className?: string
}

function FilterControl({ categories, filters, onFiltersChange, label = "Filter", clearLabel = "Clear All", searchLabel = "Search", backLabel = "Back to filters", addLabel = "Add filter", operatorLabel = "is", removeLabel = label => "Remove " + label, className }: FilterControlProps) {
  const [open, setOpen] = React.useState(false)
  const [choosing, setChoosing] = React.useState(filters.length === 0)
  const [summaryVisible, setSummaryVisible] = React.useState(filters.length > 0)
  const [categoryId, setCategoryId] = React.useState<string>()
  const [query, setQuery] = React.useState("")
  const category = categories.find(candidate => candidate.id === categoryId)
  const showAppliedSummary = filters.length > 0 && summaryVisible
  // First-category choices update data immediately but keep their 224px view.
  // Existing applied filters retain their summary while adding more choices.
  const setCategory = (id: string | undefined) => { setCategoryId(id); setQuery(""); setChoosing(true); if (id === undefined && filters.length > 0) setSummaryVisible(true) }
  const changeOption = (value: string, checked: boolean) => {
    if (!category) return
    const current = filters.filter(filter => filter.categoryId === category.id && filter.value === value)
    onFiltersChange(checked ? [...filters, { id: category.id + ":" + value, categoryId: category.id, value }] : filters.filter(filter => !current.includes(filter)))
  }
  return <Popover open={open} onOpenChange={next => { setOpen(next); setSummaryVisible(filters.length > 0); if (!next) { setCategoryId(undefined); setChoosing(filters.length === 0); setQuery("") } }}>
    <PopoverTrigger asChild><FilterButton count={filters.length} className={className}>{label}</FilterButton></PopoverTrigger>
    <PopoverContent align="start" sideOffset={8} className="w-91 gap-2 max-w-[calc(100vw-2rem)] rounded-lg border border-snapp-border-primary bg-snapp-surface-primary px-2.75 py-1.75 font-sans text-sm leading-5 font-normal text-snapp-text-primary shadow-snapp-flyout ring-0" data-snapp-filter-interaction="">
      {(!category || showAppliedSummary) && <div className="flex h-7 items-center gap-2"><FormIcon name="filter" /><span>{label}{filters.length > 0 && " (" + filters.length + ")"}</span></div>}
      {showAppliedSummary && <><FilterTokenList className={cn(filters.length === 1 && "gap-3")}>{filters.map(filter => {
        const parent = categories.find(candidate => candidate.id === filter.categoryId)
        const option = parent?.options.find(candidate => candidate.value === filter.value)
        return <FilterToken key={filter.id} field={parent?.label ?? filter.categoryId} operator={operatorLabel} removeLabel={removeLabel(option?.label ?? filter.value)} onRemove={() => onFiltersChange(filters.filter(candidate => candidate.id !== filter.id))}>{option?.label ?? filter.value}</FilterToken>
      })}<button type="button" aria-label={addLabel} onClick={() => setCategory(undefined)} className="grid size-7 cursor-pointer place-items-center rounded bg-[#eaeaeb] focus-visible:outline-1 focus-visible:outline-snapp-border-highlight"><FormIcon name="filterAdd" /></button></FilterTokenList>
        <button type="button" onClick={() => { onFiltersChange([]); setCategory(undefined); setSummaryVisible(false) }} className="flex h-7 cursor-pointer items-center text-snapp-text-blue focus-visible:outline-1 focus-visible:outline-snapp-border-highlight">{clearLabel}</button>
        {choosing && <div className="relative h-0 w-full"><FormIcon name="filterGroupDivider" className="absolute -top-px left-0" /></div>}
      </>}
      {choosing && (category ? <><div className="flex h-7 items-center gap-1"><button type="button" onClick={() => setCategory(undefined)} aria-label={backLabel} className="cursor-pointer rounded focus-visible:outline-1 focus-visible:outline-snapp-border-highlight"><FormIcon name="back" /></button><span>{category.label}</span><span className="rounded bg-[#eaeaeb] px-1">{operatorLabel}</span></div>{category.options.filter(option => option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(option => <FilterSelection key={option.value} icon={null} checked={filters.some(filter => filter.categoryId === category.id && filter.value === option.value)} onCheckedChange={checked => changeOption(option.value, checked)}>{option.label}</FilterSelection>)}</> : <><div className="flex h-7 items-center gap-2"><FormIcon name="filterSearch" /><input aria-label={searchLabel} placeholder={searchLabel} value={query} onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-snapp-text-secondary" /></div>{categories.filter(item => item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(item => <FilterSelection key={item.id} icon={item.icon ?? null} onClick={() => setCategory(item.id)}>{item.label}</FilterSelection>)}</>)}
    </PopoverContent>
  </Popover>
}

function isFilterInteraction(event: Event) {
  return event.composedPath().some(node => typeof Element !== "undefined" && node instanceof Element && node.hasAttribute(FILTER_INTERACTION_ATTRIBUTE))
}

export { FILTER_INTERACTION_ATTRIBUTE, FilterButton, FilterChip, FilterControl, FilterMenuSurface, FilterSelection, FilterToken, FilterTokenList, isFilterInteraction }
export type { AppliedFilter, FilterCategory, FilterControlProps, FilterOption }
