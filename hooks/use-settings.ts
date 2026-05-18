import { useEffect, useState, useSyncExternalStore } from 'react';

import { STORAGE_KEYS, getItem, setItem } from '@/lib/storage';
import type { PostViewMode, Settings } from '@/lib/types';

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  postViewMode: 'card',
};

let settingsState: Settings = DEFAULT_SETTINGS;
let settingsInitialized = false;
let initPromise: Promise<void> | null = null;
const settingsListeners = new Set<() => void>();

function notifySettings() {
  for (const l of settingsListeners) l();
}

function initSettingsIfNeeded(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const stored = await getItem<Partial<Settings>>(STORAGE_KEYS.settings, {});
    settingsState = { ...DEFAULT_SETTINGS, ...stored };
    settingsInitialized = true;
    notifySettings();
  })();
  return initPromise;
}

function persistSettings() {
  setItem(STORAGE_KEYS.settings, settingsState);
}

export function setPostViewMode(mode: PostViewMode) {
  settingsState = { ...settingsState, postViewMode: mode };
  persistSettings();
  notifySettings();
}

export function setThemePreference(theme: Settings['theme']) {
  settingsState = { ...settingsState, theme };
  persistSettings();
  notifySettings();
}

function subscribeSettings(cb: () => void) {
  settingsListeners.add(cb);
  return () => {
    settingsListeners.delete(cb);
  };
}

function getSettingsSnapshot() {
  return settingsState;
}

/**
 * Hook de preferencias persistidas en `@taskapp/settings`.
 * Comparte el store con futuras claves (p. ej. el tema de la Fase 8).
 */
export function useSettings() {
  const settings = useSyncExternalStore(subscribeSettings, getSettingsSnapshot);
  const [loading, setLoading] = useState(!settingsInitialized);

  useEffect(() => {
    if (settingsInitialized) {
      setLoading(false);
      return;
    }
    let active = true;
    initSettingsIfNeeded().then(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading, setPostViewMode, setThemePreference };
}
