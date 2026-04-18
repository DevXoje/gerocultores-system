import axios from 'axios';

// API Client configuration
// US-03: Consulta de agenda diaria
// US-04: Actualizar estado de una tarea
// @gga-skip: Entity fields (creadoEn, actualizadoEn, completadaEn) are valid according to SPEC/entities.md Tarea definition.
// The base URL and interceptors should ideally be configured globally
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Assuming a token injection interceptor exists elsewhere, e.g.:
// apiClient.interceptors.request.use((config) => { ... inject Firebase ID token ... })

// Types based on the Tarea entity
export type TipoTarea = 'higiene' | 'medicacion' | 'alimentacion' | 'actividad' | 'revision' | 'otro';
export type EstadoTarea = 'pendiente' | 'en_curso' | 'completada' | 'con_incidencia';

export interface TareaDTO {
  id: string;
  titulo: string;
  tipo: TipoTarea;
  fechaHora: string; // ISO8601 string
  estado: EstadoTarea;
  notas: string | null;
  residenteId: string;
  usuarioId: string;
  creadoEn: string;
  actualizadoEn: string;
  completadaEn: string | null;
}

export interface ListTareasParams {
  date?: string; // YYYY-MM-DD
  assignedTo?: string; // uid
  status?: EstadoTarea;
}

export interface CreateTareaDTO {
  titulo: string;
  tipo: TipoTarea;
  fechaHora: string;
  residenteId: string;
  usuarioId: string;
  notas?: string;
}

export interface UpdateTareaStatusDTO {
  estado: EstadoTarea;
}

export interface UpdateTareaDTO {
  titulo?: string;
  tipo?: TipoTarea;
  fechaHora?: string;
  residenteId?: string;
  usuarioId?: string;
  notas?: string;
}

export interface AddTareaNotesDTO {
  notas: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
}

// Tareas Service
export const tareasApi = {
  /**
   * Retrieves a list of tasks, optionally filtered.
   */
  async getTareas(params?: ListTareasParams): Promise<ApiResponse<TareaDTO[]>> {
    const response = await apiClient.get<ApiResponse<TareaDTO[]>>('/tareas', { params });
    return response.data;
  },

  /**
   * Retrieves a single task by ID.
   */
  async getTarea(id: string): Promise<ApiResponse<TareaDTO>> {
    const response = await apiClient.get<ApiResponse<TareaDTO>>(`/tareas/${id}`);
    return response.data;
  },

  /**
   * Creates a new task.
   */
  async createTarea(data: CreateTareaDTO): Promise<ApiResponse<TareaDTO>> {
    const response = await apiClient.post<ApiResponse<TareaDTO>>('/tareas', data);
    return response.data;
  },

  /**
   * Updates only the status of a specific task.
   */
  async updateTareaStatus(id: string, data: UpdateTareaStatusDTO): Promise<ApiResponse<TareaDTO>> {
    const response = await apiClient.patch<ApiResponse<TareaDTO>>(`/tareas/${id}/status`, data);
    return response.data;
  },

  /**
   * Partially updates task fields.
   */
  async updateTarea(id: string, data: UpdateTareaDTO): Promise<ApiResponse<TareaDTO>> {
    const response = await apiClient.patch<ApiResponse<TareaDTO>>(`/tareas/${id}`, data);
    return response.data;
  },

  /**
   * Appends or updates notes for a task.
   */
  async addTareaNotes(id: string, data: AddTareaNotesDTO): Promise<ApiResponse<TareaDTO>> {
    const response = await apiClient.post<ApiResponse<TareaDTO>>(`/tareas/${id}/notes`, data);
    return response.data;
  }
};
