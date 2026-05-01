/**
 * tareaToCalendarEvent.ts — Maps a TareaResponse to a FullCalendar EventInput.
 *
 * US-03: Consulta de agenda diaria
 * US-12: Vista de agenda semanal
 *
 * Design: openspec/changes/dashboard-and-tasks-view/design.md §"FullCalendar event mapping"
 */
import type { TareaResponse } from '@/business/agenda/domain/entities/tarea.types'
import type { EventInput } from '@fullcalendar/core'

/**
 * Maps a TareaResponse domain entity to FullCalendar's EventInput format.
 *
 * - id       → tarea.id
 * - title    → tarea.titulo
 * - start    → tarea.fechaHora (ISO string)
 * - end      → fechaHora + 30 min default duration
 * - className→ CSS classes derived from tipo + estado (e.g. "fc-event--higiene fc-event--pendiente")
 * - extendedProps → full tarea object for detail panel access
 */
export function tareaToCalendarEvent(tarea: TareaResponse): EventInput {
  const fechaHoraDate = new Date(tarea.fechaHora)
  const endDate = new Date(fechaHoraDate.getTime() + 30 * 60000)

  return {
    id: tarea.id,
    title: tarea.titulo,
    start: tarea.fechaHora,
    end: endDate.toISOString(),
    classNames: [`fc-event--${tarea.tipo}`, `fc-event--${tarea.estado}`],
    extendedProps: {
      tarea,
    },
  }
}
