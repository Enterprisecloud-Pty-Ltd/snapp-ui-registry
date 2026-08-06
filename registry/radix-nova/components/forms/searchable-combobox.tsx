import * as React from "react"

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
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
  showClear = false,
  value = "",
}: SearchableComboboxProps) {
  const items = React.useMemo(() => [...options], [options])
  const selectedOption =
    items.find((option) => option.value === value) ?? null

  return (
    <div className={cn("w-full", className)}>
      <Combobox
        disabled={disabled}
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
        <ComboboxInput
          aria-label={ariaLabel}
          className={inputClassName}
          disabled={disabled}
          id={id}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          showClear={showClear}
        />
        <ComboboxContent className={contentClassName}>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList className={listClassName}>
            <ComboboxCollection>
              {(option: SearchableComboboxOption) => (
                <ComboboxItem
                  className={itemClassName}
                  disabled={option.disabled}
                  key={option.value}
                  value={option}
                >
                  <span className="truncate">{option.label}</span>
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {name ? <input name={name} type="hidden" value={value} /> : null}
    </div>
  )
}

export { SearchableCombobox }
export type { SearchableComboboxOption, SearchableComboboxProps }
