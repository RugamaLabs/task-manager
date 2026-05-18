import { useEffect, useState, useSyncExternalStore } from 'react';
import uuid from 'react-native-uuid';

import { STORAGE_KEYS, getItem, setItem } from '@/lib/storage';
import type { Post } from '@/lib/types';

type CreatePostInput = {
  title: string;
  description: string;
  coverImageUri?: string;
};

// Store compartido a nivel de módulo (mismo patrón validado en la Fase 3.1).
let postsState: Post[] = [];
let postsInitialized = false;
let initPromise: Promise<void> | null = null;
const postsListeners = new Set<() => void>();

function notifyPosts() {
  for (const l of postsListeners) l();
}

function initPostsIfNeeded(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const loaded = await getItem<Post[]>(STORAGE_KEYS.posts, []);
    // Migración Fase 7: `imageUri` legacy → `coverImageUri`.
    let migrated = false;
    const next = loaded.map((p) => {
      const legacyImageUri = (p as Post & { imageUri?: string }).imageUri;
      if (legacyImageUri && !p.coverImageUri) {
        migrated = true;
        const { imageUri: _drop, ...rest } = p as Post & { imageUri?: string };
        void _drop;
        return { ...rest, coverImageUri: legacyImageUri } as Post;
      }
      return p;
    });
    postsState = next;
    if (migrated) {
      setItem(STORAGE_KEYS.posts, postsState);
    }
    postsInitialized = true;
    notifyPosts();
  })();
  return initPromise;
}

function persistPosts() {
  setItem(STORAGE_KEYS.posts, postsState);
}

export function addPost({ title, description, coverImageUri }: CreatePostInput): Post | null {
  const trimmed = title.trim();
  if (!trimmed) return null;
  const now = new Date().toISOString();
  const post: Post = {
    id: uuid.v4() as string,
    title: trimmed,
    description,
    coverImageUri,
    createdAt: now,
    updatedAt: now,
  };
  postsState = [post, ...postsState];
  persistPosts();
  notifyPosts();
  return post;
}

export function editPost(
  id: string,
  patch: Partial<Pick<Post, 'title' | 'description' | 'coverImageUri'>>,
) {
  postsState = postsState.map((p) =>
    p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
  );
  persistPosts();
  notifyPosts();
}

export function removePost(id: string) {
  postsState = postsState.filter((p) => p.id !== id);
  persistPosts();
  notifyPosts();
}

export function getPostById(id: string): Post | undefined {
  return postsState.find((p) => p.id === id);
}

function subscribePosts(cb: () => void) {
  postsListeners.add(cb);
  return () => {
    postsListeners.delete(cb);
  };
}

function getPostsSnapshot() {
  return postsState;
}

/**
 * Hook CRUD de posts (notas en Markdown) con persistencia en AsyncStorage.
 *
 * - `addPost`: `createdAt` y `updatedAt` arrancan iguales.
 * - `editPost`: solo permite cambiar `title`, `description`, `imageUri`; `updatedAt` se refresca.
 * - `getPostById`: lectura puntual (no reactiva) para el modo edición del modal.
 */
export function usePosts() {
  const posts = useSyncExternalStore(subscribePosts, getPostsSnapshot);
  const [loading, setLoading] = useState(!postsInitialized);

  useEffect(() => {
    if (postsInitialized) {
      setLoading(false);
      return;
    }
    let active = true;
    initPostsIfNeeded().then(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { posts, loading, addPost, editPost, removePost, getPostById };
}
