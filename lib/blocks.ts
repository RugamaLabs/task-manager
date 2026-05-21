/**
 * Modelo de bloques del editor de Posts (estilo Notion) + funciones puras para
 * parsear/serializar Markdown ↔ array de bloques.
 *
 * Storage NO cambia: la fuente de verdad sigue siendo `Post.description: string` (markdown).
 * Los bloques son una representación temporal usada solo durante la edición.
 */
import uuid from 'react-native-uuid';

export type BlockType = 'text' | 'h1' | 'h2' | 'h3' | 'bullet' | 'image' | 'location';

export type BlockLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

export type Block = {
  id: string;
  type: BlockType;
  /** Solo para bloques de texto/heading/bullet. */
  content?: string;
  /** Solo para bloques de tipo `image`. */
  imageUri?: string;
  /** Solo para bloques de tipo `location`. */
  location?: BlockLocation;
};

/** Crea un bloque nuevo del tipo indicado. */
export function makeBlock(type: BlockType, fields: Partial<Block> = {}): Block {
  return {
    id: uuid.v4() as string,
    type,
    content: type === 'image' ? undefined : '',
    ...fields,
  };
}

const RE_H1 = /^# (.*)$/;
const RE_H2 = /^## (.*)$/;
const RE_H3 = /^### (.*)$/;
const RE_BULLET = /^- (.*)$/;
const RE_IMAGE = /^!\[[^\]]*\]\((.+)\)$/;
const RE_LOCATION = /^\[(.+)\]\(geo:(-?[\d.]+),(-?[\d.]+)\)$/;

/**
 * Parsea un string Markdown a una lista de bloques.
 *
 * Reglas:
 * - Líneas `# `, `## `, `### ` → bloques h1/h2/h3 (una línea por bloque).
 * - Líneas `- ` → bloques bullet (uno por línea).
 * - Líneas `![](uri)` → bloque image.
 * - Líneas en blanco separan bloques.
 * - Cualquier otra cosa se agrupa en bloques `text` (líneas consecutivas → un solo bloque).
 *
 * Sintaxis no soportada (negrita, enlaces, código) se conserva como texto crudo dentro
 * de un bloque `text`; al serializar vuelve a salir tal cual.
 */
export function parseMarkdownToBlocks(md: string): Block[] {
  if (!md || !md.trim()) return [];

  const lines = md.split('\n');
  const blocks: Block[] = [];
  let textBuffer: string[] = [];

  const flushText = () => {
    if (textBuffer.length > 0) {
      blocks.push(makeBlock('text', { content: textBuffer.join('\n') }));
      textBuffer = [];
    }
  };

  for (const line of lines) {
    let match: RegExpMatchArray | null;
    if ((match = line.match(RE_H1))) {
      flushText();
      blocks.push(makeBlock('h1', { content: match[1] }));
    } else if ((match = line.match(RE_H2))) {
      flushText();
      blocks.push(makeBlock('h2', { content: match[1] }));
    } else if ((match = line.match(RE_H3))) {
      flushText();
      blocks.push(makeBlock('h3', { content: match[1] }));
    } else if ((match = line.match(RE_IMAGE))) {
      flushText();
      blocks.push(makeBlock('image', { imageUri: match[1] }));
    } else if ((match = line.match(RE_LOCATION))) {
      flushText();
      blocks.push(
        makeBlock('location', {
          location: {
            name: match[1],
            latitude: Number(match[2]),
            longitude: Number(match[3]),
          },
        }),
      );
    } else if ((match = line.match(RE_BULLET))) {
      flushText();
      blocks.push(makeBlock('bullet', { content: match[1] }));
    } else if (line.trim() === '') {
      flushText();
    } else {
      textBuffer.push(line);
    }
  }
  flushText();

  return blocks;
}

/** Serializa una lista de bloques de vuelta a Markdown. */
export function serializeBlocksToMarkdown(blocks: Block[]): string {
  if (blocks.length === 0) return '';

  const parts = blocks.map((b) => {
    switch (b.type) {
      case 'h1':
        return `# ${b.content ?? ''}`;
      case 'h2':
        return `## ${b.content ?? ''}`;
      case 'h3':
        return `### ${b.content ?? ''}`;
      case 'bullet':
        return `- ${b.content ?? ''}`;
      case 'image':
        return `![](${b.imageUri ?? ''})`;
      case 'location':
        return b.location
          ? `[${b.location.name}](geo:${b.location.latitude},${b.location.longitude})`
          : '';
      case 'text':
      default:
        return b.content ?? '';
    }
  });

  // Bullets consecutivos van con un solo `\n`; el resto con doble salto.
  let result = parts[0];
  for (let i = 1; i < blocks.length; i++) {
    const prev = blocks[i - 1];
    const curr = blocks[i];
    const sep = prev.type === 'bullet' && curr.type === 'bullet' ? '\n' : '\n\n';
    result += sep + parts[i];
  }
  return result;
}

/** Devuelve los URIs de todas las imágenes embebidas, en el orden en que aparecen. */
export function imageUrisFromBlocks(blocks: Block[]): string[] {
  return blocks
    .filter((b) => b.type === 'image' && b.imageUri)
    .map((b) => b.imageUri as string);
}

/**
 * Devuelve la URI de la portada efectiva de un post:
 * 1) `coverImageUri` explícito si existe;
 * 2) si no, la primera imagen embebida en `description`;
 * 3) si tampoco hay, `undefined`.
 */
export function resolveCoverImageUri(post: {
  coverImageUri?: string;
  description: string;
}): string | undefined {
  if (post.coverImageUri) return post.coverImageUri;
  const embedded = imageUrisFromBlocks(parseMarkdownToBlocks(post.description));
  return embedded[0];
}

/** Devuelve la primera ubicación embebida en `description`, o `undefined`. */
export function resolvePostLocation(post: { description: string }): BlockLocation | undefined {
  const blocks = parseMarkdownToBlocks(post.description);
  return blocks.find((b) => b.type === 'location')?.location;
}
