import {
  CreateResidenteDtoSchema,
  type CreateResidenteDto,
  type Residente,
} from '@/business/residents/domain/Residente'

export type ResidentFormData = Partial<
  Pick<
    Residente,
    | 'id'
    | 'nombre'
    | 'apellidos'
    | 'fechaNacimiento'
    | 'habitacion'
    | 'foto'
    | 'diagnosticos'
    | 'alergias'
    | 'medicacion'
    | 'preferencias'
  >
>

export interface ResidentFormDraft {
  nombre: string
  apellidos: string
  fechaNacimiento: string
  habitacion: string
  foto: string
  diagnosticos: string
  alergias: string
  medicacion: string
  preferencias: string
}

export function mapResidenteToFormData(residente: Residente): ResidentFormData {
  return {
    id: residente.id,
    nombre: residente.nombre,
    apellidos: residente.apellidos,
    fechaNacimiento: residente.fechaNacimiento,
    habitacion: residente.habitacion,
    foto: residente.foto,
    diagnosticos: residente.diagnosticos,
    alergias: residente.alergias,
    medicacion: residente.medicacion,
    preferencias: residente.preferencias,
  }
}

export function buildCreateResidenteDtoFromForm(data: ResidentFormDraft): CreateResidenteDto {
  return CreateResidenteDtoSchema.parse({
    nombre: data.nombre.trim(),
    apellidos: data.apellidos.trim(),
    fechaNacimiento: data.fechaNacimiento,
    habitacion: data.habitacion.trim(),
    foto: data.foto.trim() || null,
    diagnosticos: data.diagnosticos.trim() || null,
    alergias: data.alergias.trim() || null,
    medicacion: data.medicacion.trim() || null,
    preferencias: data.preferencias.trim() || null,
  })
}
