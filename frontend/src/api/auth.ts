import { api } from "./client";

export interface Usuario {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  rol: "alumno" | "docente" | "administrativo";
}

export async function obtenerCsrf() {
  await api.get("/auth/csrf/");
}

export async function iniciarSesion(username: string, password: string) {
  const { data } = await api.post<Usuario>("/auth/login/", { username, password });
  return data;
}

export async function cerrarSesion() {
  await api.post("/auth/logout/");
}

export async function obtenerUsuarioActual() {
  const { data } = await api.get<Usuario>("/auth/me/");
  return data;
}
