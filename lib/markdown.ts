/**
 * Helpers para construir, exportar y compartir el contenido Markdown de un Post.
 *
 * - `slugify`: convierte un título a un nombre de archivo seguro.
 * - `buildMarkdown`: arma el contenido completo del archivo (título como h1 + descripción).
 * - `sharePostAsMarkdown`: escribe un archivo temporal en `cacheDirectory` y abre la hoja
 *   de compartir nativa. Si la hoja no está disponible (simulador, Expo Go en ciertos
 *   casos), cae al portapapeles con aviso.
 * - `copyPostMarkdownToClipboard`: copia el contenido al portapapeles.
 */
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

import type { Post } from './types';

/** Slug seguro para nombre de archivo: minúsculas, sin acentos, separado por guiones. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'post';
}

/** Compone el archivo `.md` final: título como h1 + línea en blanco + descripción. */
export function buildMarkdown(post: Pick<Post, 'title' | 'description'>): string {
  const title = post.title.trim() || 'Sin título';
  const body = post.description.trim();
  return body ? `# ${title}\n\n${body}\n` : `# ${title}\n`;
}

/**
 * Escribe el post en `cacheDirectory/{slug}.md` y abre la hoja de compartir del sistema.
 * Devuelve `true` si la hoja se abrió; `false` si tuvo que caer al portapapeles.
 */
export async function sharePostAsMarkdown(
  post: Pick<Post, 'title' | 'description'>,
): Promise<boolean> {
  const content = buildMarkdown(post);
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    await Clipboard.setStringAsync(content);
    Alert.alert(
      'Compartir no disponible',
      'No se pudo abrir la hoja de compartir; el markdown se copió al portapapeles.',
    );
    return false;
  }

  const filename = `${slugify(post.title)}.md`;
  const path = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await Sharing.shareAsync(path, {
    mimeType: 'text/markdown',
    dialogTitle: post.title || 'Compartir post',
    UTI: 'net.daringfireball.markdown',
  });
  return true;
}

/** Copia el markdown del post al portapapeles del dispositivo. */
export async function copyPostMarkdownToClipboard(
  post: Pick<Post, 'title' | 'description'>,
): Promise<void> {
  const content = buildMarkdown(post);
  await Clipboard.setStringAsync(content);
}

/** Devuelve la descripción sin caracteres markdown (para búsqueda y truncado en cards). */
export function stripMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, '') // bloques de código
    .replace(/`([^`]+)`/g, '$1') // código inline
    .replace(/^#{1,6}\s+/gm, '') // headers
    .replace(/^-\s+/gm, '') // viñetas
    .replace(/\s+/g, ' ')
    .trim();
}
