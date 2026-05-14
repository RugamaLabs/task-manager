/**
 * Cálculo de "racha" (streak) de un hábito: cuántos días consecutivos hasta hoy
 * (o hasta ayer, si hoy todavía no está marcado) lleva el usuario.
 *
 * Función pura: solo recibe el array de fechas marcadas y devuelve un número.
 * Sin acceso a storage ni a estado de React → trivial de testear.
 */
import { addDays, parseISO } from 'date-fns';

import { toISODate, todayISODate } from './date';

/**
 * Cuenta días consecutivos hasta hoy. Si hoy no está marcado pero ayer sí,
 * la racha empieza desde ayer (no se "rompe" hasta que pasa un día completo sin marcar).
 *
 * Ejemplos:
 *   []                              → 0
 *   [hoy]                           → 1
 *   [hoy, ayer, antier]             → 3
 *   [ayer, antier]                  → 2  (hoy aún no marcado, pero ayer sí)
 *   [antier]                        → 0  (ayer no marcado: racha rota)
 *   [hoy, ayer, hace 3 días]        → 2  (hueco rompe; solo cuenta hoy + ayer)
 */
export function calculateStreak(checkins: string[]): number {
  if (checkins.length === 0) return 0;

  const marked = new Set(checkins);
  const today = todayISODate();
  const yesterday = toISODate(addDays(parseISO(today), -1));

  let cursor: string;
  if (marked.has(today)) {
    cursor = today;
  } else if (marked.has(yesterday)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let count = 0;
  while (marked.has(cursor)) {
    count += 1;
    cursor = toISODate(addDays(parseISO(cursor), -1));
  }
  return count;
}
