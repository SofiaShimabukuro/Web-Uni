import { api } from "./client";

interface Paginado<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type TipoEvento = "clase" | "parcial" | "final" | "entrega" | "personal";
export type RepeticionEvento = "ninguna" | "semanal";

export interface EventoCalendario {
  id: number;
  materia: number | null;
  materia_nombre: string | null;
  titulo: string;
  descripcion: string;
  tipo: TipoEvento;
  fecha: string;
  todo_el_dia: boolean;
  hora_inicio: string | null;
  hora_fin: string | null;
  lugar: string;
  repeticion: RepeticionEvento;
  repetir_hasta: string | null;
  cantidad_apuntes: number;
}

export type NuevoEvento = Omit<EventoCalendario, "id" | "materia_nombre" | "cantidad_apuntes">;

export async function obtenerEventos() {
  const { data } = await api.get<Paginado<EventoCalendario>>("/eventos/");
  return data.results;
}

export async function crearEvento(evento: NuevoEvento) {
  const { data } = await api.post<EventoCalendario>("/eventos/", evento);
  return data;
}

export async function actualizarEvento(id: number, evento: NuevoEvento) {
  const { data } = await api.put<EventoCalendario>(`/eventos/${id}/`, evento);
  return data;
}

export async function eliminarEvento(id: number) {
  await api.delete(`/eventos/${id}/`);
}

/** De dónde sale cada entrada del calendario: solo "evento" es editable acá. */
export type OrigenAgenda = "evento" | "bloque_estudio" | "entrega" | "mesa_examen";

export interface ItemAgenda {
  origen: OrigenAgenda;
  id: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  todo_el_dia: boolean;
  lugar: string;
  materia: number | null;
  materia_nombre: string | null;
  editable: boolean;
}

export async function obtenerAgenda(desde: string, hasta: string) {
  const { data } = await api.get<ItemAgenda[]>("/agenda/", { params: { desde, hasta } });
  return data;
}

export type TipoApunte = "apunte" | "grabacion" | "enlace";
export type VisibilidadApunte = "privado" | "comision";

export interface Apunte {
  id: number;
  materia: number | null;
  materia_nombre: string | null;
  evento: number | null;
  evento_titulo: string | null;
  titulo: string;
  descripcion: string;
  tipo: TipoApunte;
  archivo_url: string | null;
  nombre_archivo: string;
  tamano_bytes: number | null;
  enlace: string;
  visibilidad: VisibilidadApunte;
  autor: string;
  es_propio: boolean;
  creado_en: string;
}

export interface NuevoApunte {
  titulo: string;
  descripcion: string;
  tipo: TipoApunte;
  materia: number | null;
  evento: number | null;
  visibilidad: VisibilidadApunte;
  enlace: string;
  archivo: File | null;
}

export interface FiltrosApuntes {
  propios?: boolean;
  materia?: number;
  evento?: number;
  tipo?: TipoApunte;
}

export async function obtenerApuntes(filtros: FiltrosApuntes = {}) {
  const { data } = await api.get<Paginado<Apunte>>("/apuntes/", { params: filtros });
  return data.results;
}

export async function crearApunte(apunte: NuevoApunte) {
  const cuerpo = new FormData();
  cuerpo.append("titulo", apunte.titulo);
  cuerpo.append("descripcion", apunte.descripcion);
  cuerpo.append("tipo", apunte.tipo);
  cuerpo.append("visibilidad", apunte.visibilidad);
  if (apunte.materia !== null) cuerpo.append("materia", String(apunte.materia));
  if (apunte.evento !== null) cuerpo.append("evento", String(apunte.evento));
  if (apunte.enlace) cuerpo.append("enlace", apunte.enlace);
  if (apunte.archivo) cuerpo.append("archivo", apunte.archivo);
  const { data } = await api.post<Apunte>("/apuntes/", cuerpo);
  return data;
}

export async function actualizarVisibilidadApunte(id: number, visibilidad: VisibilidadApunte) {
  const { data } = await api.patch<Apunte>(`/apuntes/${id}/`, { visibilidad });
  return data;
}

export async function eliminarApunte(id: number) {
  await api.delete(`/apuntes/${id}/`);
}

/** Trae el archivo como blob.
 *
 * Los archivos no se sirven desde una URL pública: van por un endpoint que
 * valida permisos con la cookie de sesión, así que se piden por XHR (que sí
 * manda la cookie) y se convierten en object URL para descargar o reproducir.
 */
export async function descargarArchivoApunte(apunte: Apunte) {
  const { data } = await api.get<Blob>(`/apuntes/${apunte.id}/archivo/`, {
    responseType: "blob",
  });
  return URL.createObjectURL(data);
}
