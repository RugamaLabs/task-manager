import { useEffect, useState, useSyncExternalStore } from 'react';
import uuid from 'react-native-uuid';

import { STORAGE_KEYS, getItem, setItem } from '@/lib/storage';
import type { Habit } from '@/lib/types';

// Store compartido a nivel de módulo (mismo patrón que `useTasks` / `useCategories`).
let habitsState: Habit[] = [];
let habitsInitialized = false;
let initPromise: Promise<void> | null = null;
const habitsListeners = new Set<() => void>();

function notifyHabits() {
  for (const l of habitsListeners) l();
}

function initHabitsIfNeeded(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    habitsState = await getItem<Habit[]>(STORAGE_KEYS.habits, []);
    habitsInitialized = true;
    notifyHabits();
  })();
  return initPromise;
}

function persistHabits() {
  setItem(STORAGE_KEYS.habits, habitsState);
}

export function addHabit(name: string): Habit | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const habit: Habit = {
    id: uuid.v4() as string,
    name: trimmed,
    createdAt: new Date().toISOString(),
    checkins: [],
  };
  habitsState = [habit, ...habitsState];
  persistHabits();
  notifyHabits();
  return habit;
}

export function removeHabit(id: string) {
  habitsState = habitsState.filter((h) => h.id !== id);
  persistHabits();
  notifyHabits();
}

/** Alterna la marca de un hábito en una fecha (`YYYY-MM-DD`). */
export function toggleCheckin(id: string, dateISO: string) {
  habitsState = habitsState.map((h) => {
    if (h.id !== id) return h;
    const has = h.checkins.includes(dateISO);
    return {
      ...h,
      checkins: has ? h.checkins.filter((d) => d !== dateISO) : [...h.checkins, dateISO],
    };
  });
  persistHabits();
  notifyHabits();
}

function subscribeHabits(cb: () => void) {
  habitsListeners.add(cb);
  return () => {
    habitsListeners.delete(cb);
  };
}

function getHabitsSnapshot() {
  return habitsState;
}

/**
 * Hook CRUD de hábitos. La racha (`streak`) NO se almacena: se calcula a demanda
 * a partir de `checkins` con `calculateStreak()` (ver `lib/streak.ts`). Así no hay
 * caché que invalidar cuando cambia la fecha del sistema.
 */
export function useHabits() {
  const habits = useSyncExternalStore(subscribeHabits, getHabitsSnapshot);
  const [loading, setLoading] = useState(!habitsInitialized);

  useEffect(() => {
    if (habitsInitialized) {
      setLoading(false);
      return;
    }
    let active = true;
    initHabitsIfNeeded().then(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { habits, loading, addHabit, removeHabit, toggleCheckin };
}
