import { api } from "./client";

export interface AlumnoResumen {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface ComisionResumen {
  id: number;
  materia_codigo: string;
  materia_nombre: string;
  periodo: string;
  aula: string;
  docente_nombre: string;
}

export interface Inscripcion {
  id: number;
  alumno: number;
  alumno_detalle: AlumnoResumen;
  comision: number;
  comision_detalle: ComisionResumen;
  fecha_inscripcion: string;
  estado: "activa" | "abandonada" | "aprobada" | "desaprobada";
}

export interface Modulo {
  id: number;
  comision: number;
  titulo: string;
  orden: number;
}

export interface Recurso {
  id: number;
  modulo: number;
  tipo: "archivo" | "video" | "link" | "texto";
  titulo: string;
  url_o_contenido: string;
  orden: number;
}

export interface Entrega {
  id: number;
  modulo: number;
  titulo: string;
  descripcion: string;
  fecha_limite: string;
  puntaje_maximo: string;
}

export interface EntregaAlumno {
  id: number;
  entrega: number;
  alumno: number;
  alumno_detalle: AlumnoResumen;
  fecha_envio: string | null;
  archivo_url: string;
  nota: string | null;
  estado: "pendiente" | "entregado" | "corregido";
}

export interface Materia {
  id: number;
  carrera: number;
  codigo: string;
  nombre: string;
  creditos: number;
  semestre: number | null;
}

export interface Carrera {
  id: number;
  nombre: string;
}

export interface Comision {
  id: number;
  materia: number;
  docente: number;
  periodo: string;
  cupo: number;
  aula: string;
}

interface Paginado<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function obtenerMisInscripciones() {
  const { data } = await api.get<Paginado<Inscripcion>>("/inscripciones/");
  return data.results;
}

export async function obtenerInscriptosDeComision(comisionId: number) {
  const { data } = await api.get<Paginado<Inscripcion>>("/inscripciones/", {
    params: { comision: comisionId },
  });
  return data.results;
}

export async function obtenerModulosDeComision(comisionId: number) {
  const { data } = await api.get<Paginado<Modulo>>("/modulos/", {
    params: { comision: comisionId },
  });
  return data.results;
}

export async function crearModulo(modulo: Omit<Modulo, "id">) {
  const { data } = await api.post<Modulo>("/modulos/", modulo);
  return data;
}

export async function obtenerRecursosDeModulo(moduloId: number) {
  const { data } = await api.get<Paginado<Recurso>>("/recursos/", {
    params: { modulo: moduloId },
  });
  return data.results;
}

export async function crearRecurso(recurso: Omit<Recurso, "id">) {
  const { data } = await api.post<Recurso>("/recursos/", recurso);
  return data;
}

export async function obtenerEntregasDeModulo(moduloId: number) {
  const { data } = await api.get<Paginado<Entrega>>("/entregas/", {
    params: { modulo: moduloId },
  });
  return data.results;
}

export async function crearEntrega(entrega: Omit<Entrega, "id">) {
  const { data } = await api.post<Entrega>("/entregas/", entrega);
  return data;
}

export async function obtenerEntregasAlumnoDeEntrega(entregaId: number) {
  const { data } = await api.get<Paginado<EntregaAlumno>>("/entregas-alumnos/", {
    params: { entrega: entregaId },
  });
  return data.results;
}

export async function calificarEntregaAlumno(id: number, nota: number) {
  const { data } = await api.patch<EntregaAlumno>(`/entregas-alumnos/${id}/`, {
    nota,
    estado: "corregido",
  });
  return data;
}

/** /materias/ y /carreras/ no están paginados: son catálogos de referencia chicos. */
export async function obtenerMaterias() {
  const { data } = await api.get<Materia[]>("/materias/");
  return data;
}

export async function crearMateria(materia: Omit<Materia, "id">) {
  const { data } = await api.post<Materia>("/materias/", materia);
  return data;
}

export async function obtenerCarreras() {
  const { data } = await api.get<Carrera[]>("/carreras/");
  return data;
}

export async function crearCarrera(nombre: string) {
  const { data } = await api.post<Carrera>("/carreras/", { nombre });
  return data;
}

export async function obtenerComisiones() {
  const { data } = await api.get<Paginado<Comision>>("/comisiones/");
  return data.results;
}

export async function obtenerComision(id: number) {
  const { data } = await api.get<Comision>(`/comisiones/${id}/`);
  return data;
}

export async function crearComision(comision: Omit<Comision, "id">) {
  const { data } = await api.post<Comision>("/comisiones/", comision);
  return data;
}
