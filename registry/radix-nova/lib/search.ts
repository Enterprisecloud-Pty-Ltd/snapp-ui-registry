type SearchValue = boolean | number | string | null | undefined

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase()
}

function matchesSearch(query: string, values: readonly SearchValue[]) {
  const normalizedQuery = normalizeSearch(query)
  if (!normalizedQuery) return true

  const searchableValue = normalizeSearch(
    values.filter((value) => value != null).join(" ")
  )
  return normalizedQuery
    .split(/\s+/)
    .every((word) => searchableValue.includes(word))
}

function filterSearchCollection<T>(
  items: readonly T[],
  query: string,
  getValues: (item: T) => readonly SearchValue[]
) {
  return items.filter((item) => matchesSearch(query, getValues(item)))
}

export { filterSearchCollection, matchesSearch, normalizeSearch }
export type { SearchValue }
