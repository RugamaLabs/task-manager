/**
 * Wrapper tipado sobre AsyncStorage. Todo acceso a persistencia debe pasar por aquí
 * (ver boundaries en SPEC.md). Los valores se serializan como JSON.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  tasks: '@taskapp/tasks',
  habits: '@taskapp/habits',
  posts: '@taskapp/posts',
  events: '@taskapp/events',
  categories: '@taskapp/categories',
  settings: '@taskapp/settings',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Lee y parsea un valor. Devuelve `fallback` si no existe o si el JSON es inválido. */
export async function getItem<T>(key: StorageKey, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] Error leyendo "${key}":`, error);
    return fallback;
  }
}

/** Serializa y guarda un valor. */
export async function setItem<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] Error guardando "${key}":`, error);
  }
}

/** Elimina una clave. */
export async function removeItem(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] Error borrando "${key}":`, error);
  }
}
