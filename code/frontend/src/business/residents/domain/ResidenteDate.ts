/**
 * Domain-level date helpers for resident birth dates and timestamps.
 */
export function calcularEdad(fechaNacimiento: string): number {
  const nacimiento = new Date(fechaNacimiento)
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mesActual = hoy.getMonth()
  const mesNacimiento = nacimiento.getMonth()

  if (
    mesActual < mesNacimiento ||
    (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())
  ) {
    edad -= 1
  }

  return edad
}

export function formatResidenteDateShort(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatResidenteDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
