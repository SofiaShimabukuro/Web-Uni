import { api } from "./client";

interface Paginado<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type TipoMesa = "final" | "recuperatorio";

export interface MesaExamen {
  id: number;
  materia: number;
  docente: number;
  fecha: string;
  tipo: TipoMesa;
}

export type EstadoInscripcionMesa = "inscripto" | "ausente" | "aprobado" | "desaprobado";

export interface AlumnoResumen {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface InscripcionMesa {
  id: number;
  alumno: number;
  alumno_detalle: AlumnoResumen;
  mesa: number;
  fecha_inscripcion: string;
  estado: EstadoInscripcionMesa;
  nota: string | null;
}

export type TipoSolicitudTramite =
  | "certificado_alumno_regular"
  | "certificado_analitico"
  | "constancia_titulo_en_tramite";

export type EstadoSolicitudTramite = "pendiente" | "emitido" | "rechazado";

export interface SolicitudTramite {
  id: number;
  alumno: number;
  tipo: TipoSolicitudTramite;
  fecha_solicitud: string;
  estado: EstadoSolicitudTramite;
  observaciones: string;
}

export interface EntradaLegajo {
  materia_codigo: string;
  materia_nombre: string;
  origen: "comision" | "mesa";
  periodo: string;
  nota: string | null;
}

export async function obtenerMesasExamen() {
  const { data } = await api.get<Paginado<MesaExamen>>("/mesas-examen/");
  return data.results;
}

export async function crearMesaExamen(mesa: Omit<MesaExamen, "id">) {
  const { data } = await api.post<MesaExamen>("/mesas-examen/", mesa);
  return data;
}

export async function obtenerMisInscripcionesMesa() {
  const { data } = await api.get<Paginado<InscripcionMesa>>("/inscripciones-mesa/");
  return data.results;
}

export async function obtenerInscripcionesDeMesa(mesaId: number) {
  const { data } = await api.get<Paginado<InscripcionMesa>>("/inscripciones-mesa/", {
    params: { mesa: mesaId },
  });
  return data.results;
}

export async function inscribirseAMesa(mesaId: number) {
  const { data } = await api.post<InscripcionMesa>("/inscripciones-mesa/", { mesa: mesaId });
  return data;
}

export async function calificarInscripcionMesa(
  id: number,
  nota: number,
  estado: "aprobado" | "desaprobado",
) {
  const { data } = await api.patch<InscripcionMesa>(`/inscripciones-mesa/${id}/`, { nota, estado });
  return data;
}

export async function obtenerSolicitudesTramite() {
  const { data } = await api.get<Paginado<SolicitudTramite>>("/solicitudes-tramite/");
  return data.results;
}

export async function crearSolicitudTramite(tipo: TipoSolicitudTramite) {
  const { data } = await api.post<SolicitudTramite>("/solicitudes-tramite/", { tipo });
  return data;
}

export async function resolverSolicitudTramite(id: number, estado: "emitido" | "rechazado") {
  const { data } = await api.patch<SolicitudTramite>(`/solicitudes-tramite/${id}/`, { estado });
  return data;
}

export async function obtenerLegajo() {
  const { data } = await api.get<EntradaLegajo[]>("/legajo/");
  return data;
}
