import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox"
import { FormIcon } from "@/components/snapp/forms/figma-form-icons"
import { cn } from "@/lib/utils"

interface SearchableComboboxOption {
  value: string
  label: string
  keywords?: string
  disabled?: boolean
}

interface SearchableComboboxProps {
  "aria-label": string
  className?: string
  contentClassName?: string
  disabled?: boolean
  emptyMessage?: string
  id?: string
  inputClassName?: string
  itemClassName?: string
  listClassName?: string
  name?: string
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  onValueChange: (value: string) => void
  options: readonly SearchableComboboxOption[]
  placeholder?: string
  required?: boolean
  /** Search the editable field (default), a separate popup row, or use fixed choices. */
  searchPlacement?: "input" | "popup" | "none"
  popupSearchLabel?: string
  /** Optional button label independent of the selected option; never replaces its value. */
  triggerLabel?: React.ReactNode
  onTriggerBlur?: React.FocusEventHandler<HTMLButtonElement>
  /** Anchor the popup to a composed field instead of only its selection trigger. */
  popupAnchor?: React.ComponentProps<typeof ComboboxContent>["anchor"]
  showClear?: boolean
  value?: string
}

function SearchableCombobox({
  "aria-label": ariaLabel,
  className,
  contentClassName,
  disabled = false,
  emptyMessage = "No options found",
  id,
  inputClassName,
  itemClassName,
  listClassName,
  name,
  onBlur,
  onValueChange,
  options,
  placeholder = "Select an option",
  required = false,
  searchPlacement = "input",
  popupSearchLabel = "Search",
  triggerLabel,
  onTriggerBlur,
  popupAnchor,
  showClear = false,
  value = "",
}: SearchableComboboxProps) {
  const items = React.useMemo(() => [...options], [options])
  const selectedOption =
    items.find((option) => option.value === value) ?? null
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const buttonMode = searchPlacement !== "input"
  const optionRows = <ComboboxCollection>
    {(option: SearchableComboboxOption) => (
      <ComboboxItem className={itemClassName} disabled={option.disabled} key={option.value} value={option}>
        <span className="truncate">{option.label}</span>
      </ComboboxItem>
    )}
  </ComboboxCollection>

  return (
    <div className={cn("w-full", className)}>
      <Combobox
        disabled={disabled}
        required={buttonMode ? required : undefined}
        inputValue={buttonMode ? query : undefined}
        onInputValueChange={buttonMode ? setQuery : undefined}
        onOpenChange={next => { setOpen(next); if (!next && buttonMode) setQuery("") }}
        filter={(option: SearchableComboboxOption, query: string) => {
          const normalizedQuery = query.trim().toLocaleLowerCase()
          if (!normalizedQuery) return true
          return `${option.label} ${option.value} ${option.keywords ?? ""}`
            .toLocaleLowerCase()
            .includes(normalizedQuery)
        }}
        isItemEqualToValue={(
          option: SearchableComboboxOption,
          selected: SearchableComboboxOption,
        ) => option.value === selected.value}
        itemToStringLabel={(option: SearchableComboboxOption) => option.label}
        itemToStringValue={(option: SearchableComboboxOption) => option.value}
        items={items}
        onValueChange={(option: SearchableComboboxOption | null) =>
          onValueChange(option?.value ?? "")
        }
        value={selectedOption}
      >
        {buttonMode ? <ComboboxTrigger
          aria-label={ariaLabel}
          id={id}
          disabled={disabled}
          onBlur={onTriggerBlur}
          className={cn("flex h-10.25 w-full cursor-pointer items-center justify-between gap-0 rounded-lg border border-snapp-border-primary bg-snapp-surface-primary px-3.75 font-sans text-sm leading-5 font-normal text-snapp-text-secondary outline-none focus-visible:border-snapp-border-brand data-popup-open:border-snapp-border-brand disabled:cursor-not-allowed disabled:bg-[#eaeaeb] disabled:text-[#aaabab]", inputClassName)}
        >
          <span className="min-w-0 flex-1 truncate text-left">{triggerLabel ?? selectedOption?.label ?? placeholder}</span>
          <FormIcon name={open ? "chevronUpField" : "chevronDownField"} />
        </ComboboxTrigger> : <ComboboxInput
          aria-label={ariaLabel}
          className={inputClassName}
          disabled={disabled}
          id={id}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          showClear={showClear}
        />}
        <ComboboxContent anchor={popupAnchor} className={cn(buttonMode && "flex flex-col gap-2 p-1.75", contentClassName)}>
          {searchPlacement === "popup" && <div data-slot="lookup-search" className="flex h-7 w-full shrink-0 items-center gap-2 px-2">
            <FormIcon name="search16" />
            <ComboboxPrimitive.Input aria-label={popupSearchLabel} placeholder={popupSearchLabel} onBlur={onBlur} data-slot="lookup-search-input" className="min-w-0 flex-1 bg-transparent font-sans text-sm leading-5 font-normal text-snapp-text-secondary outline-none placeholder:text-snapp-text-secondary" />
          </div>}
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          {buttonMode ? <ComboboxPrimitive.List data-slot="lookup-list" className={cn("no-scrollbar flex max-h-60 min-h-0 flex-col gap-2 overflow-x-hidden overflow-y-auto overscroll-contain", listClassName)}>{optionRows}</ComboboxPrimitive.List> : <ComboboxList className={listClassName}>{optionRows}</ComboboxList>}
        </ComboboxContent>
      </Combobox>
      {name ? <input name={name} type="hidden" value={value} /> : null}
    </div>
  )
}

export { SearchableCombobox }
export type { SearchableComboboxOption, SearchableComboboxProps }
