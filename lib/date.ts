/**
 * Helpers de fecha. La semana empieza en lunes (formato L M X J V S D).
 * Las fechas "de día" se manejan como strings `YYYY-MM-DD` para evitar problemas de zona horaria.
 */
import { addDays, format, parseISO, startOfWeek } from 'date-fns';

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
