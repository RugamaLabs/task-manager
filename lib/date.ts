/**
 * Helpers de fecha. La semana empieza en lunes (formato L M X J V S D).
 * Las fechas "de día" se manejan como strings `YYYY-MM-DD` para evitar problemas de zona horaria.
 */
import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

/** Etiquetas de los días de la semana, de lunes a domingo. */
export const weekdayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

/** Fecha de hoy en formato `YYYY-MM-DD` (hora local). */
export function todayISODate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Convierte una `Date` a string `YYYY-MM-DD`. */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Los 7 días de la semana actual, de lunes a domingo.
 * Cada entrada incluye el `Date`, su clave `iso` (`YYYY-MM-DD`), el número de día y la etiqueta.
 */
export function currentWeekDays(reference: Date = new Date()): {
  date: Date;
  iso: string;
  dayOfMonth: number;
  label: string;
}[] {
  const monday = startOfWeek(reference, { weekStartsOn: 1 });
  return weekdayLabels.map((label, index) => {
    const date = addDays(monday, index);
    return { date, iso: toISODate(date), dayOfMonth: date.getDate(), label };
  });
}

/** Formato corto legible de una fecha ISO, p. ej. `2023-10-15` → `15 oct 2023`. */
export function formatShortDate(iso: string): string {
  try {
    return format(parseISO(iso), 'd MMM yyyy');
  } catch {
    return iso;
  }
}

/** `true` si la fecha ISO corresponde a hoy. */
export function isToday(iso: string): boolean {
  return iso.slice(0, 10) === todayISODate();
}

/**
 * Hora del día en formato `"9:28 p.m."` (12 horas, minúsculas con puntos).
 * Robusto a horas 0 y 12: `0:00` → `12:00 a.m.`, `12:00` → `12:00 p.m.`.
 */
export function formatTimeOfDay(iso: string): string {
  const d = parseISO(iso);
  const hours = d.getHours();
  const isPm = hours >= 12;
  const h12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${h12}:${minutes} ${isPm ? 'p.m.' : 'a.m.'}`;
}

/**
 * Header de día en formato `"1 de diciembre de 2024 · dom"` (locale español).
 * Quita el punto final que date-fns añade al día de semana abreviado (`dom.` → `dom`).
 */
export function formatDayHeader(iso: string): string {
  const d = parseISO(iso);
  const long = format(d, "d 'de' MMMM 'de' yyyy", { locale: es });
  const dow = format(d, 'EEE', { locale: es }).toLowerCase().replace(/\.$/, '');
  return `${long} · ${dow}`;
}
