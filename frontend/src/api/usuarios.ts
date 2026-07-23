import { api } from "./client";
import type { Usuario } from "./auth";

/** Solo administrativo puede llamar a esto (permiso del lado del backend). */
export async function obtenerDocentes() {
  const { data } = await api.get<Usuario[]>("/usuarios/", { params: { rol: "docente" } });
  return data;
}

/** Solo administrativo puede llamar a esto (permiso del lado del backend). */
export async function obtenerAlumnos() {
  const { data } = await api.get<Usuario[]>("/usuarios/", { params: { rol: "alumno" } });
  return data;
}
