import { api } from "./client";

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

export async function obtenerModulosDeComision(comisionId: number) {
  const { data } = await api.get<Paginado<Modulo>>("/modulos/", {
    params: { comision: comisionId },
  });
  return data.results;
}

export async function obtenerRecursosDeModulo(moduloId: number) {
  const { data } = await api.get<Paginado<Recurso>>("/recursos/", {
    params: { modulo: moduloId },
  });
  return data.results;
}

export async function obtenerEntregasDeModulo(moduloId: number) {
  const { data } = await api.get<Paginado<Entrega>>("/entregas/", {
    params: { modulo: moduloId },
  });
  return data.results;
}
