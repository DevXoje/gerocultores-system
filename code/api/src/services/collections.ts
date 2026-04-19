/**
 * Firestore collection name constants.
 * All collection names used in the application come from this file — never hardcoded strings.
 * Names match SPEC/entities.md exactly (G04, ADR-02b).
 *
 * Key naming: English canonical keys and values.
 * Legacy Spanish keys removed after DT-09 migration.
 */
export const COLLECTIONS = {
  users: 'users',
  residents: 'residents',
  tasks: 'tasks',
  incidences: 'incidences',
  shifts: 'shifts',
} as const

export type CollectionName = keyof typeof COLLECTIONS
