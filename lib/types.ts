/**
 * Tipos compartidos del dominio. Todas las entidades persistidas en AsyncStorage
 * usan estas formas. Las fechas se guardan como strings ISO 8601.
 */

export type Task = {
  id: string;
  title: string;
  /** Nombre de la categoría (debe coincidir con una `Category.name`). */
  category: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  dueDate?: string; // ISO 8601, opcional
};

export type Habit = {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
  /** Días marcados, en formato `YYYY-MM-DD`. */
  checkins: string[];
};

export type Post = {
  id: string;
  title: string;
  /** Markdown plano (h1/h2/h3, viñetas, código, imágenes embebidas `![](uri)`). */
  description: string;
  /** URI de la imagen elegida como portada. Si está vacío, se usa la primera del cuerpo. */
  coverImageUri?: string;
  /** @deprecated Campo legacy de la Fase 5. Se migra a `coverImageUri` al hidratar. */
  imageUri?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

export type PostViewMode = 'list' | 'card' | 'gallery';

export type Event = {
  id: string;
  title: string;
  date: string; // ISO 8601
};

export type Category = {
  id: string;
  /** Etiqueta visible y clave usada por `Task.category`. */
  name: string;
};

export type ThemePreference = 'light' | 'dark' | 'system';

export type Settings = {
  theme: ThemePreference;
  postViewMode: PostViewMode;
};
