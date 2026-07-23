import { api } from "./client";

interface Paginado<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type TipoBloqueEstudio = "estudio" | "repaso" | "entrega" | "examen";
export type EstadoBloqueEstudio = "planificado" | "cumplido" | "salteado";

export interface BloqueEstudio {
  id: number;
  materia: number | null;
  tipo: TipoBloqueEstudio;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: EstadoBloqueEstudio;
}

export type NuevoBloqueEstudio = Omit<BloqueEstudio, "id">;

export async function obtenerBloquesEstudio() {
  const { data } = await api.get<Paginado<BloqueEstudio>>("/bloques-estudio/");
  return data.results;
}

export async function crearBloqueEstudio(bloque: NuevoBloqueEstudio) {
  const { data } = await api.post<BloqueEstudio>("/bloques-estudio/", bloque);
  return data;
}

export async function actualizarEstadoBloqueEstudio(id: number, estado: EstadoBloqueEstudio) {
  const { data } = await api.patch<BloqueEstudio>(`/bloques-estudio/${id}/`, { estado });
  return data;
}

export type FrecuenciaHabito = "diaria" | "semanal" | "dias_especificos";

export interface Habito {
  id: number;
  nombre: string;
  frecuencia: FrecuenciaHabito;
  activo: boolean;
}

export interface RegistroHabito {
  id: number;
  habito: number;
  fecha: string;
  cumplido: boolean;
}

export async function obtenerHabitos() {
  const { data } = await api.get<Paginado<Habito>>("/habitos/");
  return data.results;
}

export async function crearHabito(habito: Omit<Habito, "id" | "activo">) {
  const { data } = await api.post<Habito>("/habitos/", { ...habito, activo: true });
  return data;
}

export async function obtenerRegistroDeHoy(habitoId: number, fechaIso: string) {
  const { data } = await api.get<Paginado<RegistroHabito>>("/registros-habito/", {
    params: { habito: habitoId, fecha: fechaIso },
  });
  return data.results[0] ?? null;
}

export async function marcarRegistroHabito(habitoId: number, fechaIso: string, cumplido: boolean) {
  const { data } = await api.post<RegistroHabito>("/registros-habito/", {
    habito: habitoId,
    fecha: fechaIso,
    cumplido,
  });
  return data;
}

export async function actualizarRegistroHabito(id: number, cumplido: boolean) {
  const { data } = await api.patch<RegistroHabito>(`/registros-habito/${id}/`, { cumplido });
  return data;
}

export interface ItemRepaso {
  id: number;
  materia: number | null;
  recurso: number | null;
  pregunta: string;
  respuesta: string;
  facilidad: string;
  intervalo_dias: number;
  repeticiones: number;
  proxima_fecha_repaso: string;
}

export type Calificacion = "otra_vez" | "dificil" | "bien" | "facil";

export async function obtenerItemsRepasoPendientes() {
  const { data } = await api.get<ItemRepaso[]>("/items-repaso/pendientes/");
  return data;
}

export async function crearItemRepaso(item: { materia: number | null; pregunta: string; respuesta: string }) {
  const { data } = await api.post<ItemRepaso>("/items-repaso/", item);
  return data;
}

export async function registrarSesionRepaso(itemRepasoId: number, calificacion: Calificacion) {
  const { data } = await api.post("/sesiones-repaso/", {
    item_repaso: itemRepasoId,
    calificacion,
  });
  return data;
}

export interface PreguntaAutoevaluacion {
  id: number;
  autoevaluacion: number;
  enunciado: string;
  respuesta_correcta: string;
  respuesta_alumno: string;
  es_correcta: boolean | null;
}

export interface NuevaPregunta {
  enunciado: string;
  respuesta_correcta: string;
}

export interface Autoevaluacion {
  id: number;
  alumno: number;
  materia: number;
  fecha: string;
  puntaje: string | null;
  total_preguntas: number;
  preguntas_detalle: PreguntaAutoevaluacion[];
}

export async function obtenerAutoevaluaciones() {
  const { data } = await api.get<Paginado<Autoevaluacion>>("/autoevaluaciones/");
  return data.results;
}

export async function crearAutoevaluacion(materiaId: number, preguntas: NuevaPregunta[]) {
  const { data } = await api.post<Autoevaluacion>("/autoevaluaciones/", {
    materia: materiaId,
    preguntas,
  });
  return data;
}

export async function responderPregunta(preguntaId: number, respuestaAlumno: string) {
  const { data } = await api.patch<PreguntaAutoevaluacion>(`/preguntas-autoevaluacion/${preguntaId}/`, {
    respuesta_alumno: respuestaAlumno,
  });
  return data;
}
