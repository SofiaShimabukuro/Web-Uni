import type { ItemAgenda, OrigenAgenda } from "../api/agenda";
import { sumarDias } from "./date";

export const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const SEMANAS_EN_GRILLA = 6;

/** Lunes con el que arranca la grilla del mes (puede caer en el mes anterior). */
export function inicioDeGrilla(anio: number, mes: number): Date {
  const primero = new Date(anio, mes, 1);
  const diasDesdeLunes = (primero.getDay() + 6) % 7;
  return sumarDias(primero, -diasDesdeLunes);
}

/** Las 42 celdas (6 semanas) que dibuja la vista mensual. */
export function diasDeGrilla(anio: number, mes: number): Date[] {
  const inicio = inicioDeGrilla(anio, mes);
  return Array.from({ length: SEMANAS_EN_GRILLA * 7 }, (_, i) => sumarDias(inicio, i));
}

type ColorMui = "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success";

const COLOR_POR_TIPO: Record<string, ColorMui> = {
  clase: "primary",
  parcial: "error",
  final: "error",
  recuperatorio: "error",
  examen: "error",
  entrega: "warning",
  personal: "secondary",
  estudio: "info",
  repaso: "success",
};

export function colorDeItem(item: ItemAgenda): ColorMui {
  return COLOR_POR_TIPO[item.tipo] ?? "default";
}

export const ETIQUETA_ORIGEN: Record<OrigenAgenda, string> = {
  evento: "Mi calendario",
  bloque_estudio: "Planificador",
  entrega: "Entrega de la cursada",
  mesa_examen: "Mesa de examen",
};

export function agruparPorFecha(items: ItemAgenda[]): Map<string, ItemAgenda[]> {
  const porFecha = new Map<string, ItemAgenda[]>();
  for (const item of items) {
    const delDia = porFecha.get(item.fecha);
    if (delDia) delDia.push(item);
    else porFecha.set(item.fecha, [item]);
  }
  return porFecha;
}
