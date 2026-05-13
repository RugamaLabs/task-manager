import { useEffect, useState, useSyncExternalStore } from 'react';
import uuid from 'react-native-uuid';

import { STORAGE_KEYS, getItem, setItem } from '@/lib/storage';
import type { Category } from '@/lib/types';

const SEED_NAMES: readonly string[] = ['Hogar', 'Trabajo', 'Personal', 'Proyectos'];

// Store compartido a nivel de módulo.
let categoriesState: Category[] = [];
let categoriesInitialized = false;
let initPromise: Promise<void> | null = null;
const categoriesListeners = new Set<() => void>();

function notifyCategories() {
  for (const l of categoriesListeners) l();
}

function makeSeeds(): Category[] {
  return SEED_NAMES.map((name) => ({ id: uuid.v4() as string, name }));
}

function initCategoriesIfNeeded(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const stored = await getItem<Category[] | null>(STORAGE_KEYS.categories, null);
    if (stored == null) {
      categoriesState = makeSeeds();
      setItem(STORAGE_KEYS.categories, categoriesState);
    } else {
      categoriesState = stored;
    }
    categoriesInitialized = true;
    notifyCategories();
  })();
  return initPromise;
}

function persistCategories() {
  setItem(STORAGE_KEYS.categories, categoriesState);
}

export function addCategory(name: string): Category | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const existing = categoriesState.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) return existing;
  const created: Category = { id: uuid.v4() as string, name: trimmed };
  categoriesState = [...categoriesState, created];
  persistCategories();
  notifyCategories();
  return created;
}

export function removeCategory(id: string) {
  categoriesState = categoriesState.filter((c) => c.id !== id);
  persistCategories();
  notifyCategories();
}

function subscribeCategories(cb: () => void) {
  categoriesListeners.add(cb);
  return () => {
    categoriesListeners.delete(cb);
  };
}

function getCategoriesSnapshot() {
  return categoriesState;
}

/**
 * Hook de categorías de tareas con `useSyncExternalStore`.
 * Hidrata una sola vez desde AsyncStorage (seeds Hogar/Trabajo/Personal/Proyectos si está vacío)
 * y propaga cualquier cambio a todos los consumidores en tiempo real.
 *
 * Las tareas cuya categoría se elimina quedan "huérfanas": conservan su nombre y la pantalla
 * de Tasks las sigue mostrando bajo ese grupo.
 */
export function useCategories() {
  const categories = useSyncExternalStore(subscribeCategories, getCategoriesSnapshot);
  const [loading, setLoading] = useState(!categoriesInitialized);

  useEffect(() => {
    if (categoriesInitialized) {
      setLoading(false);
      return;
    }
    let active = true;
    initCategoriesIfNeeded().then(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { categories, loading, addCategory, removeCategory };
}
