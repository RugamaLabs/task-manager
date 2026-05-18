import { useEffect, useState, useSyncExternalStore } from 'react';
import uuid from 'react-native-uuid';

import { STORAGE_KEYS, getItem, setItem } from '@/lib/storage';
import type { Event } from '@/lib/types';

// Store compartido (mismo patrón validado en Fase 3.1).
let eventsState: Event[] = [];
let eventsInitialized = false;
let initPromise: Promise<void> | null = null;
const eventsListeners = new Set<() => void>();

function notifyEvents() {
  for (const l of eventsListeners) l();
}

function initEventsIfNeeded(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    eventsState = await getItem<Event[]>(STORAGE_KEYS.events, []);
    eventsInitialized = true;
    notifyEvents();
  })();
  return initPromise;
}

function persistEvents() {
  setItem(STORAGE_KEYS.events, eventsState);
}

export function addEvent({ title, date }: { title: string; date: string }): Event | null {
  const trimmed = title.trim();
  if (!trimmed) return null;
  const event: Event = {
    id: uuid.v4() as string,
    title: trimmed,
    date,
  };
  // Insertar ordenado por fecha para evitar resortear en cada render.
  const next = [...eventsState, event].sort((a, b) => a.date.localeCompare(b.date));
  eventsState = next;
  persistEvents();
  notifyEvents();
  return event;
}

export function removeEvent(id: string) {
  eventsState = eventsState.filter((e) => e.id !== id);
  persistEvents();
  notifyEvents();
}

function subscribeEvents(cb: () => void) {
  eventsListeners.add(cb);
  return () => {
    eventsListeners.delete(cb);
  };
}

function getEventsSnapshot() {
  return eventsState;
}

/** Hook de eventos del usuario. MVP: solo crear y borrar; sin pantalla dedicada. */
export function useEvents() {
  const events = useSyncExternalStore(subscribeEvents, getEventsSnapshot);
  const [loading, setLoading] = useState(!eventsInitialized);

  useEffect(() => {
    if (eventsInitialized) {
      setLoading(false);
      return;
    }
    let active = true;
    initEventsIfNeeded().then(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { events, loading, addEvent, removeEvent };
}
