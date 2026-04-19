/**
 * Firestore collection name constants.
 * All collection names used in the application come from this file — never hardcoded strings.
 * Names match SPEC/entities.md exactly (G04, ADR-02b).
 */
export const COLLECTIONS = {
  usuarios: 'users',
  residentes: 'residents',
  tareas: 'tasks',
  /** @deprecated use `incidences` (English canonical key, DT-09) */
  incidencias: 'incidences',
  incidences: 'incidences',
  turnos: 'shifts',
} as const

export type CollectionName = keyof typeof COLLECTIONS
