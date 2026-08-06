export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** AAAA-MM-DD en hora local (a diferencia de toISOString(), que pasa por UTC). */
export function fechaISO(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function desdeISO(iso: string): Date {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

export function sumarDias(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function nombreMes(mes: number): string {
  return MESES[mes];
}

export function formatearFechaLarga(iso: string): string {
  const fecha = desdeISO(iso);
  return `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

export function formatearHora(hora: string | null): string {
  return hora ? hora.slice(0, 5) : "";
}
