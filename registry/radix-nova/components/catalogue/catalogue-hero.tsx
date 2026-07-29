import type * as React from "react"
import { useState } from "react"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

interface CatalogueHeroProps
  extends Omit<React.ComponentProps<"section">, "children" | "title"> {
  children: React.ReactNode
  description: React.ReactNode
  onSearch: (query: string) => void
  searchLabel: string
  searchPlaceholder: string
  title: React.ReactNode
}

function CatalogueHero({
  children,
  className,
  description,
  onSearch,
  searchLabel,
  searchPlaceholder,
  title,
  ...props
}: CatalogueHeroProps) {
  const [query, setQuery] = useState("")

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuery = query.trim()
    if (trimmedQuery) onSearch(trimmedQuery)
  }

  return (
    <section
      className={cn(
        "box-border flex w-full flex-col items-start px-snapp-hero-x py-20 max-snapp-wide:px-8 max-snapp-mobile:py-14 max-snapp-compact:px-4",
        className,
      )}
      data-slot="snapp-catalogue-hero"
      {...props}
    >
      <div className="mx-auto flex w-full max-w-snapp-content flex-col items-start gap-12 max-snapp-mobile:gap-8">
        <div className="flex w-full flex-col items-center gap-6 text-center">
          <div className="flex w-full flex-col items-center gap-1">
            <h1 className="m-0 font-snapp-body text-5xl font-extralight leading-snapp-2xl text-snapp-text-brand max-snapp-mobile:text-snapp-display-sm max-snapp-mobile:leading-snapp-display">
              {title}
            </h1>
            <p className="m-0 text-lg font-normal leading-snapp-xs text-snapp-text-primary/80 max-snapp-mobile:max-w-170 max-snapp-mobile:leading-6">
              {description}
            </p>
          </div>
          <form
            className="box-border flex h-14 w-full items-center gap-3 rounded-full border border-snapp-card-border bg-snapp-surface-primary px-6 text-snapp-text-soft transition-[border-color,box-shadow] focus-within:border-snapp-border-brand focus-within:shadow-[0_0_0_3px_rgb(47_69_92/8%)]"
            role="search"
            onSubmit={submitSearch}
          >
            <input
              aria-label={searchLabel}
              className="min-w-0 flex-1 cursor-text border-0 bg-transparent text-base font-normal leading-normal text-snapp-text-primary outline-0 placeholder:text-snapp-text-soft"
              placeholder={searchPlaceholder}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              aria-label={searchLabel}
              className="grid size-5 cursor-pointer place-items-center border-0 bg-transparent p-0 text-snapp-text-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snapp-brand-primary"
              type="submit"
            >
              <Search size={20} strokeWidth={1.8} />
            </button>
          </form>
        </div>
        <div
          className="flex w-full flex-wrap items-start gap-6"
          data-slot="snapp-catalogue-hero-items"
        >
          {children}
        </div>
      </div>
    </section>
  )
}

export { CatalogueHero }
export type { CatalogueHeroProps }
