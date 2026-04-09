/**
 * Firestore collection name constants.
 * All collection names used in the application come from this file — never hardcoded strings.
 * Names match SPEC/entities.md exactly (G04, ADR-02b).
 */
export const COLLECTIONS = {
  usuarios: 'usuarios',
  residentes: 'residentes',
  tareas: 'tareas',
  incidencias: 'incidencias',
  turnos: 'turnos',
} as const

export type CollectionName = keyof typeof COLLECTIONS
