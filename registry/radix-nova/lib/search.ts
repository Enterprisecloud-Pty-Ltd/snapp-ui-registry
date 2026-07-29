function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase()
}

function matchesSearch(query: string, values: string[]) {
  const normalizedQuery = normalizeSearch(query)
  if (!normalizedQuery) return true

  const searchableValue = normalizeSearch(values.join(" "))
  return normalizedQuery
    .split(/\s+/)
    .every((word) => searchableValue.includes(word))
}

export { matchesSearch, normalizeSearch }
