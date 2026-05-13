import { useEffect, useState } from 'react';
import uuid from 'react-native-uuid';

import { STORAGE_KEYS, getItem, setItem } from '@/lib/storage';
import type { Category } from '@/lib/types';

const SEED_NAMES: readonly string[] = ['Hogar', 'Trabajo', 'Personal', 'Proyectos'];

// Store compartido a nivel de módulo: una sola fuente de verdad para todas las pantallas
// que consumen `useCategories`. Evita que cada montaje del hook lea de storage por su cuenta
// y se desincronice del resto cuando se crea/borra una categoría desde un modal.
let categoriesState: Category[] = [];
let categoriesInitialized = false;
const categoriesListeners = new Set<() => void>();

function notifyCategories() {
  for (const l of categoriesListeners) l();
}

function makeSeeds(): Category[] {
  return SEED_NAMES.map((name) => ({ id: uuid.v4() as string, name }));
}

async function initCategoriesIfNeeded() {
  if (categoriesInitialized) return;
  const stored = await getItem<Category[] | null>(STORAGE_KEYS.categories, null);
  if (stored == null) {
    categoriesState = makeSeeds();
    setItem(STORAGE_KEYS.categories, categoriesState);
  } else {
    categoriesState = stored;
  }
  categoriesInitialized = true;
  notifyCategories();
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

/**
 * Hook de categorías de tareas. Hidrata una sola vez desde AsyncStorage (la primera vez
 * siembra Hogar/Trabajo/Personal/Proyectos) y mantiene un store compartido entre todos
 * los consumidores: agregar/borrar desde un modal se ve inmediatamente en la pantalla.
 *
 * Las tareas cuya categoría se elimina quedan "huérfanas": conservan su nombre y la
 * pantalla de Tasks las sigue mostrando bajo ese grupo.
 */
export function useCategories() {
  const [, setVersion] = useState(0);
  const [loading, setLoading] = useState(!categoriesInitialized);

  useEffect(() => {
    const listener = () => {
      setVersion((v) => v + 1);
      if (categoriesInitialized) setLoading(false);
    };
    categoriesListeners.add(listener);
    if (!categoriesInitialized) {
      initCategoriesIfNeeded();
    } else {
      setLoading(false);
    }
    return () => {
      categoriesListeners.delete(listener);
    };
  }, []);

  return { categories: categoriesState, loading, addCategory, removeCategory };
}
