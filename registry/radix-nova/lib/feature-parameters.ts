import { z } from "zod"

const booleanParameterSchema = z.enum(["true", "false"])

function resolveBooleanParameter(
  params: URLSearchParams,
  name: string,
  defaultValue = true,
) {
  const value = params.get(name)
  if (value === null) return defaultValue

  const result = booleanParameterSchema.safeParse(value.trim().toLowerCase())
  return result.success ? result.data === "true" : defaultValue
}

function resolveShowNavBar(params: URLSearchParams) {
  return resolveBooleanParameter(params, "showNavBar", true)
}

export { resolveBooleanParameter, resolveShowNavBar }
