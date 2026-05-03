/**
 * shared/composables/useUrlFilters.ts
 *
 * Generic composable for syncing a typed filter object with URL query params.
 * Validates query param values via Zod safeParse — no type assertions, no `as`.
 *
 * Usage:
 *   const { filters, pushFilters } = useUrlFilters(MyFilterSchema, DEFAULT_FILTERS)
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ZodSchema } from 'zod'

export function useUrlFilters<T extends Record<string, unknown>>(
  schema: ZodSchema<T>,
  defaults: T
) {
  const route = useRoute()
  const router = useRouter()

  // Coerce Vue Router query values: string[] → string, unknown → string
  function coerceQuery(query: Record<string, unknown>): Record<string, string> {
    const coerced: Record<string, string> = {}
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        coerced[key] = value[0] ?? ''
      } else {
        coerced[key] = (value ?? '') as string
      }
    }
    return coerced
  }

  const filters = computed<T>(() => {
    const coerced = coerceQuery(route.query)
    const parsed = schema.safeParse(coerced)
    return parsed.success ? parsed.data : defaults
  })

  function pushFilters(values: Partial<T>): void {
    const current = filters.value
    const next: Record<string, string> = {}

    // Only include fields that differ from defaults (URL cleanup)
    for (const [key, defaultVal] of Object.entries(defaults)) {
      const val =
        key in values
          ? (values as Record<string, unknown>)[key]
          : (current as Record<string, unknown>)[key]
      const def = defaultVal as string
      const str = String(val ?? '')
      if (str !== def) {
        next[key] = str
      }
    }

    router.replace({
      name: route.name as string,
      query: Object.keys(next).length > 0 ? next : undefined,
    })
  }

  return { filters, pushFilters }
}
