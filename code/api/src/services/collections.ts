/**
 * Firestore collection name constants.
 * All collection names used in the application come from this file — never hardcoded strings.
 * Names match SPEC/entities.md exactly (G04, ADR-02b).
 */
export const COLLECTIONS = {
  usuarios: 'users',
  residentes: 'residents',
  tareas: 'tasks',
  incidencias: 'incidencias',
  turnos: 'turnos',
} as const

export type CollectionName = keyof typeof COLLECTIONS
